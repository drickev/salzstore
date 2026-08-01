# SALZ Game Store - Production Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database backed up
- [ ] Admin password changed from default
- [ ] JWT_SECRET is a strong random string
- [ ] MongoDB Atlas cluster setup and whitelisted
- [ ] All products added
- [ ] Tested admin panel functionality
- [ ] Tested order placement

## Production Security Setup

### 1. Environment Variables (CRITICAL)

Never expose these in code. Always use environment management:

```env
# Production values MUST be strong and unique
MONGODB_URI=mongodb+srv://username:secure_password@cluster.mongodb.net/salz-production
JWT_SECRET=generate_this_with:_openssl_rand_-_base64_32
ADMIN_PASSWORD=generate_strong_password_at_least_16_chars
PORT=3000
NODE_ENV=production
EXCHANGE_RATE_API=https://v6.exchangerate-api.com/v6/YOUR_API_KEY/latest/USD
```

**Generate Strong Secrets:**
```bash
# JWT Secret
openssl rand -base64 32

# Admin Password (use a password manager)
# Example: Tr0p!c@lThund3r#2024$Secure
```

### 2. MongoDB Atlas Configuration

**Cluster Setup:**
1. M2+ tier (not free tier M0 - unreliable)
2. Enable backups
3. Enable monitoring
4. Set backup window off-peak

**Network Access:**
```
Production: Only allow Vercel IPs
Development: Your current IP
Never use 0.0.0.0/0 in production
```

**Database User:**
- Create dedicated user with least privileges
- Use complex password
- Enable IP whitelist

### 3. CORS Configuration (if needed)

In `server.js`, update CORS:
```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

## Deployment to Vercel

### Step 1: Prepare Repository

```bash
# Ensure .env is in .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Add .gitignore if not present
echo "node_modules/" >> .gitignore
echo ".DS_Store" >> .gitignore

git add .
git commit -m "Production ready"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Authorize GitHub
4. Select your repository
5. Click "Import"

### Step 3: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

```
KEY: MONGODB_URI
VALUE: mongodb+srv://username:password@cluster.mongodb.net/salz-production
```

```
KEY: JWT_SECRET
VALUE: (your generated secret from openssl)
```

```
KEY: ADMIN_PASSWORD
VALUE: (your strong password)
```

```
KEY: NODE_ENV
VALUE: production
```

```
KEY: EXCHANGE_RATE_API
VALUE: https://v6.exchangerate-api.com/v6/your_api_key/latest/USD
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. You'll get a production URL like: `https://salz-game-store.vercel.app`

### Step 5: Test Production

```bash
# Test frontend
https://your-production-url.vercel.app

# Test API
https://your-production-url.vercel.app/api/products

# Test admin
https://your-production-url.vercel.app/admin
(use your new admin password)
```

## Scaling & Performance

### Database Optimization

```javascript
// Add indexes to models/Product.js
productSchema.index({ type: 1 });
productSchema.index({ status: 1 });
productSchema.index({ createdAt: -1 });
```

### Caching Strategy

For high traffic, add Redis:
```bash
pnpm install redis
```

### Rate Limiting

```bash
pnpm install express-rate-limit
```

Add to server.js:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

## Monitoring & Logs

### Vercel Logs

View logs in real-time:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View logs
vercel logs salz-game-store
```

### Error Tracking (Optional)

Add Sentry for error tracking:
```bash
pnpm install @sentry/node
```

In server.js:
```javascript
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "your_sentry_dsn" });
app.use(Sentry.Handlers.errorHandler());
```

### Performance Monitoring

MongoDB Atlas provides built-in monitoring. Check:
- Query performance
- Database operations
- Connection count
- Memory usage

## Custom Domain

1. **Buy domain** (namecheap.com, godaddy.com, etc.)
2. **In Vercel Dashboard**:
   - Go to Project → Settings → Domains
   - Add custom domain
   - Add DNS records as shown
3. **In Domain Registrar**:
   - Update nameservers or add CNAME records
   - Wait 24-48 hours for propagation

Example DNS Record:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

## Automated Backups

### MongoDB Atlas Automated Backups
- Already enabled by default
- Stored for 7 days (M2+ tier)
- Can restore to point-in-time

### Additional Backup Strategy
```bash
#!/bin/bash
# backup-mongodb.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/salz-production" \
          --out=backups/backup_$TIMESTAMP

