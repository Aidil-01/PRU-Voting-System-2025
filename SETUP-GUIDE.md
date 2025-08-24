# PRU Voting System - Setup Guide

Complete step-by-step setup guide for the Malaysian Election Voting System.

## 📋 Prerequisites

Before starting, ensure you have:

- **XAMPP 8.0+** (includes Apache & MySQL)
- **Node.js 18+** 
- **npm 8+** or **yarn**
- **Git** (optional, for version control)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🗃️ Step 1: Database Setup (XAMPP)

### 1.1 Start XAMPP Services

1. Open **XAMPP Control Panel** as Administrator
2. Start **Apache** service (port 80)
3. Start **MySQL** service (port 3306)
4. Ensure both services show **green "Running"** status

### 1.2 Access phpMyAdmin

1. Open browser and go to: http://localhost/phpmyadmin
2. Login with:
   - **Username**: `root`
   - **Password**: *(leave empty)*

### 1.3 Import Database Schema

1. In phpMyAdmin, click **"Import"** tab
2. Click **"Choose File"** and select: `database/schema.sql`
3. Click **"Go"** to execute the import
4. Verify database `pru_voting_system` is created with tables

### 1.4 Verify Database Structure

Confirm these tables exist:
- ✅ `voters` (20 sample records)
- ✅ `villages` (10 records)
- ✅ `parties` (10 Malaysian political parties)
- ✅ `vote_logs` (empty, ready for voting)
- ✅ `system_settings` (configuration)

## 🖥️ Step 2: Backend Setup (Node.js API)

### 2.1 Navigate to Backend Directory

```bash
cd "C:\Users\pc\OneDrive - ums.edu.my\Desktop\PRU Voting System\backend"
```

### 2.2 Install Dependencies

```bash
npm install
```

**Expected packages:**
- express (API server)
- mysql2 (database connection)
- socket.io (real-time updates)
- cors (cross-origin requests)
- dotenv (environment variables)
- helmet (security)

### 2.3 Configure Environment

The `.env` file should already exist with:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=pru_voting_system
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 2.4 Start Backend Server

```bash
npm run dev
```

**Expected output:**
```
🚀 PRU Voting System Server Started
=====================================
🌐 Server running on: http://localhost:5000
📊 API Health Check: http://localhost:5000/api/health
✅ Connected to MySQL database successfully
🔄 Socket.io enabled for real-time updates
```

### 2.5 Test Backend API

Open browser and test:
- http://localhost:5000/api/health (should show database status)
- http://localhost:5000/api/info (should show system information)
- http://localhost:5000/api/parties (should show political parties)

## 🎨 Step 3: Frontend Setup (React App)

### 3.1 Open New Terminal

Keep backend running and open new terminal:

```bash
cd "C:\Users\pc\OneDrive - ums.edu.my\Desktop\PRU Voting System\frontend"
```

### 3.2 Install Dependencies

```bash
npm install
```

**Expected packages:**
- react (UI framework)
- tailwindcss (styling)
- socket.io-client (real-time updates)
- axios (API requests)
- recharts (charts)
- heroicons (icons)

### 3.3 Install Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
```

### 3.4 Start Frontend Development Server

```bash
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view pru-voting-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.100:3000
```

## 🌐 Step 4: Access the Application

### 4.1 Open Application

1. **Main Application**: http://localhost:3000
2. **Backend API**: http://localhost:5000
3. **Database Admin**: http://localhost/phpmyadmin

### 4.2 Verify Real-time Connection

In the application header, you should see:
- ✅ **"Sambungan Aktif"** (Connection Active) - green indicator
- 🔴 **"LANGSUNG"** (LIVE) - red pulsing dot

### 4.3 Test Dashboard Features

1. **Statistics Cards** - Should show sample data
2. **Party Charts** - Bar and pie charts with sample votes
3. **Village Turnout** - List of villages with turnout percentages
4. **Recent Activity** - Will be empty initially

## 🗳️ Step 5: Test Voting System

### 5.1 Add Test Voter (API)

Use browser or Postman:
```
POST http://localhost:5000/api/voters
Content-Type: application/json

