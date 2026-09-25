# Smart Confectionery Management System (Sweet Haven)

> **Final-Year Academic Project**  
> A premium, full-stack confectionery e-commerce and management platform built with React, Vite, Node.js, Express, and MySQL.

---

## 🌟 Project Overview

**Sweet Haven** is an enterprise-grade Smart Confectionery Management System engineered to demonstrate real-world bakery operations, AI-assisted product recommendation, custom cake building, digital loyalty rewards, live food-delivery style order tracking, and inventory/waste management.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), JavaScript, HTML5, Vanilla CSS3 (Custom Luxury Design System), Lucide Icons, React Router DOM v6
- **Backend**: Node.js, Express.js REST API, JWT Authentication, bcryptjs
- **Database**: MySQL (`mysql2` connection pool)
- **Architecture**: Modular Client-Server Architecture

---

## 🚀 Stage 1 Setup Instructions

### 1. Database Setup (MySQL)
1. Ensure your MySQL server is running (e.g. via MySQL Workbench, XAMPP, or standalone MySQL service).
2. Create or import the database schema by executing:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   *Or open `database/schema.sql` inside MySQL Workbench and execute the script.*

### 2. Environment Configuration
Copy `.env.example` to `server/.env` (or adjust `server/.env` if database port/credentials differ):
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=sweet_haven_db
CLIENT_URL=http://localhost:5173
```

### 3. Install Dependencies
Run the following from the root directory:
```bash
npm run install:all
```

### 4. Running the Development Application
To launch both Express API backend & Vite React client concurrently:
```bash
npm run dev
```

Alternatively, launch services separately:
- **Server**: `npm run dev:server` (http://localhost:5000)
- **Client**: `npm run dev:client` (http://localhost:5173)

---

## 📋 Implementation Roadmap (10 Stages)

- [x] **Stage 1**: Project Setup, Folder Structure, React/Vite, Express API, MySQL Schema DDL & Basic UI
- [ ] **Stage 2**: Home Page, Category Showcase, Product Catalog, Search & Filters
- [ ] **Stage 3**: Authentication, Registration, Password Hashing & Customer Profile
- [ ] **Stage 4**: Shopping Cart, Wishlist, Checkout Flow & Coupon System
- [ ] **Stage 5**: Database Orders, History & Live Food-Style Order Tracking
- [ ] **Stage 6**: Admin Dashboard, Product/Order/Customer/Stock Management
- [ ] **Stage 7**: Digital Loyalty Card, Rewards & Admin Offer Management
- [ ] **Stage 8**: AI Recommendation Engine, Voice Search & Custom Cake Builder Studio
- [ ] **Stage 9**: Payment Gateway Sandbox Integration, Email OTP & Notifications
- [ ] **Stage 10**: Testing, Security Audit, Polish & Final Documentation