# Upload to cloud storage (AWS S3, Google Cloud, etc.)
aws s3 cp backups/backup_$TIMESTAMP s3://your-backup-bucket/
```

## SSL/HTTPS

Vercel automatically provides SSL certificate. Check:
- All traffic redirects to HTTPS
- Mixed content warnings in browser console = fix them!

## Rollback Plan

If something goes wrong:

```bash
# Vercel rollback to previous deployment
# Dashboard → Deployments → Find previous version → Promote to production

# Or manually:
git log --oneline
git revert <commit-hash>
git push origin main
```

## Post-Deployment Checklist

- [ ] Test all pages load correctly
- [ ] Admin login works with new password
- [ ] Products display properly
- [ ] Orders can be placed
- [ ] Exchange rate calculator works
- [ ] Admin can add/edit/delete products
- [ ] Real-time polling works (refresh data every 5 seconds)
- [ ] No console errors (F12)
- [ ] Check SSL certificate (green lock)
- [ ] Database connections working
- [ ] Email notifications configured (if adding later)

## Performance Tips

1. **Enable Compression**
```javascript
app.use(compression()); // Add pnpm install compression
```

2. **Add Pagination to Orders**
```javascript
// In routes/orders.js
const page = req.query.page || 1;
const limit = 20;
const skip = (page - 1) * limit;
const orders = await Order.find().skip(skip).limit(limit);
```

3. **Cache Exchange Rates**
```javascript
// Only sync every 6 hours
setInterval(syncExchangeRates, 6 * 60 * 60 * 1000);
```

## Troubleshooting Production Issues

### "MongoServerError: authentication failed"
- Check MONGODB_URI is correct
- Verify database user exists
- Check IP whitelist in MongoDB Atlas

### "403 Forbidden" from API
- Check CORS configuration
- Verify production domain is whitelisted

### Slow API Responses
- Check MongoDB query performance
- Add missing indexes
- Consider database scaling

### Admin Panel Not Loading
- Check JWT_SECRET matches between environments
- Verify admin token in localStorage
- Check network requests in browser

## Updating Production

### Safe Deployment Process

1. **Test locally first**
```bash
pnpm run dev
# Test thoroughly
```

2. **Update staging environment** (if available)
```bash
git push origin staging
# Vercel auto-deploys
# Test on staging URL
```

3. **Deploy to production**
```bash
git push origin main
# Vercel auto-deploys to production
```

4. **Verify production**
- Check all features
- Monitor logs for errors
- Run smoke tests

### Database Migration

If changing schema:
```bash
# Create migration file
node -e "console.log(new Date().toISOString())"

# Update models
# Run migration script
node migrate.js

# Verify data
# Deploy code update
```

## Support & Escalation

### Vercel Support
- https://vercel.com/help
- Click help → Contact support (paid plans)

### MongoDB Support
- https://www.mongodb.com/support
- Community forums: https://developer.mongodb.com/community/

### Debug Checklist
1. Check browser console (F12)
2. Check Vercel logs
3. Check MongoDB Atlas logs
4. Verify environment variables
5. Test with curl commands
6. Check network tab (F12)

## Cost Estimation

- **Vercel**: Free tier (up to 100GB bandwidth)
- **MongoDB Atlas**: Free tier (M0 - 512MB storage)
- **Custom Domain**: $10-15/year
- **Advanced Monitoring**: $0-50/month

## Next Steps After Launch

1. Monitor user traffic
2. Collect feedback
3. Add payment integration when ready
4. Consider feature additions
5. Plan scaling strategy

---

**Deployment Date**: ___________
**Production URL**: ___________
**Admin Backup Password**: ___________
**Database Backup Date**: ___________
