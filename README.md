# LeadFlow CRM 🚀

A modern, enterprise-grade Customer Relationship Management (CRM) platform designed to streamline sales pipelines, visualize data, and manage leads in real-time. Built with a focus on performance, security, and a premium User Experience.

---

## ✨ Key Features

### 📊 Executive Analytics & Reporting
- **Interactive Dashboards:** Real-time data visualization using **Recharts** to track pipeline health, win rates, and lead acquisition sources.
- **Instant Exporting:** One-click PDF report generation designed specifically for stakeholder and BA reporting.

### 🔄 Real-Time Collaboration
- **WebSocket Integration:** Powered by `Socket.io`, any updates made to a lead's status are instantly broadcasted to all connected clients without needing a page refresh.

### 📋 Kanban Pipeline Management
- **Drag-and-Drop Interface:** Easily transition leads through the sales funnel (New → Contacted → Qualified → Won/Lost) using an intuitive drag-and-drop Kanban board.
- **Optimistic UI Updates:** Powered by **TanStack React Query**, the interface responds instantly to user actions while syncing with the database in the background.

### 🎨 Premium UI/UX (Glassmorphism)
- Built with **Tailwind CSS** and **Framer Motion**, the application features a modern "Glassmorphic" aesthetic with smooth stagger animations, backdrop blurs, and highly responsive micro-interactions.

### 🛡️ Enterprise Security & Backend
- **MySQL Database:** Fully relational database structure ensuring data integrity across Leads, Companies, and Users.
- **Security Headers & Rate Limiting:** The Express backend is fortified with `Helmet.js` and `express-rate-limit` to prevent brute-force attacks and XSS vulnerabilities.
- **JWT Authentication:** Secure stateless authentication for user sessions.

---

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- Framer Motion (Animations)
- TanStack React Query (State Management & Caching)
- Recharts (Data Visualization)
- Lucide React (Icons)

**Backend:**
- Node.js & Express
- MySQL (via `mysql2` connection pooling)
- Socket.io (Real-time events)
- JSON Web Tokens (Auth)
- Helmet & Express Rate Limit (Security)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MySQL Server running locally.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Bulee048/LeadFlow-CRM.git
   cd LeadFlow-CRM
   ```

2. **Setup the Database:**
   - Create a MySQL database named `leadflow_crm`.
   - Configure the `server/.env` file:
     ```env
     PORT=5050
     JWT_SECRET=your_super_secret_jwt_key
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=root
     DB_NAME=leadflow_crm
     DB_PORT=3306
     ```

3. **Install Dependencies:**
   ```bash
   # Install Server dependencies
   cd server
   npm install

   # Install Client dependencies
   cd ../client
   npm install
   ```

4. **Seed the Database:**
   ```bash
   # From the server directory, populate the DB with mock data
   node seed.js
   ```

5. **Run the Application:**
   Open two terminals:
   
   **Terminal 1 (Backend):**
   ```bash
   cd server
   npm run dev
   ```
   **Terminal 2 (Frontend):**
   ```bash
   cd client
   npm run dev
   ```

6. **Login to the Application:**
   Once the application is running, you can log in using the default seeded admin credentials:
   - **Email:** `admin@gmail.com`
   - **Password:** `password`

---

## 💡 Business Value (For Business Analysts)
LeadFlow CRM was engineered not just as a technical showcase, but as a robust business tool. 
- The **React Query** caching strategy severely reduces database load, cutting infrastructure costs.
- **WebSockets** eliminate "stale data" errors during multi-user collaboration.
- The **Kanban methodology** implemented reduces sales-cycle friction and improves rep efficiency.
- **Automated Seeding Scripts** allow for instant deployment to QA environments for rapid testing.
