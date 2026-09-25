const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'sweet_haven_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
};

async function initializeDatabase() {
  let connection;
  try {
    // 1. Connect to MySQL server without specifying the target database first
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log(`📡 Connected to MySQL Server at ${dbConfig.host}:${dbConfig.port}. Initializing database & tables...`);

    // 2. Create Database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbConfig.database}\`;`);

    // 3. Create Tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(120) NOT NULL UNIQUE,
        \`phone\` VARCHAR(20) DEFAULT NULL,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('customer', 'admin') DEFAULT 'customer',
        \`status\` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        \`avatar\` VARCHAR(255) DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL UNIQUE,
        \`slug\` VARCHAR(100) NOT NULL UNIQUE,
        \`description\` TEXT,
        \`image\` VARCHAR(255) DEFAULT NULL,
        \`is_active\` BOOLEAN DEFAULT TRUE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`products\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(150) NOT NULL,
        \`category_id\` INT NOT NULL,
        \`description\` TEXT NOT NULL,
        \`image\` VARCHAR(255) DEFAULT NULL,
        \`price\` DECIMAL(10,2) NOT NULL,
        \`discount\` DECIMAL(5,2) DEFAULT 0.00,
        \`stock_quantity\` INT NOT NULL DEFAULT 0,
        \`weight_size\` VARCHAR(50) DEFAULT '500g',
        \`ingredients\` TEXT,
        \`is_available\` BOOLEAN DEFAULT TRUE,
        \`is_featured\` BOOLEAN DEFAULT FALSE,
        \`is_best_seller\` BOOLEAN DEFAULT FALSE,
        \`rating\` DECIMAL(3,2) DEFAULT 5.00,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_product_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`addresses\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`full_name\` VARCHAR(100) NOT NULL,
        \`phone\` VARCHAR(20) NOT NULL,
        \`address_line1\` VARCHAR(255) NOT NULL,
        \`address_line2\` VARCHAR(255) DEFAULT NULL,
        \`city\` VARCHAR(100) NOT NULL,
        \`state\` VARCHAR(100) NOT NULL,
        \`pincode\` VARCHAR(15) NOT NULL,
        \`is_default\` BOOLEAN DEFAULT FALSE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_address_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`orders\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`order_number\` VARCHAR(30) NOT NULL UNIQUE,
        \`user_id\` INT NOT NULL,
        \`total_amount\` DECIMAL(10,2) NOT NULL,
        \`discount_amount\` DECIMAL(10,2) DEFAULT 0.00,
        \`delivery_fee\` DECIMAL(10,2) DEFAULT 0.00,
        \`loyalty_discount\` DECIMAL(10,2) DEFAULT 0.00,
        \`final_amount\` DECIMAL(10,2) NOT NULL,
        \`payment_status\` ENUM('Pending', 'Successful', 'Failed', 'Refunded') DEFAULT 'Pending',
        \`order_status\` ENUM('Order Placed', 'Order Confirmed', 'Preparing', 'Baking', 'Quality Check', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled') DEFAULT 'Order Placed',
        \`delivery_address\` TEXT NOT NULL,
        \`delivery_instructions\` TEXT,
        \`points_earned\` INT DEFAULT 0,
        \`points_redeemed\` INT DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_order_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`order_items\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`order_id\` INT NOT NULL,
        \`product_id\` INT DEFAULT NULL,
        \`product_name\` VARCHAR(150) NOT NULL,
        \`price\` DECIMAL(10,2) NOT NULL,
        \`quantity\` INT NOT NULL,
        \`subtotal\` DECIMAL(10,2) NOT NULL,
        \`customization_details\` JSON DEFAULT NULL,
        CONSTRAINT \`fk_item_order\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_item_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`payments\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`order_id\` INT NOT NULL,
        \`transaction_id\` VARCHAR(100) NOT NULL UNIQUE,
        \`payment_method\` VARCHAR(50) DEFAULT 'Online / Sandbox Gateway',
        \`amount\` DECIMAL(10,2) NOT NULL,
        \`status\` ENUM('Pending', 'Successful', 'Failed', 'Refunded') DEFAULT 'Pending',
        \`gateway_response\` JSON DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_payment_order\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`cart_items\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`product_id\` INT NOT NULL,
        \`quantity\` INT NOT NULL DEFAULT 1,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`user_product_cart\` (\`user_id\`, \`product_id\`),
        CONSTRAINT \`fk_cart_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_cart_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`wishlist\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL UNIQUE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_wishlist_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`wishlist_items\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`wishlist_id\` INT NOT NULL,
        \`product_id\` INT NOT NULL,
        \`added_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY \`user_product_unique\` (\`wishlist_id\`, \`product_id\`),
        CONSTRAINT \`fk_witem_wishlist\` FOREIGN KEY (\`wishlist_id\`) REFERENCES \`wishlist\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_witem_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`loyalty_accounts\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL UNIQUE,
        \`loyalty_card_number\` VARCHAR(30) NOT NULL UNIQUE,
        \`current_points\` INT DEFAULT 0,
        \`total_points_earned\` INT DEFAULT 0,
        \`total_points_redeemed\` INT DEFAULT 0,
        \`tier\` ENUM('Bronze', 'Silver', 'Gold', 'Royal') DEFAULT 'Bronze',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_loyalty_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`loyalty_transactions\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`loyalty_account_id\` INT NOT NULL,
        \`points\` INT NOT NULL,
        \`transaction_type\` ENUM('EARNED', 'REDEEMED', 'BONUS', 'ADMIN_ADJUSTMENT') NOT NULL,
        \`description\` VARCHAR(255) NOT NULL,
        \`reference_order_id\` INT DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_ltrans_account\` FOREIGN KEY (\`loyalty_account_id\`) REFERENCES \`loyalty_accounts\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`coupons\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`code\` VARCHAR(50) NOT NULL UNIQUE,
        \`discount_type\` ENUM('percentage', 'flat') NOT NULL,
        \`discount_value\` DECIMAL(10,2) NOT NULL,
        \`min_order_amount\` DECIMAL(10,2) DEFAULT 0.00,
        \`max_discount_amount\` DECIMAL(10,2) DEFAULT NULL,
        \`is_active\` BOOLEAN DEFAULT TRUE,
        \`expiry_date\` DATE DEFAULT NULL,
        \`usage_limit\` INT DEFAULT 1000,
        \`times_used\` INT DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`offers\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(150) NOT NULL,
        \`description\` TEXT,
        \`banner_image\` VARCHAR(255) DEFAULT NULL,
        \`discount_percentage\` DECIMAL(5,2) DEFAULT 0.00,
        \`start_date\` DATETIME NOT NULL,
        \`end_date\` DATETIME NOT NULL,
        \`is_active\` BOOLEAN DEFAULT TRUE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`notifications\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT DEFAULT NULL,
        \`type\` VARCHAR(50) NOT NULL,
        \`title\` VARCHAR(150) NOT NULL,
        \`message\` TEXT NOT NULL,
        \`is_read\` BOOLEAN DEFAULT FALSE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_notif_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`inventory\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`product_id\` INT NOT NULL UNIQUE,
        \`min_threshold\` INT DEFAULT 10,
        \`last_restocked_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`notes\` TEXT,
        CONSTRAINT \`fk_inv_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`custom_cakes\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`flavour\` VARCHAR(100) NOT NULL,
        \`size\` VARCHAR(50) NOT NULL,
        \`cream\` VARCHAR(100) NOT NULL,
        \`colour\` VARCHAR(50) NOT NULL,
        \`toppings\` VARCHAR(255) DEFAULT NULL,
        \`theme\` VARCHAR(100) DEFAULT NULL,
        \`custom_message\` VARCHAR(150) DEFAULT NULL,
        \`quantity\` INT DEFAULT 1,
        \`estimated_price\` DECIMAL(10,2) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_custom_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`reviews\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`product_id\` INT NOT NULL,
        \`user_id\` INT NOT NULL,
        \`rating\` INT CHECK (rating >= 1 AND rating <= 5),
        \`comment\` TEXT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_rev_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_rev_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`otp_verifications\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`email\` VARCHAR(120) NOT NULL,
        \`otp_code\` VARCHAR(10) NOT NULL,
        \`purpose\` VARCHAR(50) DEFAULT 'SIGNUP_VERIFICATION',
        \`expires_at\` DATETIME NOT NULL,
        \`is_verified\` BOOLEAN DEFAULT FALSE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Views for aliases (admins, customers, loyalty_cards, loyalty_points)
    await connection.query(`
      CREATE OR REPLACE VIEW \`admins\` AS 
      SELECT * FROM \`users\` WHERE \`role\` = 'admin';
    `);

    await connection.query(`
      CREATE OR REPLACE VIEW \`customers\` AS 
      SELECT * FROM \`users\` WHERE \`role\` = 'customer';
    `);

    await connection.query(`
      CREATE OR REPLACE VIEW \`loyalty_cards\` AS 
      SELECT * FROM \`loyalty_accounts\`;
    `);

    await connection.query(`
      CREATE OR REPLACE VIEW \`loyalty_points\` AS 
      SELECT * FROM \`loyalty_transactions\`;
    `);

    // 4. Seed Data if Tables are Empty
    const [userRows] = await connection.query('SELECT COUNT(*) as count FROM `users`');
    if (userRows[0].count === 0) {
      console.log('🌱 Seeding initial users...');
      const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
      const customerPasswordHash = await bcrypt.hash('Admin@123', 10);

      await connection.query(`
        INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`phone\`, \`password\`, \`role\`, \`status\`) VALUES
        (1, 'Sweet Haven Admin', 'admin@sweethaven.com', '+91 9876543210', ?, 'admin', 'active'),
        (2, 'Demo Customer', 'customer@sweethaven.com', '+91 9123456789', ?, 'customer', 'active')
      `, [adminPasswordHash, customerPasswordHash]);
    }

    const [categoryRows] = await connection.query('SELECT COUNT(*) as count FROM `categories`');
    if (categoryRows[0].count === 0) {
      console.log('🌱 Seeding initial categories...');
      await connection.query(`
        INSERT INTO \`categories\` (\`id\`, \`name\`, \`slug\`, \`description\`, \`image\`, \`is_active\`) VALUES
        (1, 'Cakes', 'cakes', 'Handcrafted royal artisan cakes made with rich belgian chocolate & fresh cream', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80', 1),
        (2, 'Chocolates', 'chocolates', 'Luxury handcrafted cocoa truffles & dark chocolate blocks', 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&q=80', 1),
        (3, 'Cupcakes', 'cupcakes', 'Fluffy gourmet cupcakes topped with velvet buttercream', 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&q=80', 1),
        (4, 'Brownies', 'brownies', 'Decadent fudge brownies with walnuts & molten dark chocolate', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80', 1),
        (5, 'Cookies', 'cookies', 'Freshly baked melt-in-the-mouth butter & choc-chip cookies', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80', 1),
        (6, 'Pastries', 'pastries', 'Layered French pastries & delicate fruit tarts', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80', 1),
        (7, 'Donuts', 'donuts', 'Glazed & chocolate filled artisan donuts', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80', 1),
        (8, 'Gift Boxes', 'gift-boxes', 'Curated royal confectionery assortments for special moments', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80', 1),
        (9, 'Birthday Specials', 'birthday-specials', 'Custom celebratory party cakes & delight packages', 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&q=80', 1),
        (10, 'Festival Specials', 'festival-specials', 'Festive gold-wrapped mithai & chocolate hampers', 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=600&q=80', 1);
      `);
    }

    const [productRows] = await connection.query('SELECT COUNT(*) as count FROM \`products\`');
    if (productRows[0].count === 0) {
      console.log('🌱 Seeding initial products & inventory...');
      await connection.query(`
        INSERT INTO \`products\` (\`id\`, \`name\`, \`category_id\`, \`description\`, \`image\`, \`price\`, \`discount\`, \`stock_quantity\`, \`weight_size\`, \`ingredients\`, \`is_available\`, \`is_featured\`, \`is_best_seller\`, \`rating\`) VALUES
        (1, 'Belgian Dark Truffle Cake', 1, 'Rich 70% dark Belgian chocolate ganache layered with moist cocoa sponge cake.', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80', 899.00, 10.00, 25, '1 Kg', 'Belgian Dark Chocolate, Dutch Cocoa, Butter, Flour, Eggs, Vanilla Extract', 1, 1, 1, 4.9),
        (2, 'Royal Red Velvet Cake', 1, 'Authentic crimson red velvet cake with smooth cream cheese frosting & gold leaf flake garnish.', 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600&q=80', 799.00, 5.00, 18, '1 Kg', 'Cocoa, Cream Cheese, Pure Vanilla, Buttermilk, Beetroot extract', 1, 1, 1, 4.8),
        (3, 'Classic Black Forest Cake', 1, 'Traditional German layered chocolate sponge cake with dark cherries & fresh whipped cream.', 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&q=80', 699.00, 0.00, 30, '1 Kg', 'Dark Cherries, Whipped Cream, Chocolate Shavings, Cocoa Sponge', 1, 0, 1, 4.7),
        (4, 'Luxury Hazelnut Praline Truffles Box', 2, 'Box of 16 handcrafted pralines filled with roasted Piedmont hazelnuts & smooth milk chocolate.', 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&q=80', 549.00, 15.00, 50, '300g', 'Roasted Hazelnuts, Cocoa Butter, Milk Solids, Pure Cane Sugar', 1, 1, 1, 4.9),
        (5, 'Salted Caramel Walnut Fudge Brownie', 4, 'Dense gooey dark chocolate brownies drizzled with sea salt caramel & crushed walnuts.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80', 399.00, 0.00, 40, '6 Pieces', '70% Dark Chocolate, Salted Caramel, California Walnuts, Flour', 1, 1, 0, 4.8),
        (6, 'Assorted Gourmet Cupcake Box', 3, 'Box of 6 cupcakes featuring Red Velvet, Dark Chocolate Truffle, and Vanilla Salted Caramel.', 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&q=80', 449.00, 10.00, 35, '6 Units', 'Buttercream, Belgian Cocoa, Madagascar Vanilla, Wheat Flour', 1, 1, 1, 4.8),
        (7, 'Choco Chunk Butter Cookies', 5, 'Golden baked butter cookies loaded with rich chocolate chunks.', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80', 299.00, 5.00, 60, '400g Tiffin', 'Pure French Butter, Dark Choco Chunks, Brown Sugar, Wheat Flour', 1, 0, 1, 4.6),
        (8, 'Royal Celebration Hamper Box', 8, 'Exquisite gold gift box containing Truffle Cake, Assorted Chocolates, & Macarons.', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80', 1499.00, 20.00, 15, '1.5 Kg', 'Assorted Premium Confectionery Items', 1, 1, 1, 5.0);
      `);

      await connection.query(`
        INSERT INTO \`inventory\` (\`product_id\`, \`min_threshold\`, \`notes\`) VALUES
        (1, 8, 'High demand product. Ensure fresh batch every morning.'),
        (2, 5, 'Requires cream cheese inventory tracking.'),
        (3, 10, 'Regular fast mover.'),
        (4, 15, 'Long shelf life confectionery item.'),
        (5, 10, 'Popular pairing with coffee combos.'),
        (6, 10, 'Daily fresh bake limit.'),
        (7, 20, 'Dry confectionery item.'),
        (8, 5, 'Pre-order priority for festive hamper.');
      `);
    }

    const [couponRows] = await connection.query('SELECT COUNT(*) as count FROM `coupons`');
    if (couponRows[0].count === 0) {
      console.log('🌱 Seeding initial coupons...');
      await connection.query(`
        INSERT INTO \`coupons\` (\`code\`, \`discount_type\`, \`discount_value\`, \`min_order_amount\`, \`max_discount_amount\`, \`is_active\`, \`expiry_date\`) VALUES
        ('SWEET10', 'percentage', 10.00, 499.00, 200.00, 1, '2026-12-31'),
        ('ROYAL50', 'flat', 50.00, 399.00, 50.00, 1, '2026-12-31'),
        ('WELCOME100', 'flat', 100.00, 799.00, 100.00, 1, '2026-12-31');
      `);
    }

    const [offerRows] = await connection.query('SELECT COUNT(*) as count FROM `offers`');
    if (offerRows[0].count === 0) {
      console.log('🌱 Seeding initial offers...');
      await connection.query(`
        INSERT INTO \`offers\` (\`title\`, \`description\`, \`banner_image\`, \`discount_percentage\`, \`start_date\`, \`end_date\`, \`is_active\`) VALUES
        ('Royal Festival Feast', 'Get 20% off on all artisan gift boxes and chocolate hampers this festive season!', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80', 20.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1),
        ('Weekend Choco Mania', 'Flat 15% discount on all Belgian Dark chocolate creations & truffle boxes.', 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&q=80', 15.00, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 1);
      `);
    }

    const [loyaltyRows] = await connection.query('SELECT COUNT(*) as count FROM `loyalty_accounts`');
    if (loyaltyRows[0].count === 0) {
      console.log('🌱 Seeding initial loyalty account for demo customer...');
      await connection.query(`
        INSERT INTO \`loyalty_accounts\` (\`user_id\`, \`loyalty_card_number\`, \`current_points\`, \`total_points_earned\`, \`total_points_redeemed\`, \`tier\`) VALUES
        (2, 'SH-LOYAL-2026-0002', 150, 150, 0, 'Silver');
      `);

      await connection.query(`
        INSERT INTO \`loyalty_transactions\` (\`loyalty_account_id\`, \`points\`, \`transaction_type\`, \`description\`) VALUES
        (1, 150, 'BONUS', 'Welcome Loyalty Bonus Points');
      `);
    }

    console.log('✅ MySQL Database and all 18 Tables successfully initialized and verified!');
    return true;
  } catch (error) {
    console.error('❌ Error initializing MySQL Database & Tables:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = {
  initializeDatabase,
  dbConfig
};
