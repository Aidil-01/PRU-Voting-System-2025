# ⚡ Panduan Cepat - Deploy PRU Voting System

## 🎯 3 Langkah Mudah Deploy

### 1️⃣ **Setup Github (5 minit)**
```bash
git init
git add .
git commit -m "Initial commit: PRU Voting System 2025"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/PRU-Voting-System-2025.git
git push -u origin main
```

### 2️⃣ **Deploy Backend ke Railway (10 minit)**
1. **[railway.app](https://railway.app)** → Login with GitHub
2. **New Project** → **Provision MySQL** (tunggu 2-3 minit)
3. **New Service** → **GitHub Repo** → Pilih repository anda
4. **Settings** → Root Directory: `backend`
5. **Variables** → Add ini semua:
   ```
   DB_HOST=[mysql host dari railway]
   DB_USER=root
   DB_PASSWORD=[mysql password dari railway]  
   DB_NAME=railway
   DB_PORT=[mysql port dari railway]
   PORT=5000
   NODE_ENV=production
   JWT_SECRET=ganti-dengan-secret-key-yang-secure
   FRONTEND_URL=https://temp-url.vercel.app
   ```
6. **Connect ke MySQL** → Run `database/production-setup.sql`

### 3️⃣ **Deploy Frontend ke Vercel (5 minit)**
1. **[vercel.com](https://vercel.com)** → Login with GitHub  
2. **New Project** → Pilih repository
3. **Configure**:
   - Framework: React
   - Root Directory: `frontend`
   - Build Command: `npm run build`
4. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app
   ```
5. **Deploy** 

### 4️⃣ **Final Connect (2 minit)**
1. **Copy Vercel URL** → Update Railway `FRONTEND_URL` variable
2. **Test** → Buka frontend URL, semua patut berfungsi!

---

## 📱 **URLs Anda**
- **Frontend (Users)**: `https://your-app.vercel.app`
- **Backend (API)**: `https://your-backend.railway.app`

## 💰 **Cost**
- **Development**: $0/bulan (free tiers)
- **Production**: ~$5-10/bulan (Railway usage after free tier)

## 🆘 **Quick Troubleshooting**
- **Backend tak start**: Check Railway logs & environment variables
- **Frontend tak connect**: Check `REACT_APP_API_URL` & CORS settings  
- **Database error**: Verify MySQL connection & schema setup

## 📋 **Quick Test Checklist**
- [ ] ✅ Backend responds: `https://your-backend.railway.app`
- [ ] ✅ Frontend loads: `https://your-app.vercel.app` 
- [ ] ✅ Can add villages, parties, votes
- [ ] ✅ Real-time charts update
- [ ] ✅ File upload works

---

**🎉 Sistem siap dalam 20-30 minit!**

**📖 Untuk panduan detail**: Baca `SETUP-GUIDE-DETAILED.md`