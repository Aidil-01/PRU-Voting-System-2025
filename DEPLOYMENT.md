# 🚀 PRU Voting System - Deployment Guide

## Quick Deployment Links

### 🏁 **Ready to Deploy?**
1. **Backend**: Deploy to Railway → [railway.app](https://railway.app)
2. **Frontend**: Deploy to Vercel → [vercel.com](https://vercel.com)
3. **Database**: MySQL on Railway (included)

---

## 📋 **Step-by-Step Deployment**

### **1. GitHub Repository Setup**
```bash
# In your project folder:
git init
git add .
git commit -m "Initial commit: PRU Voting System 2025"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/PRU-Voting-System-2025.git
git push -u origin main
```

### **2. Database Deployment (Railway)**

#### **A. Create Railway Account**
- Go to [railway.app](https://railway.app)
- Sign up with GitHub
- Connect your repository

#### **B. Add MySQL Database**
1. Click **"+ New"**
2. Select **"Database"** → **"Add MySQL"**
3. Wait for deployment (2-3 minutes)
4. Copy connection details:
   - **Host**: `mysql.railway.internal`
   - **Username**: `root`
   - **Password**: [generated password]
   - **Database**: [generated name]
   - **Port**: `3306`

#### **C. Setup Database Schema**
1. Connect to Railway MySQL using any MySQL client
2. Run the SQL commands from `database/production-setup.sql`
3. Verify tables are created: `villages`, `parties`, `voters`

### **3. Backend Deployment (Railway)**

#### **A. Configure Backend Service**
1. In Railway project, click **"+ New"**
2. Select **"GitHub Repo"** → Choose your repository
3. Railway auto-detects Node.js

#### **B. Set Environment Variables**
```env
DB_HOST=mysql.railway.internal
DB_USER=root
DB_PASSWORD=[your-railway-mysql-password]
DB_NAME=[your-railway-mysql-database]
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-here-change-this
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

#### **C. Configure Build Settings**
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### **4. Frontend Deployment (Vercel)**

#### **A. Create Vercel Account**
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub
- Import your project

#### **B. Configure Frontend Settings**
- **Framework Preset**: `React`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`

#### **C. Set Environment Variables**
```env
REACT_APP_API_URL=https://your-backend-service.railway.app
```

### **5. Final Configuration**

#### **A. Update Backend CORS**
Update your Railway backend environment variables:
```env
FRONTEND_URL=https://your-vercel-app-name.vercel.app
```

#### **B. Test Your Deployment**
1. **Backend Health Check**: Visit `https://your-backend.railway.app`
2. **Frontend**: Visit `https://your-frontend.vercel.app`
3. **Database Connection**: Check if data loads properly

---

## 🔧 **Environment Variables Reference**

### **Backend (.env)**
```env
# Database (Railway MySQL)
DB_HOST=mysql.railway.internal
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=railway_database_name
DB_PORT=3306

# Server
PORT=5000
NODE_ENV=production
JWT_SECRET=change-this-to-a-secure-random-string

# CORS
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### **Frontend (.env)**
```env
# API Endpoint
REACT_APP_API_URL=https://your-backend-service.railway.app
```

---

## 🎯 **Post-Deployment Checklist**

- [ ] ✅ Backend deploys successfully
- [ ] ✅ Database tables created
- [ ] ✅ Frontend builds and deploys
- [ ] ✅ API calls work from frontend
- [ ] ✅ Real-time updates work (Socket.IO)
- [ ] ✅ File upload works (party logos)
- [ ] ✅ CORS configured properly
- [ ] ✅ SSL certificates active (https://)

---

## 🚨 **Common Issues & Solutions**

### **Backend Not Starting**
```bash
# Check Railway logs
railway logs
```
- Verify all environment variables are set
- Check database connection details
- Ensure Node.js version compatibility

### **Frontend Can't Connect to API**
- Check `REACT_APP_API_URL` environment variable
- Verify CORS settings in backend
- Check browser network tab for errors

### **Database Connection Failed**
- Verify MySQL service is running on Railway
- Check database credentials in environment variables
- Test connection string manually

### **File Upload Not Working**
- Check if `uploads` directory exists
- Verify multer middleware configuration
- Check file size limits

---

## 🌐 **Alternative Hosting Options**

### **Free Tiers Available:**
1. **Railway** - $0/month (500 hours)
2. **Vercel** - Unlimited for personal use
3. **Heroku** - Free tier discontinued
4. **DigitalOcean** - $5/month (more control)

### **Professional Hosting:**
1. **AWS** - Full control, scalable
2. **Google Cloud** - Firebase integration
3. **Azure** - Enterprise features
4. **VPS providers** - Full server control

---

## 📊 **Performance Tips**

### **Backend Optimization:**
- Enable gzip compression
- Add Redis for session storage
- Use CDN for file uploads
- Implement proper logging

### **Frontend Optimization:**
- Enable React build optimization
- Use image optimization
- Implement code splitting
- Add service worker for offline support

---

## 🔒 **Security Considerations**

### **Production Security:**
- [ ] Change default JWT secret
- [ ] Enable HTTPS only
- [ ] Configure rate limiting
- [ ] Add input sanitization
- [ ] Enable security headers
- [ ] Regular security audits

### **Database Security:**
- [ ] Use environment variables for credentials
- [ ] Enable SQL injection protection
- [ ] Regular database backups
- [ ] Monitor database access logs

---

## 🎉 **You're Live!**

Once deployed, your PRU Voting System will be accessible at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-backend.railway.app`

Share the frontend URL with users to start using the system!

---

**Need help?** Check the issues section on GitHub or contact support.