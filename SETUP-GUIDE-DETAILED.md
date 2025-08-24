# 🇲🇾 Panduan Setup Terperinci - PRU Voting System 2025

## 🎯 **Matlamat**: Menyediakan sistem pengundian secara online menggunakan Github, Railway dan Vercel

---

## 📋 **Keperluan Asas**

Sebelum memulakan, pastikan anda ada:
- ✅ Akaun Github (percuma) - [github.com](https://github.com)
- ✅ Akaun Railway (percuma) - [railway.app](https://railway.app) 
- ✅ Akaun Vercel (percuma) - [vercel.com](https://vercel.com)
- ✅ Git dipasang di komputer
- ✅ Node.js versi 16+ dipasang

---

## 🚀 **LANGKAH 1: Setup Github Repository**

### **1.1 Buat Repository Baru di Github**
```bash
# Buka terminal/command prompt di folder project anda
cd C:\xampp\htdocs\PRU-Voting-System

# Initialize git repository
git init

# Tambah semua fail ke staging
git add .

# Buat commit pertama
git commit -m "Initial commit: PRU Voting System 2025"

# Tukar branch name ke 'main'
git branch -M main
```

### **1.2 Connect ke Github Repository**
1. **Pergi ke [github.com](https://github.com)**
2. **Klik "New repository"** (butang hijau)
3. **Nama repository**: `PRU-Voting-System-2025`
4. **Pastikan "Public"** dipilih (untuk deployment percuma)
5. **JANGAN** tick "Initialize with README" 
6. **Klik "Create repository"**

### **1.3 Push Code ke Github**
```bash
# Gantikan YOUR_USERNAME dengan username Github anda
git remote add origin https://github.com/YOUR_USERNAME/PRU-Voting-System-2025.git

# Push code ke Github
git push -u origin main
```

✅ **Hasil**: Code anda sekarang ada di Github!

---

## 🗄️ **LANGKAH 2: Setup Database di Railway**

### **2.1 Daftar Akaun Railway**
1. **Pergi ke [railway.app](https://railway.app)**
2. **Klik "Login with GitHub"**
3. **Authorize Railway** untuk access Github anda

### **2.2 Buat MySQL Database**
1. **Dashboard Railway** → Klik **"New Project"**
2. **Pilih "Provision MySQL"**
3. **Tunggu 2-3 minit** sehingga database siap
4. **Database siap** - akan ada connection string

### **2.3 Dapatkan Database Connection Details**
1. **Klik pada MySQL service** yang baru dibuat
2. **Pergi ke tab "Connect"**
3. **Copy maklumat ini** (simpan untuk langkah seterusnya):
   ```
   Host: [railway-host].railway.app
   Port: [port-number]
   User: root
   Password: [generated-password]
   Database: railway
   ```

### **2.4 Setup Database Schema**
1. **Download MySQL client** (contoh: MySQL Workbench, phpMyAdmin, atau Sequel Pro)
2. **Connect** menggunakan details dari langkah 2.3
3. **Run SQL commands** dari fail `database/production-setup.sql`:

```sql
-- Copy semua command dari database/production-setup.sql dan run
CREATE TABLE villages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    registered_voters INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE parties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL,
    logo_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE voters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    village_id INT,
    party_id INT,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE CASCADE,
    FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE
);
```

✅ **Hasil**: Database MySQL siap di Railway dengan semua table!

---

## 🖥️ **LANGKAH 3: Deploy Backend ke Railway**

### **3.1 Buat Backend Service**
1. **Balik ke Railway dashboard**
2. **Klik "New Service"** dalam project yang sama
3. **Pilih "GitHub Repo"**
4. **Pilih repository** `PRU-Voting-System-2025`
5. **Railway akan auto-detect** Node.js project

### **3.2 Configure Root Directory**
1. **Pergi ke tab "Settings"** untuk service yang baru dibuat
2. **Cari "Service Settings"**
3. **Set "Root Directory"** kepada: `backend`
4. **Set "Start Command"** kepada: `npm start`

### **3.3 Set Environment Variables**
1. **Pergi ke tab "Variables"**
2. **Add variable satu persatu**:

```env
DB_HOST=[your-railway-mysql-host]
DB_USER=root
DB_PASSWORD=[your-railway-mysql-password]
DB_NAME=railway
DB_PORT=[your-railway-mysql-port]
PORT=5000
NODE_ENV=production
JWT_SECRET=super-secret-jwt-key-ganti-ini-dengan-sesuatu-yang-secure
FRONTEND_URL=https://temporary-url.vercel.app
```

**⚠️ Penting**: Gantikan values dalam `[...]` dengan values sebenar dari database anda di langkah 2.3

### **3.4 Deploy Backend**
1. **Railway akan auto-deploy** selepas environment variables di-set
2. **Tunggu deployment** selesai (5-10 minit)
3. **Copy backend URL** - contoh: `https://your-backend-name.railway.app`

### **3.5 Test Backend**
1. **Buka browser** dan pergi ke backend URL
2. **Anda patut nampak**: Response dari API (mungkin error page, tapi itu OK)
3. **Test API endpoint**: `https://your-backend-name.railway.app/api/villages`

✅ **Hasil**: Backend API sudah live di Railway!

---

## 🌐 **LANGKAH 4: Deploy Frontend ke Vercel**

### **4.1 Daftar Akaun Vercel**
1. **Pergi ke [vercel.com](https://vercel.com)**
2. **Klik "Sign Up"**
3. **Pilih "Continue with GitHub"**
4. **Authorize Vercel** untuk access Github anda

### **4.2 Import Project**
1. **Dashboard Vercel** → Klik **"New Project"**
2. **Pilih repository** `PRU-Voting-System-2025`
3. **Configure project settings**:
   - **Framework Preset**: React
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### **4.3 Set Environment Variables**
1. **Sebelum deploy**, klik **"Environment Variables"**
2. **Add variable**:
   ```
   Name: REACT_APP_API_URL
   Value: https://your-backend-name.railway.app
   ```
   (Guna backend URL dari langkah 3.4)

### **4.4 Deploy Frontend**
1. **Klik "Deploy"**
2. **Tunggu deployment** selesai (3-5 minit)
3. **Copy frontend URL** - contoh: `https://your-project-name.vercel.app`

✅ **Hasil**: Frontend sudah live di Vercel!

---

## 🔗 **LANGKAH 5: Connect Frontend & Backend**

### **5.1 Update Backend CORS Settings**
1. **Balik ke Railway dashboard**
2. **Pilih backend service**
3. **Pergi ke tab "Variables"**
4. **Update FRONTEND_URL**:
   ```
   FRONTEND_URL=https://your-project-name.vercel.app
   ```
   (Guna frontend URL dari langkah 4.4)

### **5.2 Redeploy Backend**
1. **Railway akan auto-redeploy** selepas environment variable diubah
2. **Tunggu redeploy** selesai (2-3 minit)

### **5.3 Test Full System**
1. **Buka frontend URL** di browser
2. **Test fungsi-fungsi**:
   - ✅ Dashboard loads
   - ✅ Villages page
   - ✅ Parties page
   - ✅ Voters page
   - ✅ Real-time updates

✅ **Hasil**: System lengkap sudah berfungsi online!

---

## 📱 **LANGKAH 6: Final Testing & Configuration**

### **6.1 Test Semua Fungsi**
**Frontend Testing**:
- [ ] Dashboard menunjukkan statistik
- [ ] Boleh tambah village baru
- [ ] Boleh tambah party baru
- [ ] Boleh record vote
- [ ] Chart updates secara real-time
- [ ] File upload untuk party logo berfungsi

**Backend Testing**:
- [ ] API endpoints respond
- [ ] Database connection berjaya
- [ ] Socket.IO real-time updates
- [ ] File upload functionality
- [ ] CORS settings betul

### **6.2 Performance Optimization**
```bash
# Untuk optimize lebih lanjut (optional)
# Frontend performance di Vercel automatically optimized
# Railway backend automatically optimized
```

### **6.3 Security Checklist**
- [ ] JWT_SECRET ditukar dari default
- [ ] Database credentials secure
- [ ] HTTPS enabled (automatic pada Railway & Vercel)
- [ ] CORS configured properly
- [ ] Environment variables tidak exposed

---

## 🎉 **SISTEM ANDA SUDAH LIVE!**

### **📋 URLs untuk Reference**:
- **Frontend (Users)**: `https://your-project-name.vercel.app`
- **Backend (API)**: `https://your-backend-name.railway.app`
- **Database**: Railway MySQL (private)

### **📤 Share dengan Users**:
Hantar **frontend URL** kepada pengguna untuk mula menggunakan sistem!

---

## 🆘 **Troubleshooting Guide**

### **❌ Backend Tidak Start**
```bash
# Check Railway logs:
# 1. Pergi ke Railway dashboard
# 2. Klik backend service
# 3. Pergi ke tab "Logs"
# 4. Check error messages
```

**Common Issues**:
- Database connection failed → Check DB credentials
- Port already in use → Railway handles this automatically
- Environment variables missing → Double check all variables set

### **❌ Frontend Tidak Connect ke API**
**Check**:
1. `REACT_APP_API_URL` environment variable di Vercel
2. CORS settings di backend
3. Network tab di browser untuk API errors

### **❌ Database Connection Issues**
**Solutions**:
1. Verify MySQL service running di Railway
2. Check database credentials
3. Ensure database schema created properly

### **❌ Real-time Updates Tidak Berfungsi**
**Check**:
1. Socket.IO connection di browser developer tools
2. WebSocket connections allowed
3. Firewall/proxy settings

---

## 💰 **Cost Breakdown (FREE TIERS)**

### **Railway (Backend + Database)**:
- **Free tier**: 500 execution hours/month
- **Cost after free**: $0.000463/GB-hour
- **Typical usage**: ~$5-10/month for small app

### **Vercel (Frontend)**:
- **Free tier**: Unlimited for personal use
- **Cost after free**: $20/month for pro features
- **Typical usage**: $0/month for personal projects

### **Total Monthly Cost**: 
- **Development/Testing**: $0/month
- **Production (small scale)**: $5-15/month

---

## 🔮 **Next Steps untuk Production**

### **📈 Scaling Options**:
1. **Railway Pro** - More resources
2. **Vercel Pro** - Advanced features
3. **Custom domain** - Professional look
4. **CDN** - Faster file uploads
5. **Monitoring** - Error tracking

### **🔐 Advanced Security**:
1. **Rate limiting** (sudah ada)
2. **Input validation** (sudah ada) 
3. **Authentication system** (optional)
4. **Audit logs** (advanced feature)
5. **Backup strategy** (recommended)

---

## 📞 **Support & Maintenance**

### **🛠️ Regular Maintenance**:
1. **Monitor Railway usage** (monthly)
2. **Update dependencies** (quarterly)
3. **Database backups** (recommended)
4. **Security updates** (as needed)

### **📊 Monitoring Tools**:
1. **Railway Analytics** - Resource usage
2. **Vercel Analytics** - Frontend performance  
3. **Browser DevTools** - Client-side debugging

---

**🎯 Tahniah! Sistem PRU Voting anda sekarang sudah live dan boleh digunakan oleh pengguna!**

---

**📧 Need help?** Contact support atau check documentation untuk more advanced features.

**⭐ Don't forget to star the repository di Github!**