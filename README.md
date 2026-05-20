# Real-Time Resource Tracker (RTRT)

A full-stack, role-based web application built for Computer Science Departments to manage academic and technical resources in real-time. 

Designed with a premium dark-theme UI, stringent Role-Based Access Control (RBAC), and instantaneous WebSocket-driven state synchronization.

## 🚀 Technology Stack

- **Frontend:** React (TypeScript), Vite, React Router DOM, Custom SVG Icon Architecture, Vanilla CSS (Design-System).
- **Backend:** Node.js, Express, Socket.io (Real-time).
- **Database:** PostgreSQL (using `pg` driver with transaction support).
- **Security:** Strict JWT (JSON Web Token) strategy with 5-Tier Authorization, Password Hashing via bcrypt.
- **Architectural Setup:** Typescript Monorepo featuring shared packages (`@shared`).

---

## 🏗️ 5-Tier Role-Based Hierarchy (RBAC)

1. **Student:** Read-only dashboard access. Can request resource allocations.
2. **Staff:** Inherits Tier 1. Can report hardware maintenance algorithms and act on tickets.
3. **Faculty:** Inherits Tier 2. Can manage specific project equipment allocations.
4. **Admin:** Full read/write over Resources, Approvals, Rooms, and Standard Users.
5. **Chairman:** The Root System Administrator. Possesses unrestricted access + views the immutable Audit Trail.

---

## 🛠️ Local Development & Setup

### Requirements
- **Node.js**: v18 or later
- **Docker**: For running the PostgreSQL Database Container natively.

### 1. Bootstrapping Strategy
First, clone the repository and install all workspace dependencies efficiently from the root folder:

```bash
npm run setup
```

### 2. Environment Variables configuration
Navigate to `server/.env` and ensure your database connection and secrets are set:
```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/resource_tracker

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1h
```

### 3. Spin up the Database
Make sure Docker Desktop is active, then establish the database container:
```bash
docker-compose up -d
```

### 4. Relational Seeding
Inject the schema migrations and the default user accounts into Postgres: 
```bash
npm run db:migrate --workspace=server
npm run db:seed --workspace=server
```

*(This automatically generates the root Administrator account. Credentials map natively in `server/src/db/seed/chairman.sql`)*

### 5. Running the Application
From the root of the project, fire up both the frontend and backend in tandem, leveraging nodemon and Vite's auto-reloading:

```bash
npm run dev
```
- Client interface binds to `http://localhost:5173`
- API + WebSockets binds to `http://localhost:5000`

---

## 📡 Core API Structure

- `POST /api/auth/login` - Acquires JWT mapping.
- `GET /api/resources` - Core hardware list. Socket emissions target `RESOURCE_UPDATED`.
- `POST /api/allocations` - Booking reservations. Socket emissions target `ALLOCATION_REQUESTED`.
- `POST /api/maintenance` - Repair workflows. Socket emissions target `MAINTENANCE_REPORTED`.
- `GET /api/audit` - Root-only, immutable logs tracking all state mutations securely.
