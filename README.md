# 🚀 CodeArena

A distributed code execution platform — built from scratch with 
Docker sandboxing, Redis job queues, real-time WebSocket results, 
and AI-powered code analysis.

**Live Demo:** http://15.206.170.214

---

## 📖 Overview

CodeArena lets users write, submit, and execute code (Python, C++) 
against test cases in a secure, isolated environment — similar to 
the core infrastructure behind platforms like HackerRank and 
LeetCode. Every submission runs inside a sandboxed Docker container 
with strict resource limits, gets processed through a distributed 
job queue, and returns results to the user in real-time via 
WebSockets — with optional AI-powered feedback on failed attempts.

---

## ✨ Features

- **Sandboxed Code Execution** — Python & C++ code runs in isolated 
  Docker containers with memory limits, CPU caps, and zero network 
  access
- **Distributed Job Queue** — Redis + BullMQ handles concurrent 
  submissions without overloading the server
- **Real-Time Results** — WebSocket + Redis Pub/Sub delivers 
  execution results instantly, no polling required
- **Judge System** — Code runs against visible and hidden test 
  cases with pass/fail breakdown
- **AI Code Analysis** — Groq (Llama3) powered contextual feedback 
  on failed submissions, using problem details and submission 
  history
- **Authentication & Security** — JWT with refresh token rotation, 
  Redis-based token blacklisting, bcrypt password hashing, and 
  role-based access control (RBAC)
- **Admin Panel** — Manage problems, test cases, submissions, and 
  users
- **Rate Limiting** — Protects against abuse on auth and execution 
  endpoints

  ┌─────────────┐

│   Browser    │  React + Monaco Editor + Socket.io client

└──────┬───────┘

│ HTTP / WebSocket

┌──────▼───────┐

│  Node.js      │  Express + Socket.io

│  Server       │  Auth, REST API, WebSocket gateway

└──┬─────────┬──┘

│         │

┌────▼───┐ ┌──▼──────────┐

│ Redis   │ │ PostgreSQL  │

│ Queue + │ │ Users,      │

│ Pub/Sub │ │ Problems,   │

│         │ │ Submissions │

└────┬────┘ └─────────────┘

│

┌────▼─────┐

│ Worker    │  Picks jobs, runs Docker sandboxes

└────┬─────┘

│

┌────▼──────────┐

│ Docker          │  Isolated Python / C++ containers

│ Sandboxes        │  Memory + CPU limited, no network

└─────────────────┘

---

## 🛠️ Tech Stack

| Layer        | Technology                                      |
|--------------|--------------------------------------------------|
| Frontend     | React, Vite, Monaco Editor                       |
| Backend      | Node.js, Express.js, Socket.io                   |
| Queue        | Redis, BullMQ                                    |
| Database     | PostgreSQL                                       |
| Auth         | JWT, bcrypt, Redis (token blacklisting)          |
| Execution    | Docker, Docker SDK (dockerode)                   |
| AI           | Groq API (Llama3), LangChain, Prompt Engineering |
| Deployment   | AWS EC2, Docker Compose, Nginx (reverse proxy)   |

---

## 🔒 Security

- JWT access + refresh token rotation
- Redis-based token blacklisting on logout
- bcrypt password hashing (12 rounds)
- Role-Based Access Control (RBAC)
- Rate limiting on auth and execution endpoints
- httpOnly, secure cookies
- Docker sandbox isolation: memory limits, CPU caps, no network 
  access, auto-destroyed containers
- Environment variables for all secrets (never committed)

---

## 📂 Project Structure
codearena/

├── executor/             # Node.js backend

│   ├── server.js         # Express + Socket.io entry point

│   ├── worker.js         # BullMQ job processor

│   ├── executor.js       # Docker sandbox execution logic

│   ├── db.js              # PostgreSQL connection

│   ├── queue.js           # BullMQ queue setup

│   ├── middleware/        # Auth, RBAC

│   ├── routes/             # Auth, admin routes

│   └── services/            # AI analysis (Groq)

├── sandboxes/

│   ├── python/             # Python sandbox Dockerfile

│   └── cpp/                  # C++ sandbox Dockerfile

├── frontend/                 # React application

│   └── src/

│       ├── pages/             # Editor, Admin, Login, etc.

│       ├── context/            # Auth context

│       └── api/                  # Axios config

└── docker-compose.yml          # Multi-container orchestration

---

## 🚀 Running Locally

### Prerequisites
- Docker & Docker Compose
- Node.js 18+

### Setup

````bash
# Clone the repository
git clone https://github.com/piyushwaghmare/codearena.git
cd codearena

# Create .env file with required variables
# (see .env.example)

# Build sandbox images
docker build -t codearena-python ./sandboxes/python
docker build -t codearena-cpp ./sandboxes/cpp

# Start all services
docker compose up --build

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
````

### Environment Variables

````
POSTGRES_DB=codearena
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
GROQ_API_KEY=your_groq_api_key
REDIS_HOST=redis
````

---

## 🎯 What I Learned Building This

This project was built end-to-end as a deep dive into distributed 
systems engineering:

- Designing secure code execution sandboxes with Docker resource 
  limits and network isolation
- Building a producer-consumer architecture with Redis/BullMQ for 
  handling concurrent workloads
- Implementing real-time bidirectional communication with 
  WebSockets and Redis Pub/Sub across separate containers
- Production-grade authentication with token rotation and 
  blacklisting strategies
- Prompt engineering for deterministic, context-aware AI feedback
- Deploying a multi-container application on AWS EC2 with Nginx 
  as a reverse proxy

---

## 📬 Contact

**Piyush Waghmare**
[LinkedIn](https://www.linkedin.com/in/piyushwaghmare11/) · 
[GitHub](https://github.com/piyushwaghmare) · 
piyush.waghmare142@gmail.com

````

## 🏗️ Architecture
