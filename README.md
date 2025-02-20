# Task Management Website

A full-stack web application for managing tasks and team collaboration.

## Features

- User Authentication
- Task Management
- Team Collaboration
- Real-time Notifications
- Dashboard Analytics
- Responsive Design

## Tech Stack

- Frontend: React, Redux Toolkit, TailwindCSS
- Backend: Node.js, Express.js, MongoDB
- Authentication: JWT

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

Run only backend:
```bash
npm run dev
```

Run only frontend:
```bash
npm run dev
```

## Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=4000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

## Project Structure

```
├── backend/
│   ├── controllers/    # Route controllers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   └── server.js      # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Redux store
│   │   └── App.jsx      # Root component
│   └── index.html
└── package.json
```
