# High-Level Design

## 1. System context

Birthday Reminder is a client/server web application. The browser owns presentation, navigation, and date calculations; the API validates and persists records; MongoDB is the durable store.

```text
Browser
  React 18 + React Router
  Vite development server :5173
       |
       | /api/* (development proxy)
       v
Express API :5000
  middleware -> people/reminder routes -> Mongoose models
       |
       v
MongoDB (MONGO_URI)
```

In the development setup, Vite forwards `/api` requests to `http://localhost:5000`. The Express server connects to MongoDB before it starts listening. The client and server are separate npm projects with independent manifests and lockfiles.

## 2. Components

### Web client

- `main.jsx` mounts React and the browser router.
- `App.jsx` defines routes, shared navigation, the reminder banner, and theme state.
- `pages/PeoplePage.jsx` retrieves people for one group and reminders, then sorts people by days until birthday.
- `pages/PersonForm.jsx` handles both create and edit workflows and coordinates person and reminder API calls.
- `pages/CalendarPage.jsx` retrieves people and reminders and renders a Sunday-first month grid.
- `components/` contains navigation, person cards, the reminder banner, and reminder form rows.
- `utils/api.js` centralizes JSON fetch requests and API error conversion.
- `utils/time.js` formats time/date values and calculates birthday and reminder dates.

### API server

- `server.js` loads environment configuration, installs CORS, JSON parsing, request logging, API routes, and final 404/error handlers.
- `routes/people.js` implements people CRUD and reminder cleanup when a person is deleted.
- `routes/reminders.js` implements reminder list/create/delete and populates person summary data for reads.
- `middleware/validate.js` performs request-shape checks.
- `middleware/asyncHandler.js` forwards rejected asynchronous route work to centralized error handling.
- `middleware/errorHandler.js` maps common Mongoose errors to HTTP responses.
- `config/db.js` establishes the MongoDB connection and stops startup if configuration or connection fails.

### Data store

MongoDB contains `people` and `reminders` collections, represented by Mongoose models. MongoDB-generated `_id` values are the record identifiers. A reminder references its person through an ObjectId.

## 3. Data relationships

```text
Person 1 ───── 0..n Reminder
```

- A person has a name, birthday, group, and optional gift, about, and Instagram caption text.
- A reminder has a person reference, `daysBefore`, and time.
- Deleting a person explicitly deletes reminders that reference it.
- Reminder reads populate the referenced person's name, birthday, and group.

The `Person` model declares a group index. The `Reminder` model declares a person index and a unique compound index on `(person, daysBefore, time)`.

## 4. Main request flows

### List people

1. A group page calls `GET /api/people?group=friend|family` and `GET /api/reminders`.
2. The API queries people (sorted by name) and reminders (with a compact person reference).
3. The client sorts people by the next birthday and filters reminders per person for display.

### Create or edit a person

1. The form submits the person payload to `POST /api/people` or `PUT /api/people/:id`.
2. After receiving the saved person, the form deletes previously recorded reminder IDs in edit mode.
3. The form creates one reminder document for each current reminder row.
4. On success, the client navigates to the friend's or family's list according to the saved group.

Person persistence and reminder replacement are separate requests, not one transaction. A failure during reminder replacement can leave a partially updated set.

### Delete a person

1. The UI asks for confirmation.
2. `DELETE /api/people/:id` removes the person.
3. The route removes all reminders referencing that person and returns a success message.

### Alert and calendar

- The shared alert component loads reminders once and checks due conditions against the browser's local time every 60 seconds. It keeps dismissals in component state.
- The calendar loads people and reminders on mount. For each visible day, it matches birthday month/day and reminder dates calculated from the birthday and lead time. Month navigation is client-side.

## 5. Interfaces and deployment configuration

- The browser uses same-origin `/api/...` URLs. Vite's development proxy routes these to the Express server.
- The API defaults to port `5000` and reads `PORT` and `MONGO_URI` from the environment.
- `server/.env.example` documents the local environment variables. `.env` is ignored by Git.
- The client development server defaults to port `5173`.
- The server uses Express 4, Mongoose 8, and CommonJS modules. The client uses React 18, React Router 6, and Vite 5 with ES modules.

The repository documents local development startup in `README.md`; it does not define a production topology, database backup strategy, deployment pipeline, or monitoring service.

## 6. Quality attributes and current limitations

- **Persistence:** MongoDB persists the records; no local database fallback is present.
- **Consistency:** Person CRUD and reminder CRUD are individually validated, but the edit sequence is not atomic.
- **Availability:** The API does not begin listening until MongoDB connects. A connection failure exits the process.
- **Time behavior:** Birthday dates avoid date shifts by being stored as strings. Reminder evaluation uses browser-local time and requires an open page.
- **Security boundary:** The current API has no authentication or ownership checks, and Express enables CORS without an origin allowlist. It is suitable as a local learning application, not as-is for multi-user public deployment.
- **Error behavior:** The API returns JSON errors for unmatched routes and common validation/ID/duplicate-key failures. Client requests surface non-success API messages through a shared helper.
- **Observability:** The server logs each request and errors to the console; no structured log aggregation or metrics are configured.

