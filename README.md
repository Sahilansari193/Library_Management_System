# 📚 Library Membership & Fine Payment Management System

> A comprehensive, modern full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** web application built for college and university libraries to manage book catalogs, student memberships, circulation desks, automated due-date reminders, overdue penalty calculations, and simulated fine payments.

---

## 🌟 Key Features

### 1. 🔐 Role-Based Authentication & Authorization
- **JWT-Based Authentication** with bcrypt password hashing.
- Role-based route guards separating **Admin** and **Student** portals.
- Auto-generation of unique **Member ID** upon student registration (e.g. `LIB-2026-0001`).
- Quick demo login buttons for one-click access during evaluations and demonstrations.

### 2. 📊 Interactive Admin Dashboard
- **8 Dynamic MongoDB Statistical Metrics**:
  - Total Books in Catalog
  - Total Registered Members
  - Active Memberships
  - Expired Memberships (with automated expiry verification)
  - Currently Borrowed Books in Circulation
  - Overdue Books
  - Total Pending Fines (₹)
  - Total Fine Collections (₹)
- Recent Membership Registrations table.
- Recently Borrowed Books & Recently Returned Books logs.
- Overdue Book Alerts section.
- Monthly Fine Collection trend widgets.

### 3. 📖 Book Catalog Management
- **Full CRUD Support**: Add new books, update metadata/stock, delete titles.
- Safety check: Books cannot be deleted if copies are currently borrowed out.
- Real-time search by Title, Author, or ISBN.
- Filter by Subject Category (Computer Science, Mathematics, AI, Physics, Literature, etc.).
- Filter by stock availability (In Stock vs Borrowed Out).
- Custom cover image preview with fallback placeholder artwork.

### 4. 🪪 Library Membership Management
- Manage student membership subscriptions across three plans:
  - **Monthly Plan** (30 Days)
  - **Quarterly Plan** (90 Days)
  - **Annual Plan** (365 Days)
- Automatic status transitions: `Active`, `Expired`, `Suspended`.
- One-click **Membership Renewal** dialog.
- Prevention check: Members with unreturned books or unpaid fines cannot be deleted.

### 5. 🔄 Book Issue & Return Circulation Desk
- Issue books to registered active members.
- Validation: Prevents issuing if zero copies available or if membership is expired/suspended.
- Configurable borrowing duration (default 14 days) with automatic due date computation.
- Return processing: Instantly replenishes inventory quantity and automatically calculates late fees if returned past the due date.

### 6. ⏰ Automated Due Date Reminders
- Intelligent categorization of circulation records:
  - **Overdue**: Past due date; accumulating daily fine.
  - **Due Today**: Due before circulation counter closes.
  - **Due Soon**: Approaching within 3 days.
- **"Send Reminder"** admin action: Dispatches in-app notifications directly to the student's dashboard and records the timestamp.

### 7. 💳 Overdue Fine Management & Simulated Payment Gateway
- Automatic fine calculation formula:
  $$\text{Fine} = \text{Overdue Days} \times \text{Fine Per Day (Default ₹5)}$$
- No fine charged if returned on or before the due date.
- Admin fine rate configuration setting (stored in database).
- **Fine Waiving**: Administrators can waive fines with required official justification text (e.g., medical leave).
- **Simulated Payment Gateway (Demo)**:
  - Clearly labeled demonstration mode (no real money transferred).
  - Multi-method support: **UPI / QR Code**, **Debit / Credit Card**, and **Counter Cash**.
  - Generates official, computer-verified **Payment Receipts** with receipt numbers (e.g., `RCP-2026-8001`).
  - Printable / Downloadable receipt view.

### 8. 🎓 Dedicated Student Portal
- **Digital Library Membership Card** pass with validity dates and chip design.
- View currently borrowed books with countdown of remaining days.
- Pending dues banner with direct **"Pay Fine"** button.
- Notification center for return reminders, payment receipts, and issue confirmations.
- Profile management (update hostel room, contact phone).

