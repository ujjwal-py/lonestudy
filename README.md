# LoneStudy - Pomodoro Study Tracker

A full-stack study tracker with task management, a Pomodoro timer, notes, soft-delete task history, and time-based stats.

## Features

### 🎯 Core Features
- **Task Management** - Create, update, and track study tasks
- **Pomodoro Timer** - Choose 25-minute or 50-minute focus cycles with matched breaks (5 or 10 minutes)
- **Notes Section** - Quick note-taking during study sessions
- **Statistics Tracking** - View completed tasks and time spent by day, week, and month
- **Soft Delete** - Deleted tasks remain in database for historical data preservation
- **Theme Toggle** - Dark glass default with light mode toggle

### 🔐 Authentication
- User registration and login with JWT tokens
- Password hashing with bcrypt
- Protected routes and secure API endpoints

### 📊 Stats & Analytics
- Daily, weekly, and monthly task completion stats
- Total time studied tracking
- Expandable completed-task history
- Real-time stats updates

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Zod** - Schema validation
- **CORS** - Cross-origin resource sharing

## Project Structure

```
solostudy/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── taskController.js
│   │   │   └── statsController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── statsMiddleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Task.js
│   │   │   └── Stats.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   └── statsRoutes.js
│   │   ├── validators/
│   │   │   └── validators.js
│   │   └── utils/
│   │       ├── db.js
│   │       └── generateToken.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── TaskList.jsx
│   │   │   ├── PomodoroTimer.jsx
│   │   │   ├── Notes.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── TasksPage.jsx
│   │   │   └── StatsPage.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── api/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── package.json
│   └── index.html
│
└── README.md
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend root:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

4. Start the server:
```bash
npm start
```

Server runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in frontend root:
```env
VITE_API_URL=http://localhost:5000
```

4. Start the dev server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## Usage

### Getting Started

1. **Register** - Create a new account with email and password
2. **Login** - Sign in with your credentials
3. **Dashboard** - View pending tasks, pick a task, and run 25/50 minute focus cycles
4. **Tasks Page** - Create new tasks and view completion stats
5. **Stats Page** - Track your progress with detailed analytics

### Workflow

1. Create a task with title, description, and target cycles
2. Select a task from the pending list
3. Start the Pomodoro timer with either a 25-minute or 50-minute focus cycle
4. Work during the focus session
5. Take the auto-matched break when the timer completes
6. Track your progress in the Stats page

### Features Breakdown

**Dashboard**
- Quick view of pending tasks
- Active Pomodoro timer with selectable focus duration
- Notes section for jotting down ideas

**Tasks Page**
- Create new study tasks
- View all pending tasks
- See completed tasks by day, week, month
- Delete tasks (soft-delete, preserves data)

**Stats Page**
- Daily task completion count
- Weekly progress tracking
- Monthly achievements
- Total time studied
- Expandable completed task lists
- Soft-deleted completed tasks still count toward stats

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/task/display` - Get tasks (with optional status filter)
- `POST /api/task/create` - Create new task
- `PUT /api/task/update/:id` - Update task
- `DELETE /api/task/delete/:id` - Soft delete task
- `PUT /api/task/update-time` - Increment task elapsed time
- `PUT /api/task/addCycle` - Increment completed cycles

### Stats
- `GET /api/stats` - Get stats for today, week, month
- `POST /api/stats/update` - Update stats

## Database Models

### User
- Email, password (hashed)
- Name
- Created/updated timestamps

### Task
- Title, description
- Status (pending/completed)
- Cycles required/completed
- Time elapsed (seconds)
- Completion timestamp
- User reference
- Soft delete flag
- Created/updated timestamps

### Stats
- User reference
- Date
- Total completed count
- Total time
- Tasks completed array
- Created/updated timestamps

## Key Implementation Details

### Soft Delete
Tasks are never permanently deleted. Instead:
- `deleted` field is set to `true`
- Queries filter out deleted tasks: `{ deleted: { $ne: true } }`
- Historical data preserved for stats

### Time Tracking
- Pomodoro focus time is stored in seconds per task
- Time is added on pause and on completed focus cycles
- Break time is not added to task totals
- Reset does not save in-progress focus time

### Stats Calculation
- Backend tracks completion history using a dedicated completion timestamp
- Soft-deleted completed tasks are still included in stats
- Filters by date ranges (today, week, month)
- Aggregates time and task counts
- Returns task details for display

## Development Notes

- Uses JWT for stateless authentication
- CORS enabled for frontend-backend communication
- Mongoose soft-delete pattern for data preservation
- Dark/light glass theme with persisted toggle
- Auto-refresh stats on task completion

## Future Enhancements

- Task categories and priorities
- Pomodoro session history
- Export stats as PDF
- Mobile app
- Real-time collaboration
- Browser notifications
- Offline support

## License

ISC

## Author

loneStudy Development Team
