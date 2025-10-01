# TaskMan Application - Configuration TODO

This document outlines all the missing configuration details needed to complete the TaskMan application setup.

## 🚨 Critical Configuration Issues

### Backend (.NET) Configuration

#### 1. JWT Secret Key (HIGH PRIORITY)
**File**: `backend-dotnet/appsettings.json` and `backend-dotnet/appsettings.Development.json`

**Current**:
```json
"JwtSettings": {
  "SecretKey": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
  "Issuer": "TaskMan.Api",
  "Audience": "TaskMan.Client",
  "ExpirationInDays": 7
}
```

**Action Required**: Replace with a secure, randomly generated secret key (minimum 32 characters).

**Generate secure key**:
```bash
# Using PowerShell
[System.Web.Security.Membership]::GeneratePassword(64, 0)

# Using OpenSSL
openssl rand -base64 32

# Manual: Create a random string of 64+ characters
```

#### 2. Email Configuration (HIGH PRIORITY)
**File**: `backend-dotnet/appsettings.json` and `backend-dotnet/appsettings.Development.json`

**Current**:
```json
"EmailSettings": {
  "SmtpServer": "smtp.gmail.com",
  "SmtpPort": 587,
  "SmtpUsername": "your-email@gmail.com",
  "SmtpPassword": "your-app-password",
  "FromEmail": "noreply@taskman.com",
  "FromName": "TaskMan"
}
```

**Action Required**:
1. **Gmail Setup**:
   - Enable 2-Factor Authentication on Gmail account
   - Generate App Password: Google Account → Security → App passwords
   - Use App Password (not regular password)

2. **Update Configuration**:
   ```json
   "EmailSettings": {
     "SmtpServer": "smtp.gmail.com",
     "SmtpPort": 587,
     "SmtpUsername": "your-actual-email@gmail.com",
     "SmtpPassword": "your-16-char-app-password",
     "FromEmail": "your-actual-email@gmail.com",
     "FromName": "TaskMan"
   }
   ```

#### 3. Database Connection (MEDIUM PRIORITY)
**File**: `backend-dotnet/appsettings.json`

**Current**:
```json
"ConnectionStrings": {
  "DefaultConnection": "Data Source=demo.db",
  "SqlServerConnection": "Server=localhost;Database=taskman;User Id=sa;Password=taskman123;TrustServerCertificate=true;"
}
```

**Action Required**: Update SQL Server credentials for production:
```json
"ConnectionStrings": {
  "DefaultConnection": "Data Source=demo.db",
  "SqlServerConnection": "Server=your-server;Database=taskman;User Id=your-user;Password=your-secure-password;TrustServerCertificate=true;"
}
```

### Frontend (Angular) Configuration

#### 1. API Base URLs (HIGH PRIORITY)
**Files**: All service files in `frontend/taskman-frontend/src/app/services/`

**Current Issue**: All services use `http://localhost:3000/api` but backend runs on `https://localhost:7000`

**Files to Update**:
- `auth.service.ts` (line 10)
- `task.service.ts` (line 10) 
- `user.service.ts` (line 10)
- `invite.service.ts` (line 28)

**Action Required**: Change all instances to:
```typescript
private apiUrl = 'https://localhost:7000/api';
```

#### 2. Environment Files (MEDIUM PRIORITY)
**Missing Files**:
- `frontend/taskman-frontend/src/environments/environment.ts`
- `frontend/taskman-frontend/src/environments/environment.prod.ts`

**Action Required**: Create these files:

**environment.ts** (development):
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7000/api',
  appName: 'TaskMan',
  version: '1.0.0'
};
```

**environment.prod.ts** (production):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  appName: 'TaskMan',
  version: '1.0.0'
};
```

#### 3. Update Services to Use Environment (MEDIUM PRIORITY)
**Action Required**: Modify all service files to use environment variables:

```typescript
import { environment } from '../../environments/environment';

export class AuthService {
  private apiUrl = environment.apiUrl;
  // ... rest of service
}
```

## 🔧 Step-by-Step Configuration Guide

### Step 1: Backend Configuration

1. **Generate JWT Secret**:
   ```bash
   # Run this in PowerShell
   [System.Web.Security.Membership]::GeneratePassword(64, 0)
   ```

2. **Update JWT Settings**:
   - Open `backend-dotnet/appsettings.json`
   - Replace `SecretKey` with generated key
   - Repeat for `backend-dotnet/appsettings.Development.json`

