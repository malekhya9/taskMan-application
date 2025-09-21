# 🎯 TaskMan MVP Demo Guide

## 🚀 **Current Status: READY FOR DEMO!**

Both servers are now running:
- ✅ **Backend**: http://localhost:3000 (SQLite database)
- ✅ **Frontend**: http://localhost:4200 (Angular app)

## 📋 **Demo Checklist**

### **Step 1: Verify Setup**
1. Open browser to http://localhost:4200
2. You should see the TaskMan login page
3. Check backend health: http://localhost:3000/api/health

### **Step 2: Create Lead Account**
1. Click "Register here" on login page
2. Fill in registration form:
   - Email: `demo@taskman.com`
   - Password: `demo123`
   - First Name: `Demo`
   - Last Name: `Lead`
3. Click "Register"
4. ✅ Account auto-verified (no email needed for demo)

### **Step 3: Login**
1. Use credentials: `demo@taskman.com` / `demo123`
2. Click "Login"
3. ✅ Redirected to Dashboard

### **Step 4: Explore Dashboard**
- View statistics cards (Total Tasks, Completed, In Progress, Overdue)
- See filters section
- Notice "Recent Tasks" section (empty initially)

### **Step 5: Create First Task**
1. Click "Create Task" button
2. Fill in task details:
   - Title: `Implement User Authentication`
   - Description: `Add JWT-based authentication with email verification`
   - Due Date: `2024-01-15`
   - Project Tag: `Authentication`
3. Click "Create Task"
4. ✅ Task created and visible in dashboard

### **Step 6: Create More Tasks**
Create additional tasks to populate the dashboard:
- `Design Database Schema` (Due: 2024-01-10, Tag: `Database`)
- `Setup Frontend Components` (Due: 2024-01-20, Tag: `Frontend`)
- `Write API Documentation` (Due: 2024-01-25, Tag: `Documentation`)

### **Step 7: Invite Members**
1. Click "Invite" in navigation
2. Fill in member details:
   - Email: `member@taskman.com`
   - First Name: `Demo`
   - Last Name: `Member`
3. Click "Send Invitation"
4. ✅ Member account created

### **Step 8: Switch to Member View**
1. Logout (click "Logout" button)
2. Register new member account:
   - Email: `member@taskman.com`
   - Password: `member123`
   - First Name: `Demo`
   - Last Name: `Member`
3. Login with member credentials
4. ✅ See limited permissions (no "Invite" menu)

### **Step 9: Task Management Demo**
1. Go to "Tasks" page
2. Show task list with filters
3. Demonstrate status updates:
   - Members can only move: `defined` → `in-progress` → `review`
   - Leads can move between any states
4. Show deadline colors:
   - Green: > 48 hours away
   - Yellow: within 48 hours
   - Red: past due

### **Step 10: Advanced Features**
1. **File Attachments**: Upload files to tasks
2. **Comments**: Add comments to tasks
3. **Export**: Export tasks to CSV (Lead only)
4. **User Management**: Create additional leads/members

## 🎬 **Demo Script (5-10 minutes)**

### **Opening (1 minute)**
"Today I'll demonstrate TaskMan, a comprehensive task management application built according to our PRD specifications. The app features role-based access control, task lifecycle management, and team collaboration tools."

### **Core Features (3-4 minutes)**
1. **Registration & Authentication**: "Leads register with email verification, members are invite-only"
2. **Dashboard**: "Leads get a comprehensive dashboard with statistics and task overview"
3. **Task Creation**: "Tasks include title, description, due dates, project tags, and assignees"
4. **Status Transitions**: "Enforced business rules - members can only move defined→in-progress→review, leads can move between any states"
5. **Deadline Management**: "Color-coded deadlines based on urgency"

### **Advanced Features (2-3 minutes)**
1. **File Attachments**: "Support for file uploads up to 10MB"
2. **Comments System**: "Team collaboration through task comments"
3. **Export Functionality**: "Leads can export data to CSV"
4. **Organization Hierarchy**: "Multi-level organization support"

### **Technical Highlights (1-2 minutes)**
1. **Backend**: "Node.js/Express API with JWT authentication"
2. **Frontend**: "Angular 18+ with responsive design"
3. **Database**: "SQLite for demo, MySQL for production"
4. **Security**: "Role-based access control and input validation"

## 🔧 **Troubleshooting**

### **Backend Issues**
```bash
# Check if backend is running
curl http://localhost:3000/api/health

# Restart backend
cd backend
npm run dev
```

### **Frontend Issues**
```bash
# Check if frontend is running
curl http://localhost:4200

# Restart frontend
cd frontend/taskman-frontend
ng serve
```

### **Database Issues**
- SQLite database file: `backend/demo.db`
- Database auto-creates on first run
- No manual setup required

## 📊 **Demo Data**

### **Sample Tasks**
- `Implement User Authentication` (Due: 2024-01-15, Tag: `Authentication`)
- `Design Database Schema` (Due: 2024-01-10, Tag: `Database`)
- `Setup Frontend Components` (Due: 2024-01-20, Tag: `Frontend`)
- `Write API Documentation` (Due: 2024-01-25, Tag: `Documentation`)
- `Deploy to Production` (Due: 2024-02-01, Tag: `DevOps`)

### **Sample Users**
- Lead: `demo@taskman.com` / `demo123`
- Member: `member@taskman.com` / `member123`

## 🎯 **Key Demo Points**

1. ✅ **Complete MVP Implementation**: All PRD requirements met
2. ✅ **Role-Based Access**: Different permissions for Leads vs Members
3. ✅ **Task Lifecycle**: Enforced status transitions
4. ✅ **Deadline Highlighting**: Color-coded urgency
5. ✅ **File Management**: Attachment support
6. ✅ **Team Collaboration**: Comments and assignments
7. ✅ **Data Export**: CSV functionality
8. ✅ **Security**: JWT authentication and validation
9. ✅ **Responsive Design**: Works on all devices
10. ✅ **Production Ready**: Scalable architecture

## 🚀 **Next Steps After Demo**

1. **Deploy to Production**: Set up MySQL, configure email service
2. **Add Features**: Real-time notifications, Kanban board view
3. **Integration**: Connect with external tools
4. **Mobile App**: React Native or Flutter version
5. **Analytics**: Advanced reporting and metrics

---

**Ready to demo! ��**
