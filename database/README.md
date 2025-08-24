# Database Setup for PRU Voting System

## XAMPP MySQL Setup Instructions

### 1. Start XAMPP
- Start Apache and MySQL services in XAMPP Control Panel
- Access phpMyAdmin at: http://localhost/phpmyadmin

### 2. Import Database Schema
1. Open phpMyAdmin in your browser
2. Click on "Import" tab
3. Choose file: `schema.sql`
4. Click "Go" to execute

Alternatively, use MySQL command line:
```bash
mysql -u root -p < schema.sql
```

### 3. Database Configuration
- **Database Name**: `pru_voting_system`
- **Host**: `localhost`
- **Port**: `3306`
- **Username**: `root`
- **Password**: *(empty by default in XAMPP)*

### 4. Environment Variables
Create a `.env` file in the backend directory with:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=pru_voting_system
```

### 5. Database Features
- **15,000 voter capacity** with optimized indexes
- **Real-time statistics** through views
- **Audit trail** with vote_logs table
- **Malaysian political parties** pre-loaded
- **Village management** system
- **Stored procedures** for secure voting

### 6. Tables Overview
- `voters` - Voter registration and voting status
- `villages` - Village/constituency management
- `parties` - Political party information
- `vote_logs` - Audit trail for all votes
- `system_settings` - Configuration settings

### 7. Security Features
- IC number uniqueness constraint
- Foreign key relationships
- Stored procedure for vote casting
- IP address logging
- Transaction safety