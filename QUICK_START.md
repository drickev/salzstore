# SALZ Game Store - Quick Start Checklist

## ⚡ 5-Minute Setup

### Step 1: Install (1 minute)
```bash
cd /vercel/share/v0-project
pnpm install
```

### Step 2: Setup MongoDB (1 minute)
**Option A: Local (Easiest for development)**
```bash
# Start MongoDB (keep running in another terminal)
mongod
```

**Option B: Cloud (MongoDB Atlas)**
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account → Create cluster → Get connection string
3. Update MONGODB_URI in .env file
```

### Step 3: Seed Data (1 minute)
```bash
pnpm run seed
```

### Step 4: Start Server (1 minute)
```bash
pnpm run dev
```

### Step 5: Access Application (1 minute)
- **Homepage**: http://localhost:5000
- **Admin Panel**: http://localhost:5000/admin
- **Admin Password**: `admin123`

---

## ✅ Verification Checklist

### Frontend Check
- [ ] Homepage loads (dark theme with gold accents)
- [ ] Can see 3 sections: GOLD, BOT SERVICE, JOCKEY
- [ ] Products display in each section
- [ ] Exchange calculator works
- [ ] Can click "ORDER NOW" buttons
- [ ] No console errors (F12)

### Admin Panel Check
- [ ] Can access http://localhost:5000/admin
- [ ] Can login with password: `admin123`
- [ ] Can see products list
- [ ] Can see orders list
- [ ] Can see exchange rates
- [ ] Can add/edit/delete products
- [ ] Changes appear in frontend after 5 seconds

### Real-time Sync Check
- [ ] Add product in admin panel
- [ ] Wait 5 seconds
- [ ] Check if it appears on homepage automatically
- [ ] Update product stock
- [ ] Check if it updates on homepage

### API Check
```bash
# Test API endpoints
curl http://localhost:5000/api/products
curl http://localhost:5000/api/exchange-rates
curl http://localhost:5000/api/orders
```

---

## 🔧 Common Commands

```bash
# Development
pnpm run dev

# Production
pnpm start

# Seed database
pnpm run seed

# View project
open http://localhost:5000
```

---

## 📁 Important Files to Know

| File | Purpose | Edit? |
|------|---------|-------|
| `.env` | Configuration | YES - Add your settings |
| `server.js` | Express server | NO - Works as-is |
| `public/index.html` | Homepage | YES - Customize |
| `public/admin.html` | Admin dashboard | YES - Customize |
| `seed.js` | Sample data | YES - Add more products |
| `models/Product.js` | Product schema | YES - Add fields |

---

## 🚀 Deployment Checklist

When ready to deploy to production:

### Before Deploying
- [ ] Changed admin password in `.env`
- [ ] Generated strong JWT_SECRET
- [ ] Setup MongoDB Atlas account
- [ ] Tested all features locally
- [ ] Updated any product data
- [ ] Committed code to GitHub

### Deploy Steps
```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for production"
git push origin main

# 2. Go to Vercel.com
# 3. Import GitHub repo
# 4. Add environment variables
# 5. Deploy
```

### After Deploying
- [ ] Test production URL
- [ ] Verify admin login works
- [ ] Check all products display
- [ ] Test order placement
- [ ] Setup custom domain (optional)

---

## 🎯 Next Steps

1. **Now**: Complete setup above
2. **Today**: Explore admin panel, add your products
3. **Tomorrow**: Customize branding (colors, fonts)
4. **This Week**: Deploy to production
5. **Later**: Add payment integration, notifications, etc.

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't connect to MongoDB | Make sure `mongod` is running or check .env |
| Admin login fails | Check password is `admin123` (change in .env) |
| Products not loading | Run `pnpm run seed` or check browser console |
| PORT already in use | Change PORT in .env or kill process: `lsof -i :5000` |
| API not responding | Check server is running: `pnpm run dev` |

---

## 📚 Full Documentation

- **Setup Details**: See `SETUP_GUIDE.md`
- **API Usage**: See `API_EXAMPLES.md`
- **Deployment**: See `DEPLOYMENT.md`
- **Full Docs**: See `README.md`
- **Project Overview**: See `PROJECT_SUMMARY.md`

---

## 💡 Pro Tips

- **Real-time sync**: Frontend auto-refreshes every 5 seconds
- **Debug mode**: Press F12 to see console logs
- **Test admin**: Try creating a product and watch it appear on homepage
- **Change password**: Edit ADMIN_PASSWORD in .env
- **Add more products**: Use admin panel to create them
- **Monitor database**: Use MongoDB Atlas dashboard

---

## 🎉 You're Ready!

Your SALZ Game Store is now set up and ready to use!

**Next**: Visit http://localhost:5000 and start exploring! 🚀
