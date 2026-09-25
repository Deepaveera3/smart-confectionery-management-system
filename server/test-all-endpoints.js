const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Full System Integration Test Suite...\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`⏳ Testing: ${name}... `);
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  // 1. Health & DB Status
  await test('Database Connectivity (/api/db-status)', async () => {
    const res = await fetch(`${BASE_URL}/db-status`);
    const data = await res.json();
    if (!data.dbConnected) throw new Error('Database not reported as connected: ' + JSON.stringify(data));
  });

  // 2. Admin Login
  let adminToken = '';
  await test('Admin Login with JWT (/api/auth/admin-login)', async () => {
    const res = await fetch(`${BASE_URL}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@sweethaven.com', password: 'Admin@123' })
    });
    const data = await res.json();
    if (!data.success || !data.token || data.user.role !== 'admin') {
      throw new Error(`Admin login failed: ${data.message || JSON.stringify(data)}`);
    }
    adminToken = data.token;
  });

  // 3. Customer Login
  let customerToken = '';
  await test('Customer Login with JWT (/api/auth/login)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@sweethaven.com', password: 'Admin@123' })
    });
    const data = await res.json();
    if (!data.success || !data.token || data.user.role !== 'customer') {
      throw new Error(`Customer login failed: ${data.message || JSON.stringify(data)}`);
    }
    customerToken = data.token;
  });

  // 4. Customer Signup & Loyalty Account Creation
  const testCustomerEmail = `test_${Date.now()}@sweethaven.com`;
  let newCustomerToken = '';
  await test('Customer Registration with Loyalty Auto-Creation (/api/auth/signup)', async () => {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Test User',
        email: testCustomerEmail,
        phone: '+91 99999 88888',
        password: 'Password@123',
        confirmPassword: 'Password@123'
      })
    });
    const data = await res.json();
    if (!data.success || !data.token || data.user.currentPoints !== 50) {
      throw new Error(`Customer signup failed: ${data.message || JSON.stringify(data)}`);
    }
    newCustomerToken = data.token;
  });

  // 5. Category CRUD
  let createdCatId = null;
  await test('Category CRUD (Add, Get, Update, Delete)', async () => {
    // 5a. Create
    const createRes = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: `Special Macarons ${Date.now()}`,
        description: 'Authentic Parisian almond macarons'
      })
    });
    const createData = await createRes.json();
    if (!createData.success || !createData.categoryId) throw new Error('Create category failed: ' + JSON.stringify(createData));
    createdCatId = createData.categoryId;

    // 5b. Get All
    const getRes = await fetch(`${BASE_URL}/categories`);
    const getData = await getRes.json();
    if (!getData.success || !Array.isArray(getData.categories)) throw new Error('Get categories failed');

    // 5c. Update
    const updateRes = await fetch(`${BASE_URL}/categories/${createdCatId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: `Special Macarons Updated ${Date.now()}`,
        description: 'Updated Parisian macarons'
      })
    });
    const updateData = await updateRes.json();
    if (!updateData.success) throw new Error('Update category failed');

    // 5d. Delete
    const delRes = await fetch(`${BASE_URL}/categories/${createdCatId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const delData = await delRes.json();
    if (!delData.success) throw new Error('Delete category failed');
  });

  // 6. Product CRUD
  let createdProdId = null;
  await test('Product CRUD (Add, Get, Update, Stock Update, Delete)', async () => {
    // 6a. Create
    const createRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Strawberry Velvet Tart Test',
        category_id: 1,
        description: 'Crispy tart shell filled with strawberry curd',
        price: 349,
        discount: 10,
        stock_quantity: 20,
        weight_size: '300g',
        min_threshold: 5
      })
    });
    const createData = await createRes.json();
    if (!createData.success || !createData.productId) throw new Error('Create product failed: ' + JSON.stringify(createData));
    createdProdId = createData.productId;

    // 6b. Get Public
    const getRes = await fetch(`${BASE_URL}/products`);
    const getData = await getRes.json();
    if (!getData.success || !Array.isArray(getData.products)) throw new Error('Get products failed');

    // 6c. Update
    const updateRes = await fetch(`${BASE_URL}/products/${createdProdId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Strawberry Velvet Tart Updated',
        category_id: 1,
        description: 'Updated description',
        price: 399,
        discount: 15,
        stock_quantity: 25,
        weight_size: '350g',
        min_threshold: 8
      })
    });
    const updateData = await updateRes.json();
    if (!updateData.success) throw new Error('Update product failed');

    // 6d. Update Stock
    const stockRes = await fetch(`${BASE_URL}/products/${createdProdId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ stock_quantity: 50 })
    });
    const stockData = await stockRes.json();
    if (!stockData.success) throw new Error('Update stock failed');

    // 6e. Delete
    const delRes = await fetch(`${BASE_URL}/products/${createdProdId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const delData = await delRes.json();
    if (!delData.success) throw new Error('Delete product failed');
  });

  // 7. Order Placement & Automatic Inventory Updates
  let placedOrderId = null;
  await test('Order Placement, Stock Deduction & Loyalty Rewards (/api/orders/place)', async () => {
    // Check initial stock for Product #1
    const pRes = await fetch(`${BASE_URL}/products/1`);
    const pData = await pRes.json();
    const initialStock = pData.product.stock_quantity;

    const orderRes = await fetch(`${BASE_URL}/orders/place`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${newCustomerToken}` },
      body: JSON.stringify({
        items: [
          { id: 1, name: 'Belgian Dark Truffle Cake', price: 899, quantity: 2, discount: 10 }
        ],
        delivery_address: '123 Baker Street, Central District, Bangalore - 560001',
        delivery_instructions: 'Handle with care',
        loyalty_points_redeemed: 0,
        payment_method: 'UPI / Online'
      })
    });

    const orderData = await orderRes.json();
    if (!orderData.success || !orderData.orderId) {
      throw new Error('Order placement failed: ' + JSON.stringify(orderData));
    }
    placedOrderId = orderData.orderId;

    // Verify stock deduction
    const pAfterRes = await fetch(`${BASE_URL}/products/1`);
    const pAfterData = await pAfterRes.json();
    const expectedStock = initialStock - 2;
    if (pAfterData.product.stock_quantity !== expectedStock) {
      throw new Error(`Stock deduction failed! Expected ${expectedStock}, got ${pAfterData.product.stock_quantity}`);
    }
  });

  // 8. Customer Orders List & Tracking
  await test('Customer Orders Retrieval (/api/orders/my-orders)', async () => {
    const res = await fetch(`${BASE_URL}/orders/my-orders`, {
      headers: { 'Authorization': `Bearer ${newCustomerToken}` }
    });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.orders) || data.orders.length === 0) {
      throw new Error('Customer orders fetch failed: ' + JSON.stringify(data));
    }
  });

  // 9. Loyalty Rewards Display & History
  await test('Customer Loyalty Account & Transactions (/api/loyalty/my-account)', async () => {
    const res = await fetch(`${BASE_URL}/loyalty/my-account`, {
      headers: { 'Authorization': `Bearer ${newCustomerToken}` }
    });
    const data = await res.json();
    if (!data.success || !data.account || !data.account.loyalty_card_number) {
      throw new Error('Loyalty fetch failed: ' + JSON.stringify(data));
    }
  });

  // 10. Admin Live Dashboard Metrics
  await test('Live Admin Dashboard Statistics (/api/admin/dashboard/metrics)', async () => {
    const res = await fetch(`${BASE_URL}/admin/dashboard/metrics`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success || !data.stats || data.stats.totalProducts === undefined || data.stats.totalRevenue === undefined) {
      throw new Error('Dashboard metrics fetch failed: ' + JSON.stringify(data));
    }
  });

  console.log('\n=============================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
