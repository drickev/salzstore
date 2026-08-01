# SALZ Game Store - Full Stack Application

A modern game marketplace with Node.js + Express backend and MongoDB database.

## Features

- **Frontend**: Responsive HTML/CSS/JS with Tailwind CSS
- **Backend**: Express.js API with JWT authentication
- **Database**: MongoDB with Mongoose ORM
- **Admin Panel**: Complete product management dashboard
- **Real-time Polling**: Auto-refresh products and exchange rates
- **Sections**: GOLD (servers), BOT SERVICE (tiers), JOCKEY (plans)
- **Exchange Rate Calculator**: Currency conversion to IDR
- **Order Management**: Display and tracking system
- **Pointer Protection**: All text/images have `pointer-events: none` for security

## Project Structure

```
/vercel/share/v0-project/
├── server.js                    # Main Express server
├── .env                        # Environment variables
├── package.json                # Dependencies
├── models/
│   ├── Product.js             # Product schema
│   ├── ExchangeRate.js        # Exchange rate schema
│   └── Order.js               # Order schema
├── routes/
│   ├── products.js            # Product endpoints
│   ├── exchangeRates.js       # Exchange rate endpoints
│   ├── admin.js               # Admin authentication & CRUD
│   └── orders.js              # Order endpoints
└── public/
    ├── index.html             # Frontend homepage
    ├── admin.html             # Admin dashboard
    ├── script.js              # Frontend logic
    └── admin-script.js        # Admin logic
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd /vercel/share/v0-project
pnpm install
```

### 2. Setup MongoDB

**Option A: MongoDB Atlas (Cloud)**
```bash
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string
4. Update MONGODB_URI in .env file
```

**Option B: Local MongoDB**
```bash
# Install MongoDB locally (depends on OS)
# Mac: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb
# Windows: Download from mongodb.com

# Start MongoDB service
mongod
```

### 3. Configure Environment Variables

Edit `.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/salz-game-store
JWT_SECRET=your_super_secret_key_here_12345
ADMIN_PASSWORD=admin123
PORT=5000
NODE_ENV=development
EXCHANGE_RATE_API=https://v6.exchangerate-api.com/v6/free/latest/USD
```

### 4. Run the Application

```bash
# Development mode with auto-reload
pnpm run dev

# Production mode
pnpm start
```

The application will run on `http://localhost:5000`

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/type/:type` - Get products by type

### Admin (Requires Authentication)
- `POST /api/admin/login` - Login (password: admin123)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `PATCH /api/admin/products/:id/status` - Toggle status
- `PATCH /api/admin/products/:id/stock` - Update stock

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status

### Exchange Rates
- `GET /api/exchange-rates` - Get all rates
- `GET /api/exchange-rates/:currency` - Get specific rate
- `POST /api/exchange-rates/sync/update` - Sync rates

## Default Credentials

- **Admin Password**: `admin123` (change in production!)
- **Admin URL**: `http://localhost:5000/admin`

## Features Explained

### Pointer Events Protection
All text, images, and labels have `pointer-events: none` to prevent selection:
```css
h1, h2, h3, p, span, .no-block {
  pointer-events: none;
}
```

### Real-time Polling
Frontend auto-refreshes every 5 seconds:
```javascript
setInterval(loadProducts, 5000);      // Products
setInterval(loadExchangeRates, 30000); // Exchange rates
```

### Admin Authentication
JWT token stored in localStorage for session management:
```javascript
POST /api/admin/login with password
Returns: { token: "jwt_token_here" }
```

### Exchange Rate Calculator
Users can convert foreign currencies to IDR:
- Supports USD, EUR, GBP, JPY
- Real-time calculation
- Mock data by default (configure external API in production)

## Production Deployment

### Vercel Deployment

```bash
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy
```

### Environment Variables for Production
```env
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=use_strong_random_string
ADMIN_PASSWORD=use_strong_password
PORT=3000
NODE_ENV=production
```

### MongoDB Atlas Setup
```bash
1. Create a free tier cluster
2. Create database user
3. Whitelist IP addresses
4. Get connection string
5. Update MONGODB_URI
```

## Customization

### Change Admin Password
Edit `.env`:
```env
ADMIN_PASSWORD=your_new_secure_password
```

### Add More Product Types
Edit `models/Product.js`:
```javascript
type: {
  enum: ['gold', 'bot_service', 'jockey', 'your_new_type'],
}
```

### Add More Exchange Currencies
Edit `routes/exchangeRates.js` and update the `syncExchangeRates` function.

## Troubleshooting

### MongoDB Connection Error
- Verify MONGODB_URI is correct
- Check MongoDB service is running
- Verify network access (if using Atlas)

### Admin Login Fails
- Check ADMIN_PASSWORD in .env
- Clear localStorage: `localStorage.clear()`
- Restart server

### Products Not Loading
- Check browser console for errors
- Verify API is running on correct port
- Check MongoDB has sample data

## Adding Sample Data

To add sample products, run this in MongoDB:

```javascript
db.products.insertMany([
  {
    name: "ATLANTICA ONLINE VALOFE",
    type: "gold",
    stock: 999,
    price: 999999,
    currency: "IDR",
    serverName: "ATLANTICA ONLINE VALOFE",
    status: "available"
  },
  // ... add more products
])
```

Or use the Admin Panel to add products manually.

## Support

For issues or questions, check:
1. Console errors (F12 in browser)
2. Server logs (terminal)
3. MongoDB connection string
4. Environment variables

## Security Notes

- Always use strong JWT_SECRET in production
- Change default admin password
- Use HTTPS in production
- Keep MongoDB connection string private
- Validate all user inputs (already implemented)

## License

Your license here

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Frontend**: HTML5, CSS3, JavaScript
- **Styling**: Tailwind CSS
- **Authentication**: JWT
- **Hashing**: bcryptjs
