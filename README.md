# Birthday Reminder (MERN)

## Setup
1. Server:  `cd server && npm install`, copy `.env.example` to `.env`, paste your MONGO_URI, then `npm run dev`
2. Client:  `cd client && npm install && npm run dev`  -> open http://localhost:5173
3. Concepts demo (hoisting, closures, event loop, promises): `cd server && npm run concepts`

## Where each topic lives
| Topic | File |
|---|---|
| CRUD (Mongo) | server/routes/people.js, reminders.js |
| Schema modelling | server/models/Person.js, Reminder.js |
| Primary / foreign / secondary keys | Reminder.js (person = FK, indexes) |
| HTTP status codes | 200, 201, 400, 404, 409, 500 across routes + errorHandler.js |
| Server error handling | middleware/errorHandler.js, asyncHandler.js |
| Env variables | server/.env.example, config/db.js, .gitignore |
| Middleware | middleware/*.js, server.js |
| RESTful design | GET/POST/PUT/DELETE on /api/people and /api/reminders |
| async/await, promises | client/src/utils/api.js, PersonForm.jsx |
| Closures | middleware/logger.js, asyncHandler.js, concepts-demo.js |
| Hoisting, event loop, callbacks vs promises | server/concepts-demo.js |
| Component composition | PeoplePage -> PersonCard, PersonForm -> ReminderFields |
| useState / useEffect | every page, ReminderAlert.jsx (timer + cleanup) |
| Client-side routing | client/src/App.jsx |

## Git workflow
```
git init
git add .
git commit -m "chore: initial project setup"
git checkout -b feature/calendar
# ...make changes...
git add . && git commit -m "feat: add calendar page"
git checkout main && git merge feature/calendar
```
