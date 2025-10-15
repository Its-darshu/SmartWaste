# SmartWaste Quick Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Firebase CLI (for Firebase hosting)
- Docker (for containerized deployment)
- Git (for version control)

### 1. Environment Setup

The system is configured for 3 separate deployments:

| Role | Environment | Primary Color | Features |
|------|-------------|---------------|----------|
| User | `.env.user` | Blue (#3498db) | Report, Track |
| Cleaner | `.env.cleaner` | Green (#27ae60) | Assignments, Update, Navigate |
| Admin | `.env.admin` | Red (#e74c3c) | Manage, Assign, Analytics, Users |

### 2. Build Commands

```bash
# Install dependencies
cd frontend && npm install

# Build specific role dashboards
npm run build:user      # Citizens dashboard
npm run build:cleaner   # Workers dashboard  
npm run build:admin     # Admin dashboard

# Build all at once
npm run build:all
```

### 3. Development Testing

```bash
# Test each role locally
npm run start:user      # http://localhost:3000 (User view)
npm run start:cleaner   # http://localhost:3000 (Cleaner view)
npm run start:admin     # http://localhost:3000 (Admin view)
```

## 🌐 Deployment Options

### Option A: Firebase Hosting (Recommended)

```bash
# Deploy User Dashboard
npm run build:user
firebase deploy --only hosting --config firebase-user.json

# Deploy Cleaner Dashboard
npm run build:cleaner
firebase deploy --only hosting --config firebase-cleaner.json

# Deploy Admin Dashboard
npm run build:admin
firebase deploy --only hosting --config firebase-admin.json
```

**Result:**
- User: `https://smartwaste-users.web.app`
- Cleaner: `https://smartwaste-cleaners.web.app`
- Admin: `https://smartwaste-admin.web.app`

### Option B: Netlify

1. Connect three separate Netlify sites to your repo
2. Set build commands in Netlify dashboard:
   - User site: `npm run build:user`
   - Cleaner site: `npm run build:cleaner`
   - Admin site: `npm run build:admin`
3. Or use Netlify TOML configs provided

### Option C: Docker Compose

```bash
# Build and run all services
docker-compose up --build

# Access services
# User Dashboard: http://localhost:3001
# Cleaner Dashboard: http://localhost:3002
# Admin Dashboard: http://localhost:3003
# Backend API: http://localhost:5000
```

### Option D: Vercel

Deploy three separate projects with environment variables:

```bash
# User Dashboard
vercel --prod --env REACT_APP_ROLE=user

# Cleaner Dashboard
vercel --prod --env REACT_APP_ROLE=cleaner

# Admin Dashboard
vercel --prod --env REACT_APP_ROLE=admin
```

## 🔧 Backend Deployment

### Heroku
```bash
cd backend
heroku create smartwaste-api
git subtree push --prefix backend heroku main
```

### Google Cloud Run
```bash
cd backend
gcloud run deploy smartwaste-api --source . --platform managed
```

### Railway
```bash
cd backend
railway login
railway deploy
```

## 🌍 Domain Configuration

### Recommended Structure
- `smartwaste.com` - Landing page
- `report.smartwaste.com` - User dashboard
- `clean.smartwaste.com` - Cleaner dashboard
- `admin.smartwaste.com` - Admin dashboard
- `api.smartwaste.com` - Backend API

### DNS Setup
```
Type    Name    Value
CNAME   report  your-user-deployment-url
CNAME   clean   your-cleaner-deployment-url
CNAME   admin   your-admin-deployment-url
CNAME   api     your-backend-deployment-url
```

## 🔒 Security Checklist

- [ ] Environment variables secured
- [ ] Firebase rules configured for role-based access
- [ ] CORS properly configured for your domains
- [ ] HTTPS enabled on all deployments
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] API rate limiting implemented

## 🎯 Post-Deployment

1. **Test each dashboard individually**
2. **Verify role-based access control**
3. **Test Google authentication flow**
4. **Verify API connectivity**
5. **Check responsive design on mobile**
6. **Monitor error logs**

## 📊 Monitoring

Set up monitoring for each deployment:
- **Error tracking**: Sentry, LogRocket
- **Performance**: Google Analytics, Vercel Analytics
- **Uptime**: Pingdom, UptimeRobot
- **API monitoring**: New Relic, DataDog

## 🔄 CI/CD Pipeline

Example GitHub Actions workflow:

```yaml
name: Deploy SmartWaste
on:
  push:
    branches: [main]

jobs:
  deploy-user:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy User Dashboard
        run: |
          cd frontend
          npm install
          npm run build:user
          # Deploy to your platform
```

## 📞 Support

- **Documentation**: See DEPLOYMENT.md for detailed configuration
- **Issues**: Report bugs via GitHub issues
- **Features**: Submit feature requests with user role context

---

**Ready to deploy?** Run `./deploy.sh` (Linux/Mac) or `deploy.bat` (Windows) to build all dashboards!