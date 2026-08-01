# SALZ Game Store - API Examples & Testing

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.vercel.app/api
```

## Testing with cURL

### Products API

**Get All Products**
```bash
curl http://localhost:5000/api/products
```

**Get GOLD Products Only**
```bash
curl http://localhost:5000/api/products?type=gold
```

**Get Products by Type**
```bash
curl http://localhost:5000/api/products/type/bot_service
curl http://localhost:5000/api/products/type/jockey
```

**Get Single Product**
```bash
curl http://localhost:5000/api/products/{product_id}
```

### Exchange Rates API

**Get All Exchange Rates**
```bash
curl http://localhost:5000/api/exchange-rates
```

**Get Specific Currency Rate**
```bash
curl http://localhost:5000/api/exchange-rates/USD
curl http://localhost:5000/api/exchange-rates/EUR
```

**Sync Exchange Rates**
```bash
curl -X POST http://localhost:5000/api/exchange-rates/sync/update
```

### Orders API

**Get All Orders**
```bash
curl http://localhost:5000/api/orders
```

**Get Single Order**
```bash
curl http://localhost:5000/api/orders/{order_id}
```

**Create New Order**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "quantity": 1,
    "customerEmail": "customer@example.com",
    "customerName": "John Doe"
  }'
```

**Update Order Status**
```bash
curl -X PATCH http://localhost:5000/api/orders/{order_id}/status \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

### Admin API (Protected)

**Login**
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password": "admin123"}'

# Response:
# {"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

**Create Product (Requires Token)**
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "New Product",
    "type": "gold",
    "stock": 999,
    "price": 999999,
    "serverName": "SERVER NAME",
    "status": "available"
  }'
```

**Update Product (Requires Token)**
```bash
curl -X PUT http://localhost:5000/api/admin/products/{product_id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "stock": 500,
    "price": 899999,
    "status": "available"
  }'
```

**Toggle Product Status (Requires Token)**
```bash
curl -X PATCH http://localhost:5000/api/admin/products/{product_id}/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update Stock (Requires Token)**
```bash
curl -X PATCH http://localhost:5000/api/admin/products/{product_id}/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"stock": 500}'
```

**Delete Product (Requires Token)**
```bash
curl -X DELETE http://localhost:5000/api/admin/products/{product_id} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Testing with JavaScript/Fetch

### Get All Products
```javascript
fetch('http://localhost:5000/api/products')
  .then(res => res.json())
  .then(products => console.log(products));
```

### Get Products by Type
```javascript
fetch('http://localhost:5000/api/products/type/gold')
  .then(res => res.json())
  .then(products => console.log(products));
```

### Create Order
```javascript
const orderData = {
  productId: '65a1b2c3d4e5f6g7h8i9j0k1',
  quantity: 1,
  customerEmail: 'test@example.com',
  customerName: 'Test User'
};

fetch('http://localhost:5000/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData)
})
  .then(res => res.json())
  .then(order => console.log('Order created:', order));
```

### Admin Login
```javascript
fetch('http://localhost:5000/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'admin123' })
})
  .then(res => res.json())
  .then(data => {
    const token = data.token;
    localStorage.setItem('adminToken', token);
    console.log('Logged in!');
  });
```

### Create Product (Admin)
```javascript
const token = localStorage.getItem('adminToken');

const productData = {
  name: 'Premium Gold Package',
  type: 'gold',
  stock: 999,
  price: 1299999,
  serverName: 'ATLANTICA ONLINE PREMIUM',
  status: 'available'
};

fetch('http://localhost:5000/api/admin/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(productData)
})
  .then(res => res.json())
  .then(product => console.log('Product created:', product));
```

### Update Product (Admin)
```javascript
const token = localStorage.getItem('adminToken');
const productId = '65a1b2c3d4e5f6g7h8i9j0k1';

fetch(`http://localhost:5000/api/admin/products/${productId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    stock: 500,
    price: 899999
  })
})
  .then(res => res.json())
  .then(product => console.log('Updated:', product));
```

### Delete Product (Admin)
```javascript
const token = localStorage.getItem('adminToken');
const productId = '65a1b2c3d4e5f6g7h8i9j0k1';

fetch(`http://localhost:5000/api/admin/products/${productId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => console.log('Deleted:', data));
```

---

## Testing with Postman

### Setup Postman Collection

1. Open Postman
2. Create new Collection: "SALZ Game Store"
3. Add requests:

**Request 1: Get Products**
- Method: GET
- URL: http://localhost:5000/api/products
- No headers needed

**Request 2: Admin Login**
- Method: POST
- URL: http://localhost:5000/api/admin/login
- Headers: Content-Type: application/json
- Body (JSON):
```json
{
  "password": "admin123"
}
```
- After running, save the token from response

**Request 3: Create Product**
- Method: POST
- URL: http://localhost:5000/api/admin/products
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer {your_token_from_login}
- Body (JSON):
```json
{
  "name": "New Test Product",
  "type": "gold",
  "stock": 999,
  "price": 999999,
  "serverName": "TEST SERVER",
  "status": "available"
}
```

**Request 4: Create Order**
- Method: POST
- URL: http://localhost:5000/api/orders
- Headers: Content-Type: application/json
- Body (JSON):
```json
{
  "productId": "PASTE_PRODUCT_ID_HERE",
  "quantity": 1,
  "customerEmail": "test@example.com",
  "customerName": "Test Customer"
}
```

**Request 5: Get Exchange Rates**
- Method: GET
- URL: http://localhost:5000/api/exchange-rates
- No headers needed

---

## Response Examples

### Get All Products - Success
```json
[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "ATLANTICA ONLINE VALOFE",
    "type": "gold",
    "stock": 999,
    "price": 999999,
    "serverName": "ATLANTICA ONLINE VALOFE",
    "status": "available",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### Create Order - Success
```json
{
  "_id": "65b2c3d4e5f6g7h8i9j0k1l2",
  "productId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "quantity": 1,
  "totalPrice": 999999,
  "customerEmail": "test@example.com",
  "customerName": "Test Customer",
  "status": "pending",
  "createdAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

### Admin Login - Success
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDUzMjEyMDAsImV4cCI6MTcwNTQwNzYwMH0.abc123def456..."
}
```

### Error Response
```json
{
  "error": "Invalid password"
}
```

---

## Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 200 | Success | Request successful |
| 400 | Bad Request | Check request format/data |
| 401 | Unauthorized | Admin token required or invalid |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Check server logs |

---

## Debugging Tips

### Enable Verbose Logging
```bash
# Set in .env
NODE_ENV=development

# Add to server.js
mongoose.set('debug', true);
```

### Test Token Decoding
```bash
# Install jwt-cli
npm install -g jwt-cli

# Decode your token
jwt decode "your_token_here"
```

### Monitor Database
```bash
# Open MongoDB shell
mongosh

# Select database
use salz-game-store

# Check products
db.products.find().pretty()

# Check orders
db.orders.find().pretty()

# Count collections
db.products.countDocuments()
db.orders.countDocuments()
```

### Network Debugging
```javascript
// Add to browser console to see all API calls
const originalFetch = fetch;
window.fetch = function(...args) {
  console.log('API Call:', args);
  return originalFetch(...args)
    .then(response => {
      console.log('API Response:', response);
      return response;
    });
};
```

---

## Rate Limiting Notes

No rate limiting implemented by default. For production, add:

```bash
pnpm install express-rate-limit
```

Add to server.js:
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);
```

---

## CORS Configuration

Current CORS allows all origins in development. For production:

```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

---

## Authentication Flow

1. **Client sends password**
   ```
   POST /api/admin/login
   → Receive JWT token
   ```

2. **Client stores token**
   ```
   localStorage.setItem('adminToken', token)
   ```

3. **Client uses token in protected requests**
   ```
   Authorization: Bearer {token}
   ```

4. **Server verifies token**
   ```
   Middleware checks Authorization header
   → Validates JWT signature
   → Allows request or returns 401
   ```

5. **Token expires after 24 hours**
   ```
   Re-login to get new token
   ```

---

## Performance Considerations

- Products are cached in frontend (5-second refresh)
- Exchange rates cached (30-second refresh)
- No pagination by default (add for high volume)
- No caching headers set (add for static content)
- MongoDB indexes recommended for large datasets

---

For more details, see `README.md` and `SETUP_GUIDE.md`
