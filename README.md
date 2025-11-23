<div align="center">

# 👟 Sora Sneakers

**A modern, secure e-commerce platform for premium sneakers**

[![MERN Stack](https://img.shields.io/badge/MERN-Stack-00D9FF?style=flat-square)](https://github.com/CodeWithSomesh)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Auth0](https://img.shields.io/badge/Auth0-EB5424?style=flat-square&logo=auth0&logoColor=white)](https://auth0.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
</div>

---

## 📋 Overview

Sora Sneakers is a full-stack e-commerce application built with the MERN stack, featuring enterprise-grade authentication, comprehensive security monitoring, and an intuitive shopping experience. The platform supports multi-role user management, real-time analytics, and automated security measures.

Link: https://sora-senakers-e-commerce-site.vercel.app/
---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS, Material-UI, Bootstrap, Radix UI
- **Auth:** Auth0 React SDK
- **State:** React Query, React Hook Form
- **UI/UX:** Framer Motion, Recharts, Sonner

### Backend
- **Runtime:** Node.js + Express.js + TypeScript
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Authentication:** Auth0 OAuth 2.0, JWT (RS256)
- **Storage:** Cloudinary (images)
- **Validation:** Express Validator, Zod
- **Scheduling:** Node-cron (analytics aggregation)

---

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| **Authentication** | Auth0 OAuth 2.0 with JWT tokens |
| **Multi-Factor Auth** | Optional MFA via Auth0 |
| **Auto-Lock Accounts** | 3 failed login attempts in 24hrs triggers account lock |
| **Session Management** | 15-minute timeout with activity tracking |
| **Bot Protection** | Google reCAPTCHA v3 on signup/password reset |
| **Image Encryption** | AES-256-CBC for profile photos |
| **Audit Logging** | Security events, admin actions, failed logins |
| **Email Verification** | Required with rate limiting (1 resend/hour) |
| **Role-Based Access** | User, Admin, Super Admin roles |
| **Auth0 Sync** | Real-time blocking sync between database & Auth0 |

### Security Monitoring
- **Failed Login Tracking:** TTL-indexed collection with auto-cleanup (30 days)
- **Suspicious Activity Detection:** IP-based flagging, multiple account detection
- **Admin Action Logging:** All privileged operations audited
- **Security Dashboard:** Real-time metrics for failed logins, alerts, and admin actions

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js v16+
MongoDB Atlas account
Auth0 account (with application configured)
```

### Installation

```bash
# Clone repository
git clone https://github.com/CodeWithSomesh/Sora-Sneakers-E-Commerce-Site.git
cd Sora-Sneakers-E-Commerce-Site

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Configuration

**Backend** (`.env`):
```env
MONGODB_CONNECTION_STRING=your_mongodb_uri
AUTH0_AUDIENCE=your_auth0_audience
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com/
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_M2M_CLIENT_ID=your_client_id
AUTH0_M2M_CLIENT_SECRET=your_client_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret
RECAPTCHA_SECRET_KEY=your_recaptcha_secret
IMAGE_ENCRYPTION_KEY=your_32_byte_hex_key
```

**Frontend** (`.env`):
```env
VITE_API_BASE_URL=http://localhost:7000
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH_CLIENT_ID=your_client_id
VITE_AUTH0_CALLBACK_URL=http://localhost:5173/auth-callback
VITE_AUTH0_AUDIENCE=your_auth0_audience
VITE_RECAPTCHA_SITE_KEY=your_site_key
```

### Running the Application

```bash
# Terminal 1 - Backend (http://localhost:7000)
cd backend
npm run dev

# Terminal 2 - Frontend (http://localhost:5173)
cd frontend
npm run dev
```

### Auth0 Action Setup (Required for Auto-Blocking)

1. Go to Auth0 Dashboard → **Actions > Library**
2. Click **Build Custom** → Select **Login / Post Login** trigger
3. Copy code from `backend/AUTH0_ACTION_LOGIN_CHECK.js`
4. Add secret: `API_BASE_URL` = `http://localhost:7000`
5. Deploy and add to **Login Flow**

📖 Detailed instructions: [readmes/SETUP_INSTRUCTIONS.md](readmes/SETUP_INSTRUCTIONS.md)

---

## 📁 Project Structure

```
sora-sneakers/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API endpoints
│   │   ├── middleware/       # Auth, validation, session
│   │   ├── services/         # Auth0 integration
│   │   └── jobs/             # Cron jobs
│   └── AUTH0_ACTION_LOGIN_CHECK.js
├── frontend/
│   ├── src/
│   │   ├── pages/            # Route components
│   │   ├── components/       # Reusable UI
│   │   ├── auth/             # Auth0 wrapper
│   │   └── api/              # API clients
└── readmes/                  # Documentation
```

---

## ✨ Key Features

- **🛍️ Product Catalog:** Browse sneakers by category (Men, Women, Kids)
- **🛒 Shopping Cart:** Add items, manage quantities, checkout
- **👤 User Profiles:** Profile management, order history, MFA setup
- **🔐 Admin Panel:** User management (promote/demote/block/unblock)
- **📊 Analytics Dashboard:** Sales metrics, user behavior tracking
- **🛡️ Security Dashboard:** Monitor failed logins, suspicious IPs, alerts
- **📦 Order Management:** Track orders, update statuses
- **📧 Email Verification:** Secure signup with verification flow

---

## 🔌 API Endpoints

### Authentication & Users
- `GET /api/my/user` - Get current user profile
- `PUT /api/my/user` - Update profile

### Admin Operations
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:userId/promote` - Promote to admin
- `PUT /api/admin/users/:userId/block` - Block user account

### Security Analytics
- `POST /api/security/failed-login` - Track failed login
- `GET /api/security/dashboard` - Security metrics
- `POST /api/security/sync-auth0-logs` - Sync Auth0 logs

### Products & Orders
- `GET /api/shop` - Get all products
- `POST /api/order` - Create order
- `GET /api/order/:orderId` - Get order details

### Analytics
- `POST /api/analytics/track` - Track user event
- `GET /api/analytics/dashboard` - Dashboard data

---

## 🗄️ Database Schema

| Collection | Purpose |
|------------|---------|
| `users` | User profiles with roles and security flags |
| `sessions` | Active sessions with TTL expiration |
| `failedlogins` | Failed login attempts (auto-expires 30 days) |
| `securitylogs` | Audit trail of security events |
| `adminactions` | Admin operation tracking |
| `products` | Product catalog |
| `orders` | Purchase records |
| `analyticsevents` | User behavior events |
| `analyticsdaily` | Aggregated daily statistics |

---

## 📚 Documentation

Detailed guides available in `/readmes`:
- [Setup Instructions](readmes/SETUP_INSTRUCTIONS.md)
- [Security Analytics Features](readmes/SECURITY_ANALYTICS_FEATURES.md)
- [Test Cases](readmes/SECURITY_ANALYTICS_TEST_CASES.md)
- [Auto-Blocking Mechanism](readmes/SOLUTION_AUTO_BLOCK_FROM_AUTH0.md)

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend linting
cd frontend
npm run lint
```

Security testing endpoints available in `security-tests.http`

---

## 📝 License

This project is for educational purposes.

---

<div align="center">

**Built with ❤️ by the Sora Sneakers Team**
</div>
