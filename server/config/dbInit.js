const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Import all models
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const LoyaltyAccount = require('../models/LoyaltyAccount');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const Coupon = require('../models/Coupon');
const Offer = require('../models/Offer');
const Notification = require('../models/Notification');

async function initializeDatabase() {
  try {
    console.log('🌱 Checking MongoDB collections and seeding if needed...');

    // Seed Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding initial users...');
      const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'deepaveeraiyan@123', 10);
      const customerPasswordHash = await bcrypt.hash('Customer@123', 10);

      const [adminUser, demoCustomer] = await User.insertMany([
        {
          name: 'Deepaveera Admin',
          email: 'deepaveera3slm@gmail.com',
          phone: '+91 9876543210',
          password: adminPasswordHash,
          role: 'admin',
          status: 'active',
          legacy_id: 1
        },
        {
          name: 'Demo Customer',
          email: 'customer@sweethaven.com',
          phone: '+91 9123456789',
          password: customerPasswordHash,
          role: 'customer',
          status: 'active',
          legacy_id: 2
        }
      ]);

      // Create loyalty account for demo customer
      const loyaltyAcct = await LoyaltyAccount.create({
        user_id: demoCustomer._id,
        loyalty_card_number: 'SH-LOYAL-2026-0002',
        current_points: 150,
        total_points_earned: 150,
        total_points_redeemed: 0,
        tier: 'Silver'
      });

      await LoyaltyTransaction.create({
        loyalty_account_id: loyaltyAcct._id,
        user_id: demoCustomer._id,
        points: 150,
        transaction_type: 'BONUS',
        description: 'Welcome Loyalty Bonus Points'
      });

      console.log('✅ Users seeded.');
    }

    // Seed Categories
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      console.log('🌱 Seeding initial categories...');
      await Category.insertMany([
        { name: 'Cakes', slug: 'cakes', description: 'Handcrafted royal artisan cakes made with rich belgian chocolate & fresh cream', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80', is_active: 1, legacy_id: 1 },
        { name: 'Chocolates', slug: 'chocolates', description: 'Luxury handcrafted cocoa truffles & dark chocolate blocks', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&q=80', is_active: 1, legacy_id: 2 },
        { name: 'Cupcakes', slug: 'cupcakes', description: 'Fluffy gourmet cupcakes topped with velvet buttercream', image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&q=80', is_active: 1, legacy_id: 3 },
        { name: 'Brownies', slug: 'brownies', description: 'Decadent fudge brownies with walnuts & molten dark chocolate', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80', is_active: 1, legacy_id: 4 },
        { name: 'Cookies', slug: 'cookies', description: 'Freshly baked melt-in-the-mouth butter & choc-chip cookies', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80', is_active: 1, legacy_id: 5 },
        { name: 'Pastries', slug: 'pastries', description: 'Layered French pastries & delicate fruit tarts', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80', is_active: 1, legacy_id: 6 },
        { name: 'Donuts', slug: 'donuts', description: 'Glazed & chocolate filled artisan donuts', image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80', is_active: 1, legacy_id: 7 },
        { name: 'Gift Boxes', slug: 'gift-boxes', description: 'Curated royal confectionery assortments for special moments', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80', is_active: 1, legacy_id: 8 },
        { name: 'Birthday Specials', slug: 'birthday-specials', description: 'Custom celebratory party cakes & delight packages', image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&q=80', is_active: 1, legacy_id: 9 },
        { name: 'Festival Specials', slug: 'festival-specials', description: 'Festive gold-wrapped mithai & chocolate hampers', image: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=600&q=80', is_active: 1, legacy_id: 10 }
      ]);
      console.log('✅ Categories seeded.');
    }

    // Seed Products
    const prodCount = await Product.countDocuments();
    if (prodCount === 0) {
      console.log('🌱 Seeding initial products...');
      const cakeCat = await Category.findOne({ slug: 'cakes' });
      const chocCat = await Category.findOne({ slug: 'chocolates' });
      const cupcakeCat = await Category.findOne({ slug: 'cupcakes' });
      const brownieCat = await Category.findOne({ slug: 'brownies' });
      const cookieCat = await Category.findOne({ slug: 'cookies' });
      const giftCat = await Category.findOne({ slug: 'gift-boxes' });

      await Product.insertMany([
        {
          name: 'Belgian Dark Truffle Cake',
          category_id: cakeCat?._id || null,
          category: 'Cakes',
          category_slug: 'cakes',
          description: 'Rich 70% dark Belgian chocolate ganache layered with moist cocoa sponge cake.',
          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80',
          price: 899, discount: 10, stock_quantity: 25, weight_size: '1 Kg',
          ingredients: 'Belgian Dark Chocolate, Dutch Cocoa, Butter, Flour, Eggs, Vanilla Extract',
          is_available: 1, is_featured: 1, is_best_seller: 1, rating: 4.9, legacy_id: 1
        },
        {
          name: 'Royal Red Velvet Cake',
          category_id: cakeCat?._id || null,
          category: 'Cakes',
          category_slug: 'cakes',
          description: 'Authentic crimson red velvet cake with smooth cream cheese frosting & gold leaf flake garnish.',
          image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600&q=80',
          price: 799, discount: 5, stock_quantity: 18, weight_size: '1 Kg',
          ingredients: 'Cocoa, Cream Cheese, Pure Vanilla, Buttermilk, Beetroot extract',
          is_available: 1, is_featured: 1, is_best_seller: 1, rating: 4.8, legacy_id: 2
        },
        {
          name: 'Classic Black Forest Cake',
          category_id: cakeCat?._id || null,
          category: 'Cakes',
          category_slug: 'cakes',
          description: 'Traditional German layered chocolate sponge cake with dark cherries & fresh whipped cream.',
          image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&q=80',
          price: 699, discount: 0, stock_quantity: 30, weight_size: '1 Kg',
          ingredients: 'Dark Cherries, Whipped Cream, Chocolate Shavings, Cocoa Sponge',
          is_available: 1, is_featured: 0, is_best_seller: 1, rating: 4.7, legacy_id: 3
        },
        {
          name: 'Luxury Hazelnut Praline Truffles Box',
          category_id: chocCat?._id || null,
          category: 'Chocolates',
          category_slug: 'chocolates',
          description: 'Box of 16 handcrafted pralines filled with roasted Piedmont hazelnuts & smooth milk chocolate.',
          image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&q=80',
          price: 549, discount: 15, stock_quantity: 50, weight_size: '300g',
          ingredients: 'Roasted Hazelnuts, Cocoa Butter, Milk Solids, Pure Cane Sugar',
          is_available: 1, is_featured: 1, is_best_seller: 1, rating: 4.9, legacy_id: 4
        },
        {
          name: 'Salted Caramel Walnut Fudge Brownie',
          category_id: brownieCat?._id || null,
          category: 'Brownies',
          category_slug: 'brownies',
          description: 'Dense gooey dark chocolate brownies drizzled with sea salt caramel & crushed walnuts.',
          image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80',
          price: 399, discount: 0, stock_quantity: 40, weight_size: '6 Pieces',
          ingredients: '70% Dark Chocolate, Salted Caramel, California Walnuts, Flour',
          is_available: 1, is_featured: 1, is_best_seller: 0, rating: 4.8, legacy_id: 5
        },
        {
          name: 'Assorted Gourmet Cupcake Box',
          category_id: cupcakeCat?._id || null,
          category: 'Cupcakes',
          category_slug: 'cupcakes',
          description: 'Box of 6 cupcakes featuring Red Velvet, Dark Chocolate Truffle, and Vanilla Salted Caramel.',
          image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&q=80',
          price: 449, discount: 10, stock_quantity: 35, weight_size: '6 Units',
          ingredients: 'Buttercream, Belgian Cocoa, Madagascar Vanilla, Wheat Flour',
          is_available: 1, is_featured: 1, is_best_seller: 1, rating: 4.8, legacy_id: 6
        },
        {
          name: 'Choco Chunk Butter Cookies',
          category_id: cookieCat?._id || null,
          category: 'Cookies',
          category_slug: 'cookies',
          description: 'Golden baked butter cookies loaded with rich chocolate chunks.',
          image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80',
          price: 299, discount: 5, stock_quantity: 60, weight_size: '400g Tiffin',
          ingredients: 'Pure French Butter, Dark Choco Chunks, Brown Sugar, Wheat Flour',
          is_available: 1, is_featured: 0, is_best_seller: 1, rating: 4.6, legacy_id: 7
        },
        {
          name: 'Royal Celebration Hamper Box',
          category_id: giftCat?._id || null,
          category: 'Gift Boxes',
          category_slug: 'gift-boxes',
          description: 'Exquisite gold gift box containing Truffle Cake, Assorted Chocolates, & Macarons.',
          image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80',
          price: 1499, discount: 20, stock_quantity: 15, weight_size: '1.5 Kg',
          ingredients: 'Assorted Premium Confectionery Items',
          is_available: 1, is_featured: 1, is_best_seller: 1, rating: 5.0, legacy_id: 8
        }
      ]);
      console.log('✅ Products seeded.');
    }

    // Seed Coupons
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      console.log('🌱 Seeding initial coupons...');
      await Coupon.insertMany([
        { code: 'SWEET10', discount_type: 'percentage', discount_value: 10, min_order_amount: 499, max_discount_amount: 200, is_active: 1, expiry_date: new Date('2026-12-31') },
        { code: 'ROYAL50', discount_type: 'flat', discount_value: 50, min_order_amount: 399, max_discount_amount: 50, is_active: 1, expiry_date: new Date('2026-12-31') },
        { code: 'WELCOME100', discount_type: 'flat', discount_value: 100, min_order_amount: 799, max_discount_amount: 100, is_active: 1, expiry_date: new Date('2026-12-31') }
      ]);
      console.log('✅ Coupons seeded.');
    }

    // Seed Offers
    const offerCount = await Offer.countDocuments();
    if (offerCount === 0) {
      console.log('🌱 Seeding initial offers...');
      const now = new Date();
      const in30 = new Date(now); in30.setDate(in30.getDate() + 30);
      const in7 = new Date(now); in7.setDate(in7.getDate() + 7);
      await Offer.insertMany([
        {
          title: 'Royal Festival Feast',
          description: 'Get 20% off on all artisan gift boxes and chocolate hampers this festive season!',
          banner_image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
          discount_percentage: 20,
          start_date: now,
          end_date: in30,
          is_active: 1
        },
        {
          title: 'Weekend Choco Mania',
          description: 'Flat 15% discount on all Belgian Dark chocolate creations & truffle boxes.',
          banner_image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&q=80',
          discount_percentage: 15,
          start_date: now,
          end_date: in7,
          is_active: 1
        }
      ]);
      console.log('✅ Offers seeded.');
    }

    console.log('✅ MongoDB Database initialized and all collections verified!');
    return true;
  } catch (error) {
    console.error('❌ Error initializing MongoDB Database:', error.message);
    throw error;
  }
}

module.exports = { initializeDatabase };