### 9. 📈 Reports & Analytics (with CSV Exports)
- Subject category inventory distributions.
- Membership breakdown by plan and validity status.
- Top 10 most borrowed curriculum textbooks.
- **One-Click CSV Data Export** for:
  - Books Catalog (`.csv`)
  - Members Roster (`.csv`)
  - Borrowing Ledger (`.csv`)
  - Fine Records (`.csv`)
  - Payment Receipts (`.csv`)

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js (v18), React Router DOM (v6), Axios, Lucide Icons, Modern CSS3 |
| **Backend** | Node.js, Express.js, RESTful APIs, Morgan logger, CORS, Dotenv |
| **Database** | MongoDB, Mongoose ODM |
| **Security** | JWT (JSON Web Tokens), bcryptjs password hashing |
| **Architecture**| Decoupled Client-Server Architecture |

---

## 📂 Project Directory Structure

```text
library-management-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile
│   │   ├── bookController.js     # Book catalog CRUD & search
│   │   ├── memberController.js   # Membership lifecycle & renewals
│   │   ├── borrowController.js   # Issue & Return desk logic
│   │   ├── fineController.js     # Fine calculation, rate & waive
│   │   ├── paymentController.js  # Simulated payments & receipts
│   │   ├── reminderController.js # Due date reminder categories
│   │   ├── notificationController.js # In-app notifications
│   │   ├── dashboardController.js# Dynamic metrics for Admin & Student
│   │   └── reportController.js   # Analytics aggregations & CSV export
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role authorization
│   │   └── errorHandler.js       # Centralized error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── Book.js
│   │   ├── Membership.js
│   │   ├── BorrowRecord.js
│   │   ├── Fine.js
│   │   ├── Payment.js
│   │   ├── Notification.js
│   │   └── Setting.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookRoutes.js
│   │   ├── memberRoutes.js
│   │   ├── borrowRoutes.js
│   │   ├── fineRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── reminderRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── reportRoutes.js
│   ├── services/
│   │   └── fineCalculator.js     # Reusable fine logic service
│   ├── .env.example
│   ├── package.json
│   ├── seed.js                   # Comprehensive database seed script
│   └── server.js                 # Express application entry point
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/           # Reusable UI (Modals, StatCards, Toast, Receipt, Payment)
│   │   ├── context/              # AuthContext & ToastContext
│   │   ├── hooks/                # useToast hook
│   │   ├── layouts/              # DashboardLayout & Sidebar
│   │   ├── pages/
│   │   │   ├── admin/            # Admin Dashboard, Books, Members, Borrows, Reminders, Fines, Reports
│   │   │   ├── student/          # Student Dashboard, Catalog, My Books, Fines, Notifications, Profile
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── routes/               # AppRoutes with role protection
│   │   ├── services/             # Axios API client with token interceptor
│   │   ├── styles/               # Clean, custom SaaS CSS stylesheets
│   │   ├── App.jsx
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── package.json                  # Root runner scripts
└── README.md
```

---

## 🚀 Installation & Setup Guide

