# 🚀 TaskMan MVP Demo Setup Guide

## Prerequisites Check ✅
- [x] Node.js installed
- [x] MySQL available (via Anaconda)
- [x] Git repository cloned

## Step-by-Step Setup

### 1. Database Setup

**Option A: Use existing MySQL (Recommended)**
```bash
# Try to connect to MySQL
mysql -u root -p

# If successful, create database:
CREATE DATABASE taskman;
USE taskman;
SOURCE backend/database/schema.sql;
```

**Option B: Install MySQL via Homebrew (if needed)**
```bash
brew install mysql
brew services start mysql
mysql -u root -p -e "CREATE DATABASE taskman;"
mysql -u root -p taskman < backend/database/schema.sql
```

**Option C: Use SQLite for Demo (Simplest)**
- We can modify the backend to use SQLite for demo purposes
- No MySQL setup required

### 2. Backend Setup

```bash
cd backend
npm install
```

**Configure Environment (.env file):**
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=taskman

# JWT
JWT_SECRET=demo-jwt-secret-key-for-mvp-demo-only
JWT_EXPIRES_IN=7d

# Email (Optional for demo - can skip email verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# File upload
MAX_FILE_SIZE=10485760
MAX_FILES_PER_TASK=3
```

**Start Backend:**
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend/taskman-frontend
npm install
ng serve
```

### 4. Access Application

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/api/health

## Demo Flow

### 1. Register as Lead
- Go to http://localhost:4200/register
- Fill in: email, password, first name, last name
- Check email for 6-digit OTP (if email configured)
- Verify account

### 2. Login
- Go to http://localhost:4200/login
- Use registered credentials

### 3. Create Tasks
- Click "Create Task" (Lead only)
- Add title, description, due date, project tag
- Assign to members

### 4. Invite Members
- Go to "Invite" section
- Send invitations to team members
- Members can accept and set passwords

### 5. Manage Tasks
- View tasks in dashboard
- Update status (following business rules)
- Add comments and attachments
- Export data (Lead only)

## Troubleshooting

### Database Connection Issues
```bash
# Check MySQL status
mysql -u root -p -e "SELECT 1;"

# If MySQL not running, try:
brew services start mysql
# or
sudo /usr/local/mysql/support-files/mysql.server start
```

### Port Conflicts
- Backend runs on port 3000
- Frontend runs on port 4200
- Change ports in .env and angular.json if needed

### Email Issues
- For demo, you can skip email verification
- Modify backend to auto-verify accounts for demo

## Quick Demo Modifications

### Skip Email Verification (Demo Only)
Edit `backend/src/routes/auth.js`:
```javascript
// Comment out email verification for demo
// const emailSent = await emailService.sendOTP(email, otp);
// if (!emailSent) {
//   return res.status(500).json({ message: 'Failed to send verification email' });
// }

// Auto-verify for demo
await User.updateVerificationStatus(userId, true);
```

### Use SQLite for Demo
```bash
cd backend
npm install sqlite3
# Modify database config to use SQLite
```

## Demo Script

1. **Show Registration**: "Here's how leads register with email verification"
2. **Show Dashboard**: "Leads get a comprehensive dashboard with statistics"
3. **Create Task**: "Leads can create tasks with all required fields"
4. **Assign Tasks**: "Tasks can be assigned to multiple members"
5. **Status Updates**: "Members can only move tasks through allowed transitions"
6. **Deadline Colors**: "Deadlines are color-coded based on urgency"
7. **File Attachments**: "Files can be uploaded to tasks"
8. **Comments**: "Team collaboration through comments"
9. **Export**: "Leads can export data to CSV"
10. **Invitations**: "Lead-only member invitation system"

## Performance Metrics (from PRD)

- ✅ Time to create & assign task: < 180s
- ✅ Task completion tracking
- ✅ Invite acceptance rate
- ✅ Team adoption metrics

## Next Steps After Demo

1. Deploy to production
2. Set up proper email service
3. Configure production database
4. Add monitoring and logging
5. Implement additional features
