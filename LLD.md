# Low-Level Design

## 1. Domain model

### Person

MongoDB collection: `people`

| Field | Type | Constraints / behavior |
|---|---|---|
| `_id` | ObjectId | MongoDB primary identifier. |
| `name` | String | Required, trimmed. |
| `birthday` | String | Required; `YYYY-MM-DD` pattern. Stored as text to preserve the calendar date across time zones. |
| `group` | String | Required enum: `friend`, `family`. |
| `gift` | String | Defaults to empty string. |
| `about` | String | Defaults to empty string. |
| `instagramCaption` | String | Defaults to empty string. |
| `createdAt`, `updatedAt` | Date | Added by Mongoose timestamps. |

Declared secondary index: `{ group: 1 }`.

### Reminder

MongoDB collection: `reminders`

| Field | Type | Constraints / behavior |
|---|---|---|
| `_id` | ObjectId | MongoDB primary identifier. |
| `person` | ObjectId reference | Required reference to `Person`. |
| `daysBefore` | Number | Required, 0–60 inclusive. `0` means the birthday itself. |
| `time` | String | Required 24-hour `HH:MM` value. |
| `createdAt`, `updatedAt` | Date | Added by Mongoose timestamps. |

Declared indexes: `{ person: 1 }` and unique `{ person: 1, daysBefore: 1, time: 1 }`. Duplicate reminders for a person are rejected and mapped to HTTP 409.

## 2. HTTP API

All API responses use JSON except where noted. People/reminder arrays are returned as JSON arrays.

### People routes (`/api/people`)

| Method and path | Request | Success | Errors / behavior |
|---|---|---|---|
| `GET /` | Optional `?group=friend|family` | `200`, people sorted by name | Without the query, returns all groups. |
| `GET /:id` | MongoDB ID in path | `200`, person document | `404` if no person; malformed ID becomes `400`. |
| `POST /` | `name`, `birthday`, `group`; optional `gift`, `about`, `instagramCaption` | `201`, created person | `400` on validation failure. Only approved fields are copied from the body. |
| `PUT /:id` | Same person fields as create | `200`, updated person | `404` if no person; `400` on validation or ID failure. Runs Mongoose validators. |
| `DELETE /:id` | MongoDB ID in path | `200`, `{ message: "Person deleted" }` | `404` if absent; deletes the person and then its reminders. |

### Reminder routes (`/api/reminders`)

| Method and path | Request | Success | Errors / behavior |
|---|---|---|---|
| `GET /` | Optional `?person=<id>` | `200`, reminder array with populated person `name`, `birthday`, `group` | A person filter is applied when supplied. |
| `POST /` | `person`, `daysBefore`, `time` | `201`, created reminder | `400` for invalid fields; `404` if referenced person does not exist; `409` for duplicate compound key. |
| `DELETE /:id` | Reminder ID in path | `200`, `{ message: "Reminder deleted" }` | `404` if absent; malformed ID becomes `400`. |

There is no standalone reminder update route. The person edit workflow replaces reminders by deleting the previous IDs and creating the submitted rows.

### Health and errors

- `GET /api/health` returns `200` with `{ status: "ok" }`.
- Unknown paths return `404` with a message containing the method and URL.
- Central error handling maps Mongoose validation errors to `400`, cast errors to `400`, and duplicate-key errors (`11000`) to `409`; unrecognized errors return `500`.
- Request validation middleware responds directly with `400` JSON messages before route logic.

## 3. Validation

| Data | Request middleware | Model validation |
|---|---|---|
| Person name | Must exist and not be blank after trimming | Required and trimmed |
| Person birthday | Must match `YYYY-MM-DD` | Required and same pattern; semantic date validity is not checked |
| Person group | Must be `friend` or `family` | Required enum |
| Reminder person | Must be present; route verifies referenced person exists | Required ObjectId reference |
| Reminder `daysBefore` | Must be a number >= 0 | Required, range 0–60 |
| Reminder time | Must match 24-hour `HH:MM` | Required, same pattern |

The person route uses a field allowlist (`name`, `birthday`, `group`, `gift`, `about`, `instagramCaption`) to avoid persisting arbitrary body properties.

## 4. Client routes and component responsibilities

| Browser route | Component | Behavior |
|---|---|---|
| `/` | Redirect | Navigates to `/friends`. |
| `/friends` | `PeoplePage group="friend"` | Loads and displays friend records. |
| `/family` | `PeoplePage group="family"` | Loads and displays family records. |
| `/calendar` | `CalendarPage` | Displays birthdays and reminder dates for the selected month. |
| `/add` | `PersonForm` | Creates a person and their reminders. |
| `/edit/:id` | `PersonForm` | Loads a person and reminders, then updates/replaces them. |
| Other paths | Not-found element | Displays “Page not found”. |

Shared components:

- `Navbar` supplies links and the theme toggle.
- `PersonCard` displays countdown, birthday, optional personal text, reminders, edit/delete controls, and caption copying.
- `ReminderAlert` fetches reminder data once, checks the clock every minute, and renders dismissible due banners.
- `ReminderFields` edits the parent-owned reminder rows. Its default row is 7:00 AM on the birthday; selectable lead times are 0, 1, 3, and 7 days, and time choices are quarter hours.

## 5. Client API helper

`utils/api.js` exposes:

| Helper | HTTP operation |
|---|---|
| `getPeople(group?)` | `GET /api/people` with optional group query |
| `getPerson(id)` | `GET /api/people/:id` |
| `createPerson(data)` | `POST /api/people` |
| `updatePerson(id, data)` | `PUT /api/people/:id` |
| `deletePerson(id)` | `DELETE /api/people/:id` |
| `getReminders(personId?)` | `GET /api/reminders` with optional person query |
| `createReminder(data)` | `POST /api/reminders` |
| `deleteReminder(id)` | `DELETE /api/reminders/:id` |

The shared request helper sends JSON content type, parses JSON response bodies, and throws an `Error` using the API's `message` for non-2xx responses.

## 6. Date and reminder calculations

- Birthday strings are parsed into local `Date` values for display and calculations.
- `daysUntilBirthday` compares local midnight today with the next occurrence of the birthday; if this year's date is before today, it advances the year.
- `reminderDate(birthday, daysBefore, year)` subtracts the lead days using JavaScript date arithmetic, which naturally rolls into the prior month or year.
- `isDueNow` checks the current year and following year, compares the calculated day with the current local day, and checks whether stored `HH:MM` is less than or equal to the current local `HH:MM`.
- `to24Hour`, `splitTime`, and `to12Hour` convert between form values and stored/displayed times.
- The calendar checks reminder dates for its displayed year and the following year to include reminders that cross a year boundary.
- JavaScript date normalization applies to unusual dates; for example, a February 29 birthday is constructed with native `Date` behavior in non-leap years.

## 7. Edit sequence and failure behavior

On submit, `PersonForm` first creates or updates the person. It then deletes each previous reminder and creates the current rows in parallel. The API does not provide a transaction spanning these requests. If any reminder request fails, the UI shows the error and remains on the form, but person changes and some reminder changes may already have persisted. A later retry can encounter state that differs from the original form load.

## 8. Runtime configuration

- Client: `npm run dev`, `npm run build`, and `npm run preview` are provided in the client package.
- Server: `npm run dev`, `npm start`, and `npm run concepts` are provided in the server package.
- Server settings: `PORT` defaults to `5000`; `MONGO_URI` is required. The server exits if MongoDB connection setup fails.
- Development client port: `5173`; Vite proxies `/api` to the server at port `5000`.

