# Attendance Management System

A full-stack web application for managing class attendance, built for the Internet and Web Development course at the University of The Gambia.

## Overview

This system allows lecturers to create attendance sessions for their courses and mark students as Present or Absent. Students can log in separately to view their own attendance history, including a breakdown by course and an overall attendance rate.

## Features

- **User authentication** — secure registration and login with hashed passwords (bcrypt), with separate roles for Lecturer and Student
- **Attendance sessions** — lecturers create a session per course/date, preventing duplicate sessions for the same course on the same day
- **Mark attendance** — lecturers mark each student Present or Absent for a selected session, with the ability to edit a status afterward
- **Student dashboard** — students view their full attendance history, a Present/Absent/Rate summary, and a per-course breakdown
- **Session management** — lecturers can view and delete past attendance sessions
- **Live deployment** — fully deployed and connected to a cloud database, with no setup required to use it

## Tech Stack

**Backend**
- Node.js + Express.js
- MongoDB (via Mongoose) — hosted on MongoDB Atlas
- bcryptjs for password hashing
- dotenv for environment configuration
- CORS enabled for cross-origin requests from the frontend

**Frontend**
- HTML5, CSS3 (custom styling, no frameworks)
- Vanilla JavaScript (ES6+, async/await, Fetch API)

**Deployment**
- Backend: [Render](https://render.com)
- Frontend: [Netlify](https://netlify.com)
- Database: [MongoDB Atlas](https://www.mongodb.com/atlas)

## Live Links

- **Live site:** https://attendance-system-utg.netlify.app
- **Backend API:** https://attendance-system-a8eq.onrender.com

## Project Structure

```
Attendance_System/
├── Backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Attendance.js
│   ├── server.js
│   ├── package.json
│   └── .env (not committed)
├── Frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── lecturer-dashboard.html
│   ├── student-dashboard.html
│   ├── script.js
│   └── styles.css
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | `/register` | Register a new user (student or lecturer) |
| POST | `/login` | Log in and receive the user's role |
| POST | `/create-attendance` | Create a new attendance session |
| GET | `/students` | Get all registered students |
| GET | `/sessions` | Get all attendance sessions (for dropdown selection) |
| POST | `/mark` | Mark a student Present or Absent for a session |
| PUT | `/update-attendance` | Update a student's status for a session |
| GET | `/my-attendance/:email` | Get a specific student's attendance history |
| GET | `/attendance` | Get all attendance sessions |
| DELETE | `/attendance/:id` | Delete an attendance session |

## Setup Instructions (Running Locally)

### Prerequisites
- Node.js installed
- A MongoDB connection string (local or Atlas)

### Backend

```bash
cd Backend
npm install
```

Create a `.env` file inside `Backend/` with:
```
MONGO_URI=your_mongodb_connection_string
PORT=3000
```

Start the server:
```bash
node server.js
```

### Frontend

Open `Frontend/login.html` in a browser, or serve the `Frontend` folder with a local server (e.g., VS Code's Live Server extension). Make sure the URLs in `script.js` point to your running backend.

## Security Notes

- Passwords are hashed using bcrypt before being stored
- User-generated content (names, course names) is escaped before being rendered to prevent XSS
- Environment variables keep database credentials out of the codebase

## Authors

- Sarjo Jallow
- Sheriffo A. Darboe

## Course

Internet and Web Development 1 — Final Project, University of The Gambia
git