### Prerequisites
- **Node.js** (v16+ or v18+ recommended)
- **npm** (v8+)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) OR a free [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI.

---

### Step 1: Install Dependencies

#### Install Backend Packages:
```bash
cd backend
npm install
```

#### Install Frontend Packages:
```bash
cd ../frontend
npm install
```

---

### Step 2: Configure Environment Variables

#### Backend `.env`:
In the `backend/` directory, verify or create the `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/library_management_db
JWT_SECRET=supersecretjwtkey_library_system_2026
JWT_EXPIRE=30d
DEFAULT_BORROW_DAYS=14
DEFAULT_FINE_PER_DAY=5
```
*(If using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string).*

#### Frontend `.env`:
In the `frontend/` directory, verify `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

### Step 3: Seed Sample Database Data

Run the database seed script to automatically populate:
- 1 Central Library Admin account
- 10 Student accounts & Library Memberships
- 20 Sample books across Computer Science, AI, Math, Physics, Literature, and Economics
- Sample active borrowing records, overdue loans, and completed returns
- Sample library fine records (pending, waived, and paid)
- Sample payment receipts and student notifications

```bash
cd backend
npm run seed
```

---

### Step 4: Run the Application

You can run the backend and frontend in separate terminals:

#### Terminal 1: Start Backend API Server
```bash
cd backend
npm start
```
*API will run at `http://localhost:5000`.*

#### Terminal 2: Start React Frontend
```bash
cd frontend
npm start
```
*Frontend will open at `http://localhost:3000` in your web browser.*

Alternatively, from the project root:
```bash
# Start backend with automatic restart on changes
npm run dev

# Start frontend (in a second terminal)
npm run client
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@college.edu` | `Admin@123` | Full access to manage books, members, issues, reminders, fines & analytics |
| **Student** | `rahul.sharma@college.edu` | `Student@123` | Active borrower with issued books and payment history |
| **Student** | `priya.patel@college.edu` | `Student@123` | Book approaching due date (Due Soon) |
| **Student** | `amit.kumar@college.edu` | `Student@123` | Book Due Today |
| **Student** | `sneha.reddy@college.edu` | `Student@123` | Overdue book with pending fine (₹30) ready for demo payment |
| **Student** | `arjun.verma@college.edu` | `Student@123` | Paid fine with digital receipt |

*(You can also use the **"Fill Admin"** and **"Fill Student"** quick-fill buttons on the Login page).*

---

## 📡 API Reference Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Student self-registration and membership issuance
- `POST /api/auth/login` - Authenticate user & return JWT
- `GET /api/auth/me` - Retrieve current logged-in user details
- `PUT /api/auth/profile` - Update student profile (phone, address)

### Books (`/api/books`)
- `GET /api/books` - Search, filter, and paginate books
- `GET /api/books/categories` - Distinct categories list
- `GET /api/books/:id` - Single book metadata
- `POST /api/books` - Add new book (Admin only)
- `PUT /api/books/:id` - Update book details & copies (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)

### Members (`/api/members`)
- `GET /api/members` - Retrieve all members with filters (Admin only)
- `POST /api/members` - Register new member (Admin only)
- `GET /api/members/:id` - Member profile, loan history & fines
- `PUT /api/members/:id` - Update member information (Admin only)
- `POST /api/members/:id/renew` - Renew membership plan (Admin only)
- `DELETE /api/members/:id` - Remove member (Admin only)

### Borrow & Circulation (`/api/borrow`)
- `GET /api/borrow` - All circulation records (Admin only)
- `GET /api/borrow/my-books` - Logged-in student's books
- `POST /api/borrow/issue` - Issue book with due date calculation (Admin only)
- `PUT /api/borrow/return/:id` - Return book & auto-assess overdue fines (Admin only)

### Fines & Payments (`/api/fines`, `/api/payments`)
- `GET /api/fines` - All fine records (Admin only)
- `GET /api/fines/my-fines` - Student's fine balances
- `POST /api/fines/calculate` - Preview fine calculation
- `PUT /api/fines/:id/waive` - Waive fine with justification (Admin only)
- `GET /api/fines/rate` - Get current fine rate setting
- `PUT /api/fines/rate` - Update system fine rate (Admin only)
- `GET /api/payments` - All transactions log (Admin only)
- `GET /api/payments/my-payments` - Student's receipts
- `POST /api/payments/pay` - Process simulated payment (UPI, Card, Cash)
- `GET /api/payments/receipt/:id` - Single receipt details for printing

### Dashboard & Analytics (`/api/dashboard`, `/api/reports`)
- `GET /api/dashboard/stats` - Admin metrics & circulation logs
- `GET /api/dashboard/student-stats` - Student dashboard metrics
- `GET /api/reminders` - Categorized due reminders (Admin only)
- `POST /api/reminders/:id/send` - Dispatch reminder notification (Admin only)
- `GET /api/notifications` - Student in-app notifications
- `PUT /api/notifications/:id/read` - Mark single notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `GET /api/reports/analytics` - Aggregated charts data
- `GET /api/reports/export/:type` - Download CSV export (`books`, `members`, `borrows`, `fines`, `payments`)

---

## 🎓 University Project Demonstration Notes

- **Realistic Data**: The seed script populates 20 real academic books and 10 students across various loan and fine stages (Active, Overdue, Returned, Paid, Waived).
- **Simulated Payment Gateway**: Designed specifically for university project evaluations to showcase end-to-end UPI / Card / Cash workflows without requiring real banking credentials.
- **Defensive Business Validations**:
  - Available book stock cannot drop below zero.
  - Expired or suspended members cannot borrow books.
  - Active books cannot be deleted from catalog.
  - Members with unreturned books cannot be deleted.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
