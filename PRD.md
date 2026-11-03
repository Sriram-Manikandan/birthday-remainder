# Product Requirements Document

## 1. Product overview

Birthday Reminder is a browser-based application for keeping birthday details for friends and family, planning gifts and birthday messages, and seeing upcoming birthdays and reminder times. It is implemented as a React single-page application backed by an Express REST API and MongoDB.

This document describes the behavior present in the repository; it does not imply that unimplemented capabilities are available.

## 2. Problem and goals

People want one place to:

- Keep birthdays and useful personal notes organized by friends and family.
- Remember gift ideas and a prepared social-media caption.
- Choose reminder lead times and times of day.
- See upcoming birthdays and reminders without manually tracking dates.

The product provides those capabilities through people lists, an add/edit form, a month calendar, and in-app reminder banners.

## 3. Users and primary use cases

The intended user is an individual maintaining a personal list of birthdays. There are no accounts or user roles in the current implementation.

1. Browse friends or family and see their next birthday and configured reminders.
2. Add or edit a person's name, birthday, group, gift idea, notes, caption, and reminders.
3. Delete a person and their associated reminders.
4. Browse birthdays and reminder times by month.
5. Dismiss an in-app banner after a reminder becomes due.
6. Switch between light and dark themes.

## 4. Functional requirements and current behavior

| ID | Requirement | Current behavior |
|---|---|---|
| FR-1 | Maintain people records | Create, retrieve, update, and delete people through the people API and the browser UI. |
| FR-2 | Categorize people | A person belongs to either `friend` or `family`; list pages filter by group. |
| FR-3 | Store useful birthday context | Records can include a gift idea, an about note, and an Instagram caption. The caption can be copied to the clipboard. |
| FR-4 | Configure reminders | A person can have multiple reminders, each with a lead time and 24-hour stored time. The UI offers the birthday itself, 1, 3, or 7 days before and quarter-hour choices across AM and PM. |
| FR-5 | Show upcoming birthdays | People lists sort by days until the next birthday and show the birthday date and a countdown. |
| FR-6 | Show a calendar | A month view displays birthday events by group and reminder events by time. Users can move to the previous or next month. |
| FR-7 | Alert when a reminder is due | A banner appears in the application when its reminder date and local time have arrived. The page checks the clock every minute; dismissals last only for the current page session. |
| FR-8 | Persist display preference | The light/dark choice is stored in browser local storage. |
| FR-9 | Report service health | `GET /api/health` returns an `ok` status when the server is responding. |

### Acceptance baseline

- People and reminder data survive browser reloads because they are stored in MongoDB.
- Friends and family are separately browsable; the calendar includes both.
- Editing a person replaces their configured reminders with the reminder rows submitted in the form.
- Deleting a person also deletes their reminder documents.
- A reminder banner is eligible to show on its configured date after its configured local time, subject to the page being open and its data having loaded.
- The calendar identifies the current date and can display dates that cross month boundaries for reminders.

## 5. Scope boundaries

### Included

- Single-page browser UI with list, form, and calendar routes.
- CRUD for people and create/read/delete operations for reminders.
- In-app reminder banners, calendar rendering, theme preference, and caption copying.
- Local development with Vite, Express, and MongoDB.

### Not implemented

- User registration, authentication, authorization, or per-user data isolation.
- Email, SMS, push, operating-system, or background reminders; the current alert is shown only in the open application.
- Persistent dismissal or delivery history, reminder retrying, or a scheduler/worker.
- Import/export, search, sharing, recurring event types other than birthdays, or localization.
- Automated application tests or a defined production deployment/monitoring setup.

## 6. Data and product constraints

- Birthdays are stored as `YYYY-MM-DD` strings so the stored calendar day is not shifted by date/time-zone conversion.
- Reminder times are stored as `HH:MM` in 24-hour format and compared against the browser's local clock.
- Reminder lead time is constrained by the model to 0–60 days. The current form offers only 0, 1, 3, and 7 days.
- The birthday validator checks the date's string shape, not whether the month/day is a valid calendar date.
- The application has no accounts; all connected clients use the same API data set.
- The alert depends on the user keeping the page open. It loads reminders at component mount and checks the clock each minute; it does not periodically refetch reminder data.

## 7. Success criteria

The current release is considered functionally complete for its local, single-user use case when a user can create a person with reminders, find that person under the selected group, see the birthday/reminders in the list and calendar, receive an in-app due banner while the application is open, edit or remove the record, and retain the selected theme after reloading.
