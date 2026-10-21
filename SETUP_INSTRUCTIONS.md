# CodeArena - Multi-Language Setup & Startup Guide

## 🚀 Post-PC Restart Startup Guide

Whenever you restart your PC, follow these steps to get CodeArena running in minutes.

---

### Step 1: Ensure Prerequisites are Running

1. **Docker Desktop:**
   - Launch **Docker Desktop** from your Windows Start Menu.
   - Wait until Docker Desktop shows the green indicator (**"Engine running"**).

2. **PostgreSQL Database:**
   - PostgreSQL runs as a native Windows service (`postgresql-x64-18`).
   - It usually starts automatically on boot. To verify or start manually in PowerShell:
     ```powershell
     Get-Service postgresql*
     # If stopped:
     Start-Service postgresql-x64-18
     ```

3. **Redis Container:**
   - Open PowerShell or CMD and start the existing Redis container:
     ```powershell
     docker start codearena-redis
     ```
   - *(If the container was ever removed, create it with: `docker run -d --name codearena-redis -p 6379:6379 redis:7-alpine`)*

---

### Step 2: Start the System Services (3 Terminals)

Open **3 separate terminal windows** (or tabs in VS Code / Windows Terminal):

#### 🔹 Terminal 1: Backend API Gateway
```powershell
cd C:\Users\HP\Desktop\DS\CodeArena\executor
node server.js
```
*Expected output:*
```
Submission queue created
Server running on 3000
PostgreSQL connected successfully!
```

#### 🔹 Terminal 2: High-Concurrency Execution Worker
```powershell
cd C:\Users\HP\Desktop\DS\CodeArena\executor
node worker.js
```
*Expected output:*
```
Worker started, waiting for jobs...
```
*(Runs with concurrency = 10 as configured in `.env`).*

#### 🔹 Terminal 3: Frontend Web Application
> ⚠️ **Important for Windows PowerShell:** Always use `npm.cmd` instead of `npm` to bypass Windows PowerShell script execution policy errors.
```powershell
cd C:\Users\HP\Desktop\DS\CodeArena\frontend
npm.cmd run dev
```
*Expected output:*
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

Now open **http://localhost:5173** in your browser!

---

## ⚡ Concurrency & Worker Scaling

Worker concurrency is configured dynamically via `executor/.env`:

```env
WORKER_CONCURRENCY=10
```

- **In-process Concurrency:** A single worker process executes up to 10 Docker containers simultaneously.
- **Horizontal Scaling:** You can run multiple worker processes in parallel terminals (e.g. 3 terminal windows running `node worker.js` will process up to **30 jobs concurrently** via Redis BullMQ work-stealing).

---

## 🛠️ Supported Languages & Docker Sandboxes

CodeArena supports **7 programming languages** running in isolated Docker containers:

| Language | Version / Compiler | Docker Image | Memory Limit | Timeout |
| :--- | :--- | :--- | :--- | :--- |
| **Python** | 3.11 Alpine | `codearena-python` | 256MB | 5s |
| **C++** | GCC 12 (C++17) | `codearena-cpp` | 256MB | 6s |
| **C** | GCC 12 (C11) | `codearena-c` | 256MB | 6s |
| **Java** | Eclipse Temurin 17 JDK | `codearena-java` | 384MB | 7s |
| **JavaScript**| Node.js 20 Alpine | `codearena-javascript` | 256MB | 5s |
| **C#** | .NET 8 SDK Alpine | `codearena-csharp` | 384MB | 9s |
| **PHP** | PHP 8.2 CLI Alpine | `codearena-php` | 256MB | 5s |

### Rebuilding Sandbox Images (if needed)
If you ever prune your Docker images, re-build them using:
```powershell
cd C:\Users\HP\Desktop\DS\CodeArena\backend\sandboxes
docker build -t codearena-python ./python
docker build -t codearena-cpp ./cpp
docker build -t codearena-c ./c
docker build -t codearena-javascript ./javascript
docker build -t codearena-php ./php
docker build -t codearena-java ./java
docker build -t codearena-csharp ./csharp
```

---

## 🔒 Security & Sandbox Isolation
- Every execution runs with `--network none` (zero internet access).
- CPU limited to 0.5 cores (`--cpus=0.5`).
- Memory capped between 256MB - 384MB.
- User code is decoded safely via Base64 to prevent shell escape vulnerabilities.
- Ephemeral containers (`--rm`) are automatically destroyed after execution completes.

