# Trackwise: Personal Focus & Finance Super-App

Trackwise is a unified, full-stack personal assistant platform designed to manage every aspect of a user's productivity and financial health. Built using a modern JavaScript stack (**Node.js/Express** and **React**), it leverages an **SQL database** (SQLite via Prisma) and a sleek **Glassomorphism UI**.

## Core Modules
1. **Focus Audio Hub**: A dark-themed music player integrated with Cloudinary URLs.
2. **Wealth Tracker**: Income/expense management with analytical Bar/Pie charts and PDF reporting.
3. **Learning Dashboard (Steady Flow)**: Study hours tracker with real-time visual progress meters.
4. **Routine Log**: Habit tracker analyzing daily success rates over time with glass-styled visual analytics.

## Prerequisites
- **Node.js** (v18+)
- **npm** or **yarn**

## Installation & Setup

We have set up this repository as a monorepo. You can install all dependencies and start everything from the main project folder!

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd trackwise-super-app
```

### 2. Environment Variables (.env)
The project requires a `.env` file in the **main folder** (root directory) for the database and backend server.
We have provided a template for you:
```bash
cp .env.example .env
```
*(On Windows, just create a new file named `.env` in the main folder and copy the text from `.env.example` into it).*

### 3. Install All Dependencies
We have a unified script that will install the root dependencies, backend dependencies, and frontend dependencies all at once:
```bash
npm run setup
```
*(Note: If `npm audit` shows moderate vulnerabilities for development dependencies like `vite` or `jspdf`, you can safely ignore them for this local project. Do **not** run `npm audit fix --force` as it may install breaking major versions).*

### 4. Setup the Database & Add Generic Data
Use the following root-level commands to generate the local SQLite database and populate it with generic data for demonstration:
```bash
npm run db:push
npm run db:seed
```
*(The seed script will create a demo user with pre-filled habits, expenses, and study sessions).*

## How to Run the Project

You do NOT need multiple terminals. From the main folder, simply run:
```bash
npm run dev
```
This single command uses `concurrently` to start both the Backend API server (on `http://localhost:4000`) and the Frontend Vite server (e.g., `http://localhost:5173`) at the exact same time! Click the frontend link in your terminal to open the app.

## Demo Account
Since you ran the seed script, you can log in immediately using the pre-populated generic data.
- **Email**: `demo@trackwise.com`
- **Password**: `password123`

*(Alternatively, you can register a new account from the Login page.)*
