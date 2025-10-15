# SmartWaste Deployment Configuration

This guide shows how to deploy the 3 role-based dashboards separately.

## Architecture

The SmartWaste system is designed to support 3 separate deployments:

1. **User Dashboard** - For citizens to report waste issues
2. **Cleaner Dashboard** - For waste management workers to view and complete assigned tasks
3. **Admin Dashboard** - For administrators to manage the entire system

## Deployment Options

### Option 1: Single Application with Role-Based Routing (Current)

The current setup uses a single React application with role-based routing. Users are redirected to appropriate dashboards based on their roles.

**Pros:**
- Single codebase to maintain
- Shared components and logic
- Easier authentication management

**Cons:**
- All users download the entire application
- All roles share the same domain

### Option 2: Separate Applications (Recommended for Production)

Create 3 separate React applications, each optimized for its specific role.

## Setting Up Separate Applications

### 1. Create Environment-Specific Builds

Create different environment files for each role:

#### `.env.user`
```
REACT_APP_ROLE=user
REACT_APP_APP_NAME=SmartWaste - Report Waste
REACT_APP_PRIMARY_COLOR=#3498db
REACT_APP_FEATURES=report,track
```

#### `.env.cleaner`
```
REACT_APP_ROLE=cleaner
REACT_APP_APP_NAME=SmartWaste - Cleaner Portal
REACT_APP_PRIMARY_COLOR=#27ae60
REACT_APP_FEATURES=assignments,update,navigate
```

#### `.env.admin`
```
REACT_APP_ROLE=admin
REACT_APP_APP_NAME=SmartWaste - Admin Panel
REACT_APP_PRIMARY_COLOR=#e74c3c
REACT_APP_FEATURES=manage,assign,analytics,users
```

### 2. Update package.json Scripts

Add role-specific build scripts:

```json
{
  "scripts": {
    "build:user": "env-cmd -f .env.user npm run build",
    "build:cleaner": "env-cmd -f .env.cleaner npm run build",
    "build:admin": "env-cmd -f .env.admin npm run build",
    "build:all": "npm run build:user && npm run build:cleaner && npm run build:admin"
  }
}
```

### 3. Role-Specific App Components

Create conditional rendering based on environment:

```typescript
// App.tsx
const App = () => {
  const role = process.env.REACT_APP_ROLE;
  
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            {role === 'user' && <UserRoutes />}
            {role === 'cleaner' && <CleanerRoutes />}
            {role === 'admin' && <AdminRoutes />}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};
```

## Deployment Platforms

### Vercel Deployment

#### 1. User Dashboard
```bash
# Deploy user dashboard
vercel --prod --env REACT_APP_ROLE=user
```

#### 2. Cleaner Dashboard  
```bash
# Deploy cleaner dashboard
vercel --prod --env REACT_APP_ROLE=cleaner
```

#### 3. Admin Dashboard
```bash
# Deploy admin dashboard
vercel --prod --env REACT_APP_ROLE=admin
```

### Netlify Deployment

Create `netlify.toml` for each deployment:

#### User Dashboard - `netlify-user.toml`
```toml
[build]
  command = "npm run build:user"
  publish = "build"

[build.environment]
  REACT_APP_ROLE = "user"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Cleaner Dashboard - `netlify-cleaner.toml`
```toml
[build]
  command = "npm run build:cleaner"
  publish = "build"

[build.environment]
  REACT_APP_ROLE = "cleaner"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Admin Dashboard - `netlify-admin.toml`
```toml
[build]
  command = "npm run build:admin"
  publish = "build"

[build.environment]
  REACT_APP_ROLE = "admin"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Firebase Hosting

Create separate Firebase projects or use different sites:

#### firebase-user.json
```json
{
  "hosting": {
    "site": "smartwaste-users",
    "public": "build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

Deploy commands:
```bash
# User dashboard
npm run build:user
firebase deploy --only hosting -P user-project

# Cleaner dashboard  
npm run build:cleaner
firebase deploy --only hosting -P cleaner-project

# Admin dashboard
npm run build:admin
firebase deploy --only hosting -P admin-project
```

### Docker Deployment

Create role-specific Dockerfiles:

#### Dockerfile.user
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV REACT_APP_ROLE=user
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  smartwaste-user:
    build:
      context: .
      dockerfile: Dockerfile.user
    ports:
      - "3001:80"
    environment:
      - REACT_APP_ROLE=user
      
  smartwaste-cleaner:
    build:
      context: .
      dockerfile: Dockerfile.cleaner
    ports:
      - "3002:80"
    environment:
      - REACT_APP_ROLE=cleaner
      
  smartwaste-admin:
    build:
      context: .
      dockerfile: Dockerfile.admin
    ports:
      - "3003:80"
    environment:
      - REACT_APP_ROLE=admin

  smartwaste-backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
```

## Backend Deployment

### Flask (Heroku)
```bash
# Install Heroku CLI and deploy
heroku create smartwaste-api
heroku config:set FLASK_ENV=production
git subtree push --prefix backend heroku main
```

### Flask (Google Cloud Run)
```dockerfile
# backend/Dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8080

CMD exec gunicorn --bind :8080 --workers 1 --threads 8 app:app
```

## Domain Configuration

### Suggested Domain Structure
- `smartwaste.com` - Main landing page
- `report.smartwaste.com` - User dashboard
- `clean.smartwaste.com` - Cleaner dashboard  
- `admin.smartwaste.com` - Admin dashboard
- `api.smartwaste.com` - Backend API

### DNS Configuration
```
Type    Name    Value
CNAME   report  vercel-deployment-url
CNAME   clean   netlify-deployment-url
CNAME   admin   firebase-hosting-url
CNAME   api     heroku-app-url
```

## Security Considerations

1. **CORS Configuration**: Update backend CORS to allow specific domains
2. **Firebase Rules**: Restrict access based on user roles
3. **Environment Variables**: Never expose sensitive keys in frontend
4. **SSL/HTTPS**: Ensure all deployments use HTTPS
5. **Rate Limiting**: Implement API rate limiting for production

## Monitoring & Analytics

- **User Dashboard**: Focus on report submission metrics
- **Cleaner Dashboard**: Track task completion rates
- **Admin Dashboard**: Monitor system-wide performance
- **Backend**: Track API usage and performance

This multi-deployment approach allows for:
- Role-specific optimizations
- Independent scaling
- Better security isolation  
- Customized user experiences
- Easier maintenance and updates