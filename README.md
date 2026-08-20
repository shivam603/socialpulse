# SocialPulse

SocialPulse is a professional social content workspace for composing, scheduling, and managing posts across channels. It includes JWT authentication, role-based administration, and a calendar-based publishing view.

## Features

- Create, edit, and delete social posts
- Save drafts or schedule posts for a future date
- View scheduled content in a monthly calendar
- JWT-based registration and login
- Role-protected admin panel
- User role management and post moderation
- MongoDB support with an in-memory fallback for local demos
- Responsive web interface

## Quick Start

Requirements: Node.js 18 or newer.

```powershell
npm install
npm start
```

Open `http://localhost:3000` in a browser.

For syntax checks:

```powershell
npm run check
```

## Configuration

Copy `.env.example` to `.env` and set values for a real deployment. `JWT_SECRET` and `ADMIN_PASSWORD` should always be replaced with strong private values.

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | HTTP port | `3000` |
| `JWT_SECRET` | JWT signing secret | Local fallback only |
| `MONGO_URI` | MongoDB connection string | In-memory storage |
| `ADMIN_EMAIL` | Seed administrator email | Local demo account |
| `ADMIN_PASSWORD` | Seed administrator password | Local demo account |

The local fallback seeds an administrator when no database is configured. For a production deployment, configure all administrator and JWT values through environment variables.

## Project Structure

```text
app.html              Responsive SocialPulse interface
server.js             Express application entry point
data/storage.js       In-memory development storage
middleware/auth.js    JWT verification middleware
middleware/admin.js   Admin role guard
models/               MongoDB schemas
routes/auth.js        Registration and login endpoints
routes/posts.js       Authenticated post endpoints
routes/admin.js       Admin summary and moderation endpoints
```

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET|POST /api/posts`
- `GET|PUT|DELETE /api/posts/:id`
- `GET /api/admin/summary`
- `GET /api/admin/users`
- `GET /api/admin/posts`
- `PATCH /api/admin/users/:id/role`
- `DELETE /api/admin/posts/:id`
- `GET /api/health`

## Author

**Shivam Ray**  
[GitHub](https://github.com/shivam603) · [Email](mailto:shivamray603@gmail.com)
