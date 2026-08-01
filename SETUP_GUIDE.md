# SALZ Game Store - Complete Setup Guide

## Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
cd /vercel/share/v0-project
pnpm install
```

### Step 2: Setup MongoDB

**For Local Development (Easiest):**
```bash
# Install MongoDB Community (one-time setup)
# Mac: brew install mongodb-community
# Ubuntu: sudo apt install mongodb
# Windows: Download from mongodb.com/try/download/community

# Start MongoDB in a separate terminal
mongod

# Keep this running while developing
```

**For Cloud (MongoDB Atlas):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account → Create a cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/database`)
4. Update `.env` file with your connection string

### Step 3: Update .env File

Edit `.env`:
```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/salz-game-store

# For MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/salz-game-store

# Keep these as-is for development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
ADMIN_PASSWORD=admin123
PORT=5000
NODE_ENV=development
```

### Step 4: Seed Sample Data

In a new terminal:
```bash
cd /vercel/share/v0-project
pnpm run seed
```

You should see:
```
✓ Products seeded
✓ Exchange rates seeded
✅ Database seeded successfully!
```

### Step 5: Start the Application

```bash
pnpm run dev
```

Server will start on `http://localhost:5000`

## Access the Application

### Frontend (Customer View)
- **URL**: http://localhost:5000
- **Features**: Browse products, view GOLD/BOT SERVICE/JOCKEY sections, calculate exchange rates, place orders

### Admin Panel (Management)
- **URL**: http://localhost:5000/admin
- **Password**: `admin123` (change this in production!)
- **Features**: Add/edit/delete products, manage orders, update exchange rates

## File Structure

```
/vercel/share/v0-project/
│
├── server.js              ← Main server file
├── seed.js                ← Sample data seeder
├── .env                   ← Configuration (edit this!)
├── package.json           ← Dependencies
├── README.md              ← Full documentation
│
├── models/                ← Database schemas
│   ├── Product.js
│   ├── ExchangeRate.js
│   └── Order.js
│
├── routes/                ← API endpoints
│   ├── products.js
│   ├── exchangeRates.js
│   ├── admin.js
│   └── orders.js
│
└── public/                ← Frontend files
    ├── index.html         ← Homepage (Sections: GOLD, BOT SERVICE, JOCKEY)
    ├── admin.html         ← Admin dashboard
    ├── script.js          ← Frontend logic
    └── admin-script.js    ← Admin logic
```

## Testing the Application

### 1. Test Frontend
```
1. Open http://localhost:5000
2. You should see 3 sections: GOLD, BOT SERVICE, JOCKEY
3. Try switching tabs
4. Check the exchange rate calculator
```

### 2. Test Admin Panel
```
1. Click "ADMIN" button in navbar
2. Enter password: admin123
3. Try adding a new product
4. Check if it appears on frontend (auto-refreshes every 5 seconds)
```

### 3. Test API Directly
```bash
# Get all products
curl http://localhost:5000/api/products

# Get GOLD products only
curl http://localhost:5000/api/products?type=gold

# Get exchange rates
curl http://localhost:5000/api/exchange-rates
```

## Features Implemented

✅ **Frontend**
- 3 Product sections (GOLD, BOT SERVICE, JOCKEY)
- Exchange rate calculator with currency conversion
- Order placement form
- Real-time polling (auto-refresh every 5 seconds)
- Responsive design with Tailwind CSS
- Pointer event protection (text/images cannot be blocked)

✅ **Admin Panel**
- Password-protected login (JWT authentication)
- Add/Edit/Delete products
- Toggle product status (available/closed)
- Update stock quantities
- View all orders
- Manage exchange rates
- Auto-refresh data every 5 seconds

✅ **Backend API**
- Express.js server
- MongoDB integration
- RESTful endpoints for products, orders, exchange rates
- JWT token authentication for admin
- Modular route structure

✅ **Database**
- MongoDB with Mongoose ORM
- 3 collections: Products, ExchangeRates, Orders
- Indexed for fast queries
- Automatic timestamps

## Common Issues & Solutions

### Issue: MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running
```bash
# Check if mongod is running
ps aux | grep mongod

# Or start it:
mongod
```

### Issue: Admin Login Not Working
```
Solution: Check .env file has correct ADMIN_PASSWORD
```

### Issue: Products Not Loading
```
Solution: 
1. Check if server is running
2. Check browser console (F12) for errors
3. Run seed script: pnpm run seed
```

### Issue: "Cannot GET /admin"
```
Solution: Make sure you're using http://localhost:5000/admin
(not just /admin or a different URL)
```

## Customization

### Change Admin Password
Edit `.env`:
```env
ADMIN_PASSWORD=your_new_strong_password
```

### Change Port
Edit `.env`:
```env
PORT=3000
```

### Add More Product Types
Edit `models/Product.js` and add to the enum:
```javascript
type: {
  enum: ['gold', 'bot_service', 'jockey', 'your_new_type'],
}
```

### Update Default Prices
Edit `seed.js` and change the price values, then run:
```bash
pnpm run seed
```

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**
- Go to https://vercel.com
- Import your GitHub repository
- Vercel will auto-detect Node.js

3. **Set Environment Variables**
In Vercel dashboard → Settings → Environment Variables:
```
MONGODB_URI=your_production_mongodb_atlas_uri
JWT_SECRET=use_a_strong_random_string
ADMIN_PASSWORD=use_a_strong_password
NODE_ENV=production
```

4. **Deploy**
- Click "Deploy"
- Your app will be live in ~2 minutes

### MongoDB for Production

1. **Use MongoDB Atlas**
- Go to https://www.mongodb.com/cloud/atlas
- Create a project
- Create a cluster (M0 free tier available)
- Get connection string
- Update MONGODB_URI in Vercel

2. **Whitelist IPs**
- In MongoDB Atlas → Network Access
- Add Vercel IPs (or use 0.0.0.0/0 for testing only)

## API Documentation

See `README.md` for detailed API endpoint documentation.

## Support & Debugging

### Enable Debug Mode
```javascript
// In server.js, add:
mongoose.set('debug', true);
```

### Check Logs
```bash
# Server errors appear in terminal where you ran 'pnpm run dev'
# Frontend errors appear in browser console (F12)
```

### Check Database
```bash
# Connect to MongoDB
mongosh

# Select database
use salz-game-store

# View products
db.products.find()

# View orders
db.orders.find()
```

## Next Steps

1. ✅ Complete the local setup above
2. Add your branding/colors
3. Add more products in admin panel
4. Set up proper MongoDB Atlas backup
5. Deploy to Vercel
6. Monitor and collect real orders
7. Integrate with payment gateway (optional)

## Questions?

Check README.md for full documentation!
