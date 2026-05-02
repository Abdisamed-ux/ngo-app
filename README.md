# NGO Donation & Aid Tracking System

Welcome to your TrustVerify NGO application! This is a complete full-stack web application with a React front-end and a Node/Express back-end supported by PostgreSQL and Redis.

## Prerequisites
Before you start, make sure you have the following installed on your machine:
- **Node.js** (and npm)
- **Docker** (to run the database and caching layer)

## How to Run the Application

You will need to open **three** separate terminal windows to keep the services running.

### Step 1: Start the Databases (Terminal 1)
First, you need to spin up your PostgreSQL and Redis databases using Docker.
1. Open your terminal and navigate to the project root:
   ```bash
   cd ~/Desktop/ngo-app
   ```
2. Start the Docker containers in the background:
   ```bash
   docker-compose up -d
   ```

*(Note: The first time you run this, it might take a moment to download the database images.)*

### Step 2: Start the Backend API (Terminal 2)
Next, you need to start the Node.js backend server.
1. Open a **new terminal tab/window**.
2. Navigate to the backend folder:
   ```bash
   cd ~/Desktop/ngo-app/backend
   ```
3. Sync your database schema (important if this is your first time):
   ```bash
   npx prisma db push --schema=src/shared/prisma/schema.prisma
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
*You should see a message saying:* `Server is running on port 3000`

### Step 3: Start the Frontend React App (Terminal 3)
Finally, start your user interface.
1. Open one more **new terminal tab/window**.
2. Navigate to the frontend folder:
   ```bash
   cd ~/Desktop/ngo-app/frontend
   ```
3. Start the Vite React server:
   ```bash
   npm run dev
   ```
*You should see a message saying:* `➜  Local:   http://localhost:5173/`

---

## Deployment (Production)

This application is ready for production deployment using **Docker**.

### Prerequisites
- A cloud provider account (e.g., [Render](https://render.com), [Railway](https://railway.app)).
- A managed PostgreSQL and Redis instance.

### Deployment Steps

#### 1. Backend Service
1. Connect your GitHub repository to your provider.
2. Select the `backend/` directory.
3. The provider will automatically use the `Dockerfile` in that folder.
4. Set the following **Environment Variables**:
   - `DATABASE_URL`: Your production Postgres connection string.
   - `REDIS_URL`: Your production Redis connection string.
   - `JWT_SECRET`: A secure random string for signing tokens.
   - `CLIENT_URL`: The URL of your deployed frontend.

#### 2. Frontend Service
1. Select the `frontend/` directory.
2. The provider will use the `Dockerfile` (which builds the app and serves it via Nginx).
3. Set the following **Environment Variable**:
   - `VITE_API_URL`: Your production backend API URL (e.g., `https://your-api.render.com/api/v1`).

---

## Live Production 🚀

The application is officially live and can be accessed at the following links:

- **Frontend**: [https://ngo-frontend-ftrx.onrender.com](https://ngo-frontend-ftrx.onrender.com)
- **Backend API**: [https://ngo-api-tt12.onrender.com/api/v1](https://ngo-api-tt12.onrender.com/api/v1)

### How to use the Live App
1.  **Register**: Go to the [Register page](https://ngo-frontend-ftrx.onrender.com/register) to create your admin account.
2.  **Dashboard**: Once logged in, you can view real-time statistics of donations and aid requests.
3.  **Donations**: Record new donations directly from the dashboard; they will be securely stored in the production PostgreSQL database.

---

## Viewing the App (Local Development)
Once everything is running locally, open your web browser and go to:
👉 **[http://localhost:5173](http://localhost:5173)**

When you are finished and want to shut everything down, you can press `Ctrl + C` in the backend and frontend terminals to stop them. To turn off your database containers, run:
```bash
docker-compose down
```
