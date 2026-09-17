# ChatApp

Real-time one-to-one messaging for the web, built on Express, Socket.IO and
MongoDB.

[![CI](https://github.com/hasan-bekir-dogan/ChatApp/actions/workflows/ci.yml/badge.svg)](https://github.com/hasan-bekir-dogan/ChatApp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)

ChatApp is a small, dependency-light chat server you can read end to end in an
afternoon. Users register with an email address, add each other as contacts,
and exchange messages that are delivered over a WebSocket without a page
reload. It is useful as a starting point for a messaging feature inside a
larger product, and as a worked example of session-based authentication that
covers both HTTP requests and socket connections.

## Features

- **Accounts** — registration and login with bcrypt-hashed passwords, sessions
  stored in MongoDB, and a fresh session id issued on every login.
- **Contacts** — look a user up by email address and add them to your contact
  list.
- **Conversations** — one-to-one chats with a searchable list, ordered by the
  most recent message.
- **Live delivery** — new and deleted messages appear immediately for both
  participants through Socket.IO.
- **Profiles** — change your display name, email address and avatar; uploads
  are validated by MIME type and size.
- **Scoped socket events** — a chat event reaches only the two participants of
  a conversation, not every connected client.

## Architecture

```
Browser (jQuery + Socket.IO client)
    │  HTTP (JSON + EJS pages)          │  WebSocket
    ▼                                   ▼
┌───────────────────────────────────────────────────┐
│ Express app (app.js)                              │
│   routes/ → middlewares/ → controllers/           │
│   session middleware (express-session)            │
└───────────────────────────────────────────────────┘
    │                                   │
    │                  shared session   │
    ▼                                   ▼
┌─────────────────┐            ┌────────────────────┐
│ MongoDB         │            │ Socket.IO server   │
│ users, chats,   │            │ one room per user  │
│ messages, sess. │            │ (config/socket.js) │
└─────────────────┘            └────────────────────┘
```

`app.js` builds and exports the Express application without listening on a
port, which keeps it directly testable with Supertest. `server.js` is the
entry point: it creates the HTTP server, attaches Socket.IO, connects to
MongoDB and handles graceful shutdown.

The Socket.IO server reuses the Express session middleware, so a socket is
authenticated by the same cookie as an HTTP request. Each connection joins a
room named after its own user id, and a chat event is emitted to the sender's
room and the recipient's room only.

### Data model

| Collection | Purpose                                                         |
| ---------- | --------------------------------------------------------------- |
| `users`    | Credentials, profile and the contact list (`phoneBook`)         |
| `chats`    | One document per pair of users, holding each side's message ids |
| `messages` | Message text and timestamp                                      |

## Requirements

- Node.js 18 or newer
- MongoDB 5 or newer

## Getting started

```bash
git clone https://github.com/hasan-bekir-dogan/ChatApp.git
cd ChatApp
npm install
cp .env.example .env
npm run dev
```

The app is then available at <http://localhost:3000>.

If you would rather not install MongoDB locally, start one with Docker:

```bash
docker compose up -d mongo
```

Or run the whole stack:

```bash
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))") \
  docker compose up --build
```

## Configuration

Every setting is read from the environment; see `.env.example` for a
copy-ready file.

| Variable           | Default                             | Description                           |
| ------------------ | ----------------------------------- | ------------------------------------- |
| `NODE_ENV`         | `development`                       | `development`, `production` or `test` |
| `PORT`             | `3000`                              | HTTP port                             |
| `MONGODB_URI`      | `mongodb://127.0.0.1:27017/chatapp` | Database and session store            |
| `SESSION_SECRET`   | development-only fallback           | Signs the session cookie              |
| `SESSION_MAX_AGE`  | `604800000`                         | Session lifetime in milliseconds      |
| `UPLOAD_MAX_BYTES` | `2097152`                           | Maximum avatar size in bytes          |
| `TRUST_PROXY`      | `false`                             | Set to `true` behind a reverse proxy  |

The server refuses to start in production unless `MONGODB_URI` and a non-default
`SESSION_SECRET` are set.

## Scripts

| Command                 | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `npm start`             | Start the server                                |
| `npm run dev`           | Start with nodemon and reload on change         |
| `npm test`              | Run the test suite against an in-memory MongoDB |
| `npm run test:coverage` | Run the tests with a coverage report            |
| `npm run lint`          | Lint with ESLint                                |
| `npm run format`        | Format with Prettier                            |

## HTTP API

All endpoints under `/chat`, `/message`, `/person` and `/profile` require an
authenticated session and answer `401` without one.

| Method   | Path                | Body                                           | Description                                |
| -------- | ------------------- | ---------------------------------------------- | ------------------------------------------ |
| `POST`   | `/users/signup`     | `name`, `email`, `password`, `confirmPassword` | Create an account                          |
| `POST`   | `/users/login`      | `email`, `password`                            | Start a session                            |
| `GET`    | `/users/logout`     | —                                              | End the session                            |
| `GET`    | `/chat`             | —                                              | List conversations with their last message |
| `POST`   | `/chat/detail`      | `receiverUserId`                               | Full message timeline of one conversation  |
| `POST`   | `/chat/check-exist` | `receiverUserId`                               | Whether a conversation already exists      |
| `POST`   | `/chat/search`      | `searchtext`                                   | Filter conversations by contact name       |
| `POST`   | `/message/send`     | `receiverUserId`, `text`                       | Send a message                             |
| `DELETE` | `/message/delete`   | `receiverUserId`, `messageId`                  | Delete one of your own messages            |
| `GET`    | `/person/list`      | —                                              | List contacts                              |
| `POST`   | `/person/create`    | `email`                                        | Add a contact by email                     |
| `DELETE` | `/person/delete`    | `userId`                                       | Remove a contact                           |
| `GET`    | `/profile`          | —                                              | Read the signed-in profile                 |
| `PUT`    | `/profile/update`   | `name`, `email`, optional `image`              | Update the profile                         |

## Socket events

The client opens a single connection on a page that has a session. Both events
carry `receiverUserId`; the server fills in `senderUserId` from the session, so
a client cannot send on behalf of somebody else.

| Event                 | Direction       | Payload                                                                                       |
| --------------------- | --------------- | --------------------------------------------------------------------------------------------- |
| `add chat message`    | client ⇄ server | `receiverUserId`, `messageId`, `messageDate`, `text`, `receiverUserName`, `receiverUserImage` |
| `delete chat message` | client ⇄ server | `receiverUserId`, `messageId`                                                                 |

## Project structure

```
app.js              Express application (exported, does not listen)
server.js           Entry point: HTTP server, Socket.IO, shutdown
config/
  env.js            Environment variables and production checks
  database.js       Mongoose connection helpers
  socket.js         Socket.IO server, authentication and rooms
controllers/        Request handlers
middlewares/        Authentication guards
models/             Mongoose schemas
routes/             Route definitions
utils/query.js      Input sanitising helpers for database queries
views/              EJS templates
public/             Static assets and the browser client
tests/              Jest and Supertest suites
```

## Testing

The suite runs against an in-memory MongoDB, so no database needs to be running:

```bash
npm test
```

It covers registration and login, the authentication guards on every JSON
endpoint, contact management, message ownership on delete, the query sanitising
helpers, and socket delivery: a message reaches the recipient, never a third
user, and a forged sender in the payload is replaced by the one from the
session.

## Security notes

- Passwords are hashed with bcrypt and never leave the server.
- Session cookies are `httpOnly`, `sameSite=lax`, and `secure` in production.
- Login and registration are rate limited.
- Request bodies are coerced to plain strings and object ids before they reach
  a query, so a JSON payload cannot smuggle a Mongo operator into a filter.
- Search input is escaped before it is used in a `$regex` filter.
- Messages can only be deleted by their author.

Messages are stored in plain text; the project does not implement end-to-end
encryption. To report a vulnerability, see [SECURITY.md](SECURITY.md).

## Roadmap

- Group conversations
- Read receipts and typing indicators
- Message pagination for long conversations
- Optional attachment support

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the
development setup and the pull request checklist, and
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for the standards expected in the
project's spaces.

## License

Released under the [MIT License](LICENSE).
