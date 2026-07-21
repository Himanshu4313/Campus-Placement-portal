# Campus Placement & Career Platform

An enterprise-ready, premium SaaS platform for managing university campus placements. Built with React 19 + Vite + Tailwind CSS frontend and Node.js + Express + MongoDB backend.

## 🚀 Deployed Links
- **Frontend App (Vercel):** [https://campus-placement-portal-sand.vercel.app/](https://campus-placement-portal-sand.vercel.app/)
- **Backend API (Render):** [https://campus-placement-portal-v079.onrender.com/api](https://campus-placement-portal-v079.onrender.com/api)


## System Features
- **Role-Based Access Control (RBAC)**: Distinct dashboards and permissions for Students, Recruiters, Placement Officers, and Admins.
- **Enterprise UI/UX**: Inspired by Vercel, Stripe, and Linear dashboards. Complete with premium Glassmorphic panels, dark mode, responsive grids, and micro-interactions.
- **Verification Gates**: Companies and Students undergo review processes before active drive/job operations.
- **Database Seeding**: Easily generate sample jobs, drives, and mock users to test all portal features instantly.

---

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Redux Toolkit, React Router, React Hook Form, Axios, Recharts, Framer Motion, Lucide icons, React Hot Toast.
- **Backend**: Node.js, Express, TypeScript, MongoDB Atlas, Mongoose, JWT + cookies, Socket.IO, Nodemailer, Cloudinary, Express Validator, Helmet, Express Rate Limiter.

---

## Project Structure
```
├── client/          # Vite + React + TS Frontend
│   ├── src/
│   │   ├── components/  # Buttons, Inputs, Layouts, Cards
│   │   ├── hooks/       # useTheme hook
│   │   ├── pages/       # Landing, Login, Register, Dashboards
│   │   ├── services/    # API and Socket instances
│   │   └── store/       # Redux Auth Slice
├── server/          # Node + Express + MongoDB Backend
│   ├── src/
│   │   ├── config/      # DB, Socket, Email, Cloudinary configs
│   │   ├── controllers/ # Auth, Jobs, Students, Recruiters, Admins controllers
│   │   ├── middleware/  # Auth, Error handlers, Validators
│   │   ├── models/      # Mongoose schemas (User, Jobs, Drives, Applications...)
│   │   └── routes/      # API endpoints mapping
├── docker/          # Docker orchestrations
```

---
## 📌 Recent Improvements

- Improved project documentation
- Added future enhancement section
- Enhanced README readability

## ✨ Key Highlights

- Role-Based Authentication
- Secure JWT Login
- Real-time Notifications
- Resume Management
- Placement Analytics
- Company & Student Dashboard
- Interview Scheduling
- Placement Offer Tracking

## 🤝 Contribution Guidelines

We welcome contributions from the community.

To contribute:

1. Fork the repository
2. Create a new feature branch
3. Commit your changes
4. Push the branch
5. Create a Pull Request

Please follow coding standards and write meaningful commit messages.
## 🔧 Environment Variables

Create a `.env` file in the server directory and configure the following variables:

- PORT
- MONGODB_URI
- JWT_SECRET
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- SMTP_EMAIL
- SMTP_PASSWORD
## 📋 Prerequisites

Before running the project, make sure you have:

- Node.js (v18 or above)
- npm or yarn
- MongoDB
- Git
- Visual Studio Code (Recommended)
## 🔄 Project Workflow

Student Login
↓
Complete Profile
↓
Apply for Jobs
↓
Recruiter Reviews
↓
Interview
↓
Offer Letter
## Getting Started

### 1. Prerequisite Config
Create a `.env` file in the `server` directory using `server/.env.example` as a template. Make sure to specify a valid MongoDB URI.

### 2. Install & Start Server
```bash
cd server
npm install
npm run build
# Start in dev mode:
npm run dev
```

### 3. Seed Mock Data
To populate the database with complete companies, student profiles, drives, and credentials:
```bash
cd server
npm run seed
```

#### Seeded Accounts:
- **Admin**: `admin@placement.com` / `Password123!`
- **Placement Officer**: `po@placement.com` / `Password123!`
- **Student**: `student@placement.com` / `Password123!`
- **Recruiter (Vercel)**: `recruiter@vercel.com` / `Password123!`
- **Recruiter (Stripe)**: `recruiter@stripe.com` / `Password123!`

### 4. Install & Start Client
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Running with Docker
```bash
cd docker
docker-compose up --build
```
