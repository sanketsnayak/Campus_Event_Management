# Campus Event Management Backend

This is the backend API for the Campus Event Management Platform built with Express.js and SQLite.

## Features

- Event management (CRUD operations)
- Student registration and attendance tracking
- Feedback collection
- Comprehensive reporting
- SQLite database with proper relationships

## API Endpoints

### Events
- `POST /api/events` - Create new event
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Student Operations
- `POST /api/students/register/:eventId` - Register for event
- `POST /api/students/attendance/:eventId` - Mark attendance
- `POST /api/students/feedback/:eventId` - Submit feedback
- `GET /api/students/:studentId/events` - Get student's events

### Reports
- `GET /api/reports/popularity` - Event popularity report
- `GET /api/reports/student/:studentId` - Student participation report
- `GET /api/reports/top-students` - Top active students
- `GET /api/reports/event/:id` - Detailed event report
- `GET /api/reports/dashboard` - Dashboard statistics

### General
- `GET /api/colleges` - Get all colleges
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm run dev
```

The server will run on http://localhost:5000

## Database Schema

- **Colleges**: college_id, name
- **Students**: student_id, name, email, roll_no, college_id
- **Events**: event_id, title, type, date, location, college_id, description
- **Registrations**: reg_id, student_id, event_id, registered_at
- **Attendance**: att_id, student_id, event_id, status
- **Feedback**: feedback_id, student_id, event_id, rating, comment
