# TaskMan Application Setup Guide

This guide will help you set up and run the TaskMan application with Angular frontend and .NET backend.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)
- **.NET 8 SDK** - Download from [Microsoft's website](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Angular CLI** - Install globally: `npm install -g @angular/cli`

### Recommended Tools
- **Visual Studio Code** with C# and Angular extensions
- **Git** for version control
- **SQL Server** (for production) or SQLite (for development)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd taskMan-application
```

### 2. Backend Setup (.NET API)

```bash
# Navigate to backend directory
cd backend-dotnet

# Restore dependencies
dotnet restore

# Run the application
dotnet run
```

The API will be available at:
- **HTTPS**: `https://localhost:7000`
- **HTTP**: `http://localhost:5000`
- **Swagger UI**: `https://localhost:7000/swagger`

### 3. Frontend Setup (Angular)

```bash
# Navigate to frontend directory
cd frontend/taskman-frontend

# Install dependencies
npm install

# Start the development server
ng serve
```

The frontend will be available at `http://localhost:4200`

### 4. Access the Application

- **Frontend**: http://localhost:4200
- **API Documentation**: https://localhost:7000/swagger
- **Health Check**: https://localhost:7000/api/health

## Detailed Setup Instructions

### Backend Configuration

#### 1. Update Configuration

Edit `backend-dotnet/appsettings.json`:

```json
{
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "TaskMan.Api",
    "Audience": "TaskMan.Client",
    "ExpirationInDays": 7
  },
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=demo.db",
    "SqlServerConnection": "Server=localhost;Database=taskman;User Id=sa;Password=YourPassword;TrustServerCertificate=true;"
  },
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "SmtpUsername": "your-email@gmail.com",
    "SmtpPassword": "your-app-password",
    "FromEmail": "noreply@taskman.com",
    "FromName": "TaskMan"
  },
  "FrontendUrl": "http://localhost:4200"
}
```

#### 2. Database Setup

**For Development (SQLite)**:
- The SQLite database will be created automatically
- No additional setup required

**For Production (SQL Server)**:
1. Install SQL Server
2. Create a database named `taskman`
3. Update the connection string in `appsettings.json`
4. Run the application to create tables

#### 3. Run Backend

```bash
cd backend-dotnet

# Development mode with hot reload
dotnet watch run

# Or regular run
dotnet run
```

### Frontend Configuration

#### 1. Install Dependencies

```bash
cd frontend/taskman-frontend
npm install
```

#### 2. Update API Configuration (if needed)

The frontend is configured to connect to `https://localhost:7000` by default. If your backend runs on a different port, update the API base URL in the service files.

#### 3. Run Frontend

```bash
# Development mode with hot reload
ng serve

# Or with specific port
ng serve --port 4200
```

## Testing the Setup

### 1. Test Backend API

Visit the Swagger UI at `https://localhost:7000/swagger` to test API endpoints.

### 2. Register a User

```bash
curl -X POST https://localhost:7000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@taskman.com",
    "password": "password123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "lead"
  }'
```

### 3. Login

```bash
curl -X POST https://localhost:7000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@taskman.com",
    "password": "password123"
  }'
```

### 4. Test Frontend

1. Open `http://localhost:4200` in your browser
2. Register a new user or login with existing credentials
3. Create tasks and test the functionality

## Development Workflow

### Backend Development

```bash
cd backend-dotnet

# Run with hot reload
dotnet watch run

# Build for production
dotnet build --configuration Release

# Publish for deployment
dotnet publish --configuration Release --output ./publish
```

### Frontend Development

```bash
cd frontend/taskman-frontend

# Run with hot reload
ng serve --watch

# Build for production
ng build --configuration production

# Run tests
ng test

# Run linting
ng lint
```

## Environment Configuration

### Development Environment

Set environment variables for development:

```bash
# Windows
set ASPNETCORE_ENVIRONMENT=Development
set JwtSettings__SecretKey=YourDevelopmentSecretKey

# Linux/Mac
export ASPNETCORE_ENVIRONMENT=Development
export JwtSettings__SecretKey=YourDevelopmentSecretKey
```

### Production Environment

```bash
# Windows
set ASPNETCORE_ENVIRONMENT=Production
set ConnectionStrings__SqlServerConnection=YourProductionConnectionString

# Linux/Mac
export ASPNETCORE_ENVIRONMENT=Production
export ConnectionStrings__SqlServerConnection=YourProductionConnectionString
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Backend (Port 5000/7000)**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**Frontend (Port 4200)**:
```bash
# Use different port
ng serve --port 4201
```

#### 2. Database Connection Issues

- Check connection string format
- Ensure SQL Server is running (for production)
- Verify database exists
- Check firewall settings

#### 3. JWT Token Issues

- Ensure secret key is at least 32 characters
- Check token expiration time
- Verify token format in Authorization header
- Ensure frontend and backend use same secret key

#### 4. CORS Issues

- Verify `FrontendUrl` in `appsettings.json`
- Check CORS policy configuration
- Ensure frontend URL matches configuration

#### 5. Angular Build Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Update Angular CLI
npm install -g @angular/cli@latest
```

### Logs and Debugging

#### Backend Logs
- **Console**: During development
- **Files**: `logs/taskman-YYYY-MM-DD.txt` in production
- **Swagger**: API documentation and testing

#### Frontend Logs
- **Browser Console**: F12 Developer Tools
- **Network Tab**: Check API requests/responses
- **Angular CLI**: Detailed error messages

### Health Checks

Test if services are running:

```bash
# Backend health check
curl https://localhost:7000/api/health

# Expected response
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00Z",
  "database": "SQLite",
  "message": "TaskMan API is running!"
}
```

## Production Deployment

### Backend Deployment

1. **Build for production**:
   ```bash
   cd backend-dotnet
   dotnet publish -c Release --output ./publish
   ```

2. **Configure production settings**:
   - Update `appsettings.Production.json`
   - Set environment variables
   - Configure database connection

3. **Deploy to hosting platform**:
   - Azure App Service
   - AWS Elastic Beanstalk
   - Docker containers
   - IIS (Windows)

### Frontend Deployment

1. **Build for production**:
   ```bash
   cd frontend/taskman-frontend
   ng build --configuration production
   ```

2. **Deploy static files**:
   - Azure Static Web Apps
   - AWS S3 + CloudFront
   - Netlify
   - Vercel

### Docker Deployment (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend-dotnet
    ports:
      - "5000:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Data Source=/app/data/demo.db
  
  frontend:
    build: ./frontend/taskman-frontend
    ports:
      - "4200:80"
    depends_on:
      - backend
```

## Security Considerations

### Production Security

1. **JWT Secret Key**: Use a strong, unique secret key
2. **HTTPS**: Always use HTTPS in production
3. **Database Security**: Use strong passwords and encrypted connections
4. **Rate Limiting**: Configure appropriate rate limits
5. **CORS**: Restrict CORS to specific domains
6. **Input Validation**: Ensure all inputs are validated
7. **File Uploads**: Implement file type and size restrictions

### Environment Variables

Use environment variables for sensitive configuration:

```bash
# JWT Secret
export JwtSettings__SecretKey="YourProductionSecretKey"

# Database Connection
export ConnectionStrings__SqlServerConnection="Server=prod-server;Database=taskman;User Id=user;Password=password;TrustServerCertificate=true;"

# Email Settings
export EmailSettings__SmtpPassword="your-app-password"
```

## Support and Resources

### Documentation
- [Angular Documentation](https://angular.io/docs)
- [.NET Documentation](https://docs.microsoft.com/en-us/dotnet/)
- [Entity Framework Documentation](https://docs.microsoft.com/en-us/ef/)

### Getting Help
1. Check the logs for error details
2. Review the API documentation at `/swagger`
3. Verify configuration settings
4. Test individual components
5. Check network connectivity

### Community Resources
- [Angular Community](https://angular.io/community)
- [.NET Community](https://dotnet.microsoft.com/community)
- [Stack Overflow](https://stackoverflow.com/)

## Next Steps

After successful setup:

1. **Explore the Application**: Test all features and functionality
2. **Customize Configuration**: Adjust settings for your environment
3. **Add Features**: Extend the application with new functionality
4. **Set Up Monitoring**: Implement logging and monitoring
5. **Deploy to Production**: Follow deployment guidelines
6. **Create Tests**: Add unit and integration tests
7. **Documentation**: Update documentation for your specific use case

The TaskMan application is now ready for development and production use!