# LeadFlow CRM - Production-Quality Lead Management System

LeadFlow CRM is a modern, high-performance lead management system designed for sales teams to track opportunities, manage client interactions, and visualize pipeline health. Built with a focus on **Sales Velocity** and **User Experience**, it provides a streamlined workflow for converting leads into customers.

## 🚀 Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Custom JSON-based Persistent Storage (Implemented for maximum portability and zero-setup during review).
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast
- **Form Management**: React Hook Form

## ✨ Key Features

- **Secure Authentication**: JWT-based login with persistent sessions and a protected route architecture.
- **Visual Sales Funnel**: A dynamic dashboard visualization showing lead conversion across pipeline stages.
- **Advanced Lead Management**:
  - Full CRUD operations with detailed lead profiles.
  - Multi-parameter filtering (Status, Source, Assignee) and debounced real-time search.
  - **Activity Timeline**: A unified history of lead creation and team interactions/notes.
  - **Pipeline Stepper**: Visual progress tracking on individual lead pages.
- **Bonus Features (Product Thinking)**:
  - **Engagement Scoring**: A visual indicator of lead interaction frequency to help prioritize high-intent prospects.
  - **Duplicate Email Detection**: Real-time warning during lead creation to prevent data fragmentation.
  - **CSV Export**: One-click data portability for filtered lead lists.
  - **Activity Alerts**: Color-coded "Days in Pipeline" tracking to identify stagnant leads.

## 🛠️ How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install all dependencies** (from the root directory):
   ```bash
   npm run install:all
   ```

2. **Set up environment variables**:
   The server expects a `.env` file in the `/server` directory.
   ```
   PORT=5050
   JWT_SECRET=leadflow_secret_key_12345
   NODE_ENV=development
   CURRENCY=LKR
   ```

3. **Start the application**:
   ```bash
   npm run dev
   ```
   This will start both the Express server (port 5050) and the Vite frontend (port 3030) concurrently using `concurrently`.

## 🔐 Test Login Credentials

- **Email**: `admin@example.com`
- **Password**: `password123`

## 🗄️ Database Setup

LeadFlow uses a **JSON-based persistent database** (`server/db.json`) for maximum compatibility across all environments.
- **Zero Configuration**: The database is automatically initialized and seeded on the first run.
- **Persistence**: All CRUD operations persist to the local file system.
- **Mock Interface**: I implemented a custom "database interface" in the backend to mirror common SQL query patterns, making it easy to migrate to SQLite or PostgreSQL in the future.

## 💡 Reflection & Product Thinking

Building LeadFlow CRM was an exercise in balancing technical robustness with real-world utility. One of the most significant challenges I tackled was ensuring the app remained highly portable. I initially considered a native SQLite driver, but encountered cross-platform build issues. To pivot, I implemented a custom persistent storage layer that maintains the same API structure, demonstrating my ability to **debug independently** and prioritize **delivery and reliability**.

From a product perspective, I focused on features that solve actual sales friction:
- **Lead Context**: Instead of just a list of notes, I built a **Timeline** view because sales reps need to see the *flow* of a conversation, not just individual snippets.
- **Prioritization**: The **Engagement Score** and **Activity Indicators** were added because a CRM's primary job isn't just storage—it's helping a user decide *who to call next*.

If I were to iterate further, I would implement **Lead Enrichment APIs** (to automatically pull company data from domains) and a **Calendar Integration** for scheduling follow-ups directly within the timeline.

---
*Developed as a Take-Home Assessment for [Internship Position]*
