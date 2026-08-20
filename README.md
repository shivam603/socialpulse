# SocialPulse

> A focused workspace for composing, scheduling, and governing social content.

SocialPulse brings the daily publishing workflow into one place. Create a draft, attach a channel and publishing date, review the schedule on a calendar, and manage the workspace through a role-protected admin panel.

[View the repository](https://github.com/shivam603/socialpulse) · [Report an issue](https://github.com/shivam603/socialpulse/issues)

## Product Highlights

| Workspace | What it does |
| --- | --- |
| Composer | Create, edit, tag, and delete posts across supported channels. |
| Calendar | See scheduled content in a monthly publishing view. |
| Admin panel | Review workspace activity, manage user roles, and moderate posts. |
| Authentication | Register and sign in with expiring JWT sessions. |

## Features

- Draft and schedule posts for Instagram, Facebook, Reddit, Quora, X, or another channel
- Monthly calendar view for scheduled content
- JWT authentication with bcrypt password hashing
- Role-based access control for administrator routes
- Admin summaries, user role management, and post moderation
- MongoDB persistence with an in-memory fallback for local demos
- Responsive interface for desktop and mobile screens

## Getting Started

### Requirements

- Node.js 18 or newer
- npm
- MongoDB, optional for local development

### Install and run

```powershell
git clone https://github.com/shivam603/socialpulse.git
cd socialpulse
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Verify the project

```powershell
npm run check
```

The check script validates the Express entry point. Route modules and the embedded browser script can also be checked with Node's syntax checker during development.

## Configuration

Create a local `.env` file from the included template:

```powershell
Copy-Item .env.example .env
```

Set private values before deploying. Never commit `.env` or production credentials.

| Variable | Description | Local fallback |
| --- | --- | --- |
| `PORT` | HTTP server port | `3000` |
| `JWT_SECRET` | Secret used to sign authentication tokens | Development fallback only |
| `MONGO_URI` | MongoDB connection string | In-memory storage |
| `ADMIN_EMAIL` | Seed administrator email | Development fallback only |
| `ADMIN_PASSWORD` | Seed administrator password | Development fallback only |

When `MONGO_URI` is not set, SocialPulse uses in-memory storage. This is convenient for a quick demo, but data is cleared when the server stops. Use MongoDB for persistent data.

## API Surface

All protected endpoints expect an `Authorization: Bearer <token>` header.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account and receive a JWT. |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT. |
| `GET`, `POST` | `/api/posts` | List or create the signed-in user's posts. |
| `GET`, `PUT`, `DELETE` | `/api/posts/:id` | Read, update, or delete an owned post. |
| `GET` | `/api/admin/summary` | View workspace counts as an administrator. |
| `GET` | `/api/admin/users` | List users without password fields. |
| `GET` | `/api/admin/posts` | Review all workspace posts. |
| `PATCH` | `/api/admin/users/:id/role` | Change a user's role. |
| `DELETE` | `/api/admin/posts/:id` | Moderate a post. |
| `GET` | `/api/health` | Check server availability. |

## Project Layout

```text
app.html              SocialPulse web interface
server.js             Express server and application entry point
data/storage.js       In-memory development storage
middleware/auth.js    JWT verification
middleware/admin.js   Administrator role guard
models/User.js        User schema
models/Post.js        Post schema
routes/auth.js        Registration and login
routes/posts.js       Authenticated post operations
routes/admin.js       Admin reporting and moderation
```

## Security Notes

- Passwords are hashed with `bcryptjs` before storage.
- JWTs expire after seven days.
- User post queries are scoped to the authenticated user.
- Admin routes require both a valid JWT and the `admin` role.
- Use strong, private `JWT_SECRET` and `ADMIN_PASSWORD` values in deployed environments.

## Author

**Shivam Ray**

[GitHub](https://github.com/shivam603) · [Email](mailto:shivamray603@gmail.com)