{
  "name": "Ahmad bin Ali",
  "ic_number": "901234567890",
  "village_id": 1
}
```

### 5.2 Cast Test Vote (API)

```
POST http://localhost:5000/api/voters/vote
Content-Type: application/json

{
  "voter_id": 21,
  "party_id": 1
}
```

### 5.3 Verify Real-time Updates

After casting vote, the dashboard should automatically update:
- Statistics cards refresh
- Charts update with new data
- Recent activity shows the vote

## 🔧 Step 6: Optional Configuration

### 6.1 Change Server Ports

If ports 3000 or 5000 are busy:

**Backend port** (edit `backend/.env`):
```env
PORT=5001
```

**Frontend port** (create `frontend/.env.local`):
```env
PORT=3001
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SOCKET_URL=http://localhost:5001
```

### 6.2 Enable Production Mode

**Backend** (edit `backend/.env`):
```env
NODE_ENV=production
```

**Frontend build**:
```bash
cd frontend
npm run build
```

### 6.3 Configure MySQL Security

For production use:

1. In phpMyAdmin, go to **User accounts**
2. Create new user with secure password
3. Grant privileges to `pru_voting_system` database only
4. Update `backend/.env` with new credentials

## 🚨 Troubleshooting

### Issue: Cannot connect to database
**Solution:**
1. Ensure XAMPP MySQL is running
2. Check phpMyAdmin works: http://localhost/phpmyadmin
3. Verify database `pru_voting_system` exists
4. Check `backend/.env` database credentials

### Issue: Frontend cannot reach backend
**Solution:**
1. Ensure backend is running on port 5000
2. Test: http://localhost:5000/api/health
3. Check CORS settings in `backend/server.js`
4. Verify `FRONTEND_URL` in backend `.env`

### Issue: Real-time updates not working
**Solution:**
1. Check browser console for WebSocket errors
2. Verify "Sambungan Aktif" shows in header
3. Test Socket.io connection manually
4. Check firewall blocking WebSocket connections

### Issue: Charts not displaying
**Solution:**
1. Ensure `recharts` is installed
2. Check browser console for React errors
3. Verify API returns valid chart data
4. Test: http://localhost:5000/api/voters/stats

### Issue: Malaysian IC validation failing
**Solution:**
1. Ensure IC format: 12 digits (no hyphens in API)
2. Frontend can display: 123456-78-9012
3. Backend stores: 123456789012
4. Check validation in `utils/helpers.js`

## 📱 Step 7: Mobile Testing

### 7.1 Test on Mobile Device

1. Find your computer's IP address
2. On mobile, visit: `http://[YOUR-IP]:3000`
3. Example: `http://192.168.1.100:3000`

### 7.2 Verify Mobile Features

- ✅ Responsive design works
- ✅ Touch interactions function
- ✅ Charts are readable
- ✅ Navigation menu adapts

## ✅ Setup Complete!

Your PRU Voting System is now ready with:

- 🗄️ **MySQL database** with sample data
- 🖥️ **Node.js backend** with API and Socket.io
- 🎨 **React frontend** with real-time updates
- 📊 **Interactive charts** with export capabilities
- 📱 **Mobile-responsive** design
- 🔐 **Security features** and validation

## 🎯 Next Steps

1. **Add Real Voters** - Use the voter registration system
2. **Create Parties** - Add or modify political parties
3. **Manage Villages** - Set up actual constituencies  
4. **Start Voting** - Begin the election process
5. **Monitor Live** - Watch real-time statistics
6. **Export Results** - Download charts and data

## 📞 Need Help?

- 📚 **Check README.md** for detailed documentation
- 🗃️ **Database guide**: `database/README.md`
- 🐛 **Report issues**: Create GitHub issue
- 💡 **Feature requests**: Contact system administrator

**System ready for Malaysian Elections! 🇲🇾**