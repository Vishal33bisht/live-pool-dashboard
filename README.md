# Real-Time Online Polling System 📊

A full-stack, real-time online polling application that allows users to create polls, cast their votes, and watch results update instantly. Built with modern web technologies, it features a clean user interface and a robust backend.

## ✨ Features

* **User Authentication:** Secure registration and login (JWT-based).
* **Create Polls:** Easily create custom polls with multiple options.
* **Real-Time Voting:** Watch poll results update in real-time across all connected clients using WebSockets.
* **Analytics Dashboard:** Visual representation of poll metrics and voting results.
* **Responsive Design:** A beautiful, mobile-friendly UI built with React and Tailwind CSS.
* **Database Management:** Strongly typed database interactions using Prisma ORM.

## 🛠️ Tech Stack

**Frontend:**
* React (via Vite)
* Tailwind CSS (assumed based on standard Vite setups)
* Socket.io-client (Real-time events)
* Axios (API requests)

**Backend:**
* Node.js & Express.js
* Prisma ORM (Database connection)
* Socket.io (WebSocket server)
* JSON Web Tokens (JWT) & bcrypt (Authentication)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

* [Node.js](https://nodejs.org/) (v16 or higher)
* npm or yarn
* A relational database like PostgreSQL or MySQL (supported by Prisma)

### STEPS

```bash
git clone [https://github.com/vishal33bisht/online-pool.git](https://github.com/vishal33bisht/online-pool.git)
cd online-pool
2. Backend Setup
Navigate to the backend directory:

Bash
cd backend
Install dependencies:

Bash
npm install
Set up environment variables:

Copy the .env.example file to create a new .env file.

Bash
cp .env.example .env
Open the .env file and add your database connection string and JWT secret.

Set up the database:

Bash
npx prisma generate
npx prisma migrate dev
Start the development server:

Bash
npm run dev
The backend server should now be running (typically on http://localhost:5000 or port specified in your .env).

3. Frontend Setup
Open a new terminal and navigate to the frontend directory:

Bash
cd Frontend
Install dependencies:

Bash
npm install
Set up environment variables:

Copy the .env.example file to .env and configure your API URL.

Bash
cp .env.example .env
Start the frontend development server:

Bash
npm run dev
The React app should now be running on http://localhost:5173.

📂 Project Structure
Plaintext
online-pool/
├── Frontend/                 # React frontend application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── api/              # Axios configurations & API calls
│   │   ├── components/       # Reusable UI components (Cards, Charts)
│   │   ├── context/          # React Context (AuthContext, SocketContext)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components (Home, Dashboard, CreatePoll)
│   │   └── socket/           # WebSocket client configurations
│   ├── vite.config.js        # Vite build configuration
│   └── vercel.json           # Vercel deployment configuration
│
└── backend/                  # Node.js + Express backend
    ├── prisma/               # Prisma schema and migrations
    ├── src/
    │   ├── config/           # App configurations (DB, Socket, CORS)
    │   ├── controllers/      # Route controllers (Auth, Polls)
    │   ├── middlewares/      # Express middlewares (Auth validation)
    │   ├── routes/           # Express API routes
    │   ├── services/         # Business logic layer
    │   └── utils/            # Helper functions (Error handling, Token gen)
    ├── server.js             # Main entry point
    └── render.yaml           # Render deployment configuration
🌐 Deployment
This project includes configuration files for easy deployment:

Frontend: Configured for seamless deployment on Vercel via vercel.json.

Backend: Configured for deployment on Render via render.yaml.

🤝 Contributing
Contributions, issues, and feature requests are welcome!
Feel free to check out the issues page.

📝 License
This project is open-source and available under the MIT License.