3. **Configure Email**:
   - Set up Gmail App Password
   - Update `SmtpUsername` and `SmtpPassword` in both config files
   - Update `FromEmail` to your actual email

4. **Database Setup** (if using SQL Server):
   - Install SQL Server
   - Create database named `taskman`
   - Update connection string with your credentials

### Step 2: Frontend Configuration

1. **Create Environment Files**:
   ```bash
   cd frontend/taskman-frontend/src
   mkdir environments
   # Create environment.ts and environment.prod.ts as shown above
   ```

2. **Update Service Files**:
   - Change all `apiUrl` from `http://localhost:3000/api` to use environment
   - Import environment in each service file
   - Update to `environment.apiUrl`

3. **Test Configuration**:
   ```bash
   # Backend
   cd backend-dotnet
   dotnet run
   
   # Frontend (in new terminal)
   cd frontend/taskman-frontend
   ng serve
   ```

### Step 3: Verification

1. **Backend Health Check**:
   - Visit `https://localhost:7000/api/health`
   - Should return status "OK"

2. **Frontend Connection**:
   - Open `http://localhost:4200`
   - Check browser console for API connection errors
   - Test login/registration

3. **Email Testing**:
   - Register a new user
   - Check if verification email is sent
   - Test invite functionality

## 🚀 Quick Start Commands

### Backend Setup
```bash
cd backend-dotnet
dotnet restore
dotnet run
```

### Frontend Setup
```bash
cd frontend/taskman-frontend
npm install
ng serve
```

### Access Points
- **Frontend**: http://localhost:4200
- **API**: https://localhost:7000
- **Swagger**: https://localhost:7000/swagger
- **Health Check**: https://localhost:7000/api/health

## 📋 Configuration Checklist

### Backend Checklist
- [ ] Generate secure JWT secret key (64+ characters)
- [ ] Update JWT settings in both appsettings files
- [ ] Configure Gmail SMTP with app password
- [ ] Update email settings in both config files
- [ ] Set up SQL Server database (if needed)
- [ ] Update SQL Server connection string
- [ ] Test backend startup
- [ ] Verify Swagger UI access

### Frontend Checklist
- [ ] Create environment.ts file
- [ ] Create environment.prod.ts file
- [ ] Update auth.service.ts API URL
- [ ] Update task.service.ts API URL
- [ ] Update user.service.ts API URL
- [ ] Update invite.service.ts API URL
- [ ] Import environment in all services
- [ ] Test frontend startup
- [ ] Verify API connectivity
- [ ] Test login/registration

### Integration Testing
- [ ] Register new user
- [ ] Login with credentials
- [ ] Create task
- [ ] Upload file attachment
- [ ] Add comment to task
- [ ] Test CSV export
- [ ] Send user invite
- [ ] Verify email functionality

## 🔒 Security Considerations

### Production Deployment
1. **Environment Variables**: Use environment variables for sensitive data
2. **HTTPS**: Always use HTTPS in production
3. **Database Security**: Use encrypted connections
4. **Rate Limiting**: Configure appropriate limits
5. **CORS**: Restrict to specific domains
6. **File Uploads**: Implement proper validation

### Environment Variables (Production)
```bash
# JWT Secret
export JwtSettings__SecretKey="your-production-secret-key"

# Database
export ConnectionStrings__SqlServerConnection="your-production-connection"

# Email
export EmailSettings__SmtpPassword="your-app-password"
```

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Check `FrontendUrl` in appsettings.json
   - Verify frontend URL matches configuration

2. **JWT Token Issues**:
   - Ensure secret key is same in all config files
   - Check token expiration settings
   - Verify Authorization header format

3. **Email Not Sending**:
   - Verify Gmail app password
   - Check SMTP settings
   - Test with different email provider

4. **Database Connection**:
   - Verify SQL Server is running
   - Check connection string format
   - Ensure database exists

5. **Frontend API Errors**:
   - Check API URL in services
   - Verify backend is running
   - Check browser console for errors

## 📚 Additional Resources

- [Setup Guide](SETUP_GUIDE.md) - Detailed setup instructions
- [Backend Documentation](backend-dotnet/README.md)
- [Frontend Documentation](frontend/taskman-frontend/README.md)
- [API Documentation](https://localhost:7000/swagger) (when running)

---

**Note**: This TODO list should be completed before deploying to production. All HIGH PRIORITY items must be addressed for the application to function properly.
