# Contributing to ChatApp

Thanks for taking the time to contribute. This document explains how to get the
project running locally and what is expected from a pull request.

## Getting started

```bash
git clone https://github.com/hasan-bekir-dogan/ChatApp.git
cd ChatApp
npm install
cp .env.example .env
npm run dev
```

You need Node.js 18 or newer and a MongoDB instance. If you have Docker, the
repository ships a compose file that starts MongoDB for you:

```bash
docker compose up -d mongo
```

The test suite uses an in-memory MongoDB, so it does not need a running
database:

```bash
npm test
```

## Before opening a pull request

Run the same checks the CI pipeline runs:

```bash
npm run lint
npm run format:check
npm test
```

## Pull request guidelines

- Keep a pull request focused on one change. Several unrelated fixes are easier
  to review as several pull requests.
- Add or update tests for behaviour you change. Anything touching
  authentication, authorization or message ownership must come with a test.
- Describe _why_ the change is needed, not only what it does.
- Reference the issue the pull request closes, if there is one.

## Commit messages

Write the subject line in the imperative mood and keep it under 72 characters.
Use the body to explain the reasoning when the change is not obvious.

```
require authentication on all json endpoints

The chat, message, person and profile routers relied on req.session.userId
being present without ever checking it.
```

## Code style

Formatting is handled by Prettier and linting by ESLint; both are configured in
the repository. Run `npm run lint:fix` and `npm run format` before committing
rather than adjusting style by hand.

## Reporting bugs

Open an issue using the bug report template and include the Node.js version,
the MongoDB version and the steps to reproduce.

## Security issues

Please do not open a public issue for a security problem. See
[SECURITY.md](SECURITY.md) for how to report one.
