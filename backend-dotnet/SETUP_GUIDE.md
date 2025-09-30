# TaskMan .NET Backend Setup Guide

This guide will help you set up and run the TaskMan .NET backend API.

## Prerequisites

Before you begin, ensure you have the following installed:

- **.NET 8 SDK** - Download from [Microsoft's website](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Visual Studio 2022** or **Visual Studio Code** (recommended)
- **SQL Server** (for production) or **SQLite** (for development)

## Quick Start

### 1. Clone and Navigate to Project

```bash
git clone <repository-url>
cd backend-dotnet
```

### 2. Restore Dependencies

```bash
dotnet restore
```

### 3. Configure Settings

Update `appsettings.json` with your configuration:

```json
{
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=demo.db"
  }
}
```

### 4. Run the Application

```bash
dotnet run
```

The API will be available at:
- **HTTPS**: `https://localhost:7000`
- **HTTP**: `http://localhost:5000`

### 5. Test the API

Visit the Swagger UI at `https://localhost:7000/swagger` to explore and test the API endpoints.

## Detailed Setup

### Database Configuration

#### For Development (SQLite)
The SQLite database will be created automatically when you first run the application. No additional setup required.

#### For Production (SQL Server)
1. Install SQL Server
2. Create a database named `taskman`
3. Update the connection string in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "SqlServerConnection": "Server=localhost;Database=taskman;User Id=sa;Password=YourPassword;TrustServerCertificate=true;"
  }
}
```

### Email Configuration (Optional)

If you want to use email features, configure SMTP settings:

```json
{
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "SmtpUsername": "your-email@gmail.com",
    "SmtpPassword": "your-app-password",
    "FromEmail": "noreply@taskman.com",
    "FromName": "TaskMan"
  }
}
```

### JWT Configuration

Generate a secure secret key for JWT tokens:

```json
{
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "TaskMan.Api",
    "Audience": "TaskMan.Client",
    "ExpirationInDays": 7
  }
}
```

## API Testing

### 1. Register a User

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

### 2. Login

```bash
curl -X POST https://localhost:7000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@taskman.com",
    "password": "password123"
  }'
```

### 3. Use JWT Token

Copy the token from the login response and use it in subsequent requests:

```bash
curl -X GET https://localhost:7000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Development Workflow

### Running in Development Mode

```bash
dotnet run --environment Development
```

This will:
- Use SQLite database
- Enable detailed error messages
- Show Swagger UI
- Use console logging

### Running in Production Mode

```bash
dotnet run --environment Production
```

This will:
- Use SQL Server database
- Hide detailed error messages
- Disable Swagger UI
- Use file logging

### Building for Production

```bash
dotnet build --configuration Release
dotnet publish --configuration Release --output ./publish
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process using port 5000
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

2. **Database Connection Issues**
   - Check connection string format
   - Ensure SQL Server is running
   - Verify database exists

3. **JWT Token Issues**
   - Ensure secret key is at least 32 characters
   - Check token expiration time
   - Verify token format in Authorization header

### Logs

Logs are written to:
- **Console**: During development
- **Files**: `logs/taskman-YYYY-MM-DD.txt` in production

### Health Check

Check if the API is running:
```bash
curl https://localhost:7000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00Z",
  "database": "SQLite",
  "message": "TaskMan API is running!"
}
```

## Environment Variables

You can override configuration using environment variables:

```bash
# Set JWT secret
export JwtSettings__SecretKey="YourSecretKey"

# Set database connection
export ConnectionStrings__DefaultConnection="Data Source=production.db"

# Set environment
export ASPNETCORE_ENVIRONMENT="Production"
```

## Docker Support (Optional)

Create a `Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["TaskMan.Api.csproj", "."]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TaskMan.Api.dll"]
```

Build and run:
```bash
docker build -t taskman-api .
docker run -p 5000:80 taskman-api
```

## Next Steps

1. **Frontend Integration**: Update your Angular frontend to use the new .NET API
2. **Database Migration**: If migrating from Node.js, export data and import to new database
3. **Production Deployment**: Deploy to your preferred hosting platform
4. **Monitoring**: Set up application monitoring and logging
5. **Testing**: Add unit and integration tests

## Support

For issues and questions:
1. Check the logs for error details
2. Verify configuration settings
3. Test API endpoints using Swagger UI
4. Check database connectivity
5. Review JWT token configuration

The API maintains compatibility with the original Node.js implementation, so your frontend should work without changes.

