# Auth Routes Tests

This directory contains comprehensive tests for the authentication routes in the application.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only auth tests
npm test -- auth.test.js
```

## Test Coverage

### GET /
- ✓ Renders the landing page for unauthenticated users
- ✓ Redirects authenticated users to index

### GET /todo/new
- ✓ Renders the login for unauthenticated users
- ✓ Renders the new todo form for authenticated users

### POST /todo/create
- ✓ Persists new todo in the DB if the use is logged in
- ✓ Does not persist the new todo in the DB when the user is not logged in

### GET /login
- ✓ Renders login page for unauthenticated users
- ✓ Redirects authenticated users to landing page

### POST /login/password
- ✓ Logs in with correct credentials
- ✓ Fails with incorrect password
- ✓ Fails with non-existent username
- ✓ Fails with missing credentials

### GET /signup
- ✓ Renders signup page for unauthenticated users
- ✓ Redirects authenticated users to landing page

### POST /signup
- ✓ Creates new user with valid data
- ✓ Fails when passwords don't match
- ✓ Fails with duplicate username
- ✓ Fails with missing fields

### POST /logout
- ✓ Logs out authenticated user
- ✓ Handles logout for unauthenticated user

### Integration Tests
- ✓ Complete signup → logout → login cycle

## Notes

- Tests use a real SQLite database
- Each test run creates unique usernames to avoid conflicts
- Test users are cleaned up in `afterAll` hooks
- Session cookies are tested for proper authentication flow
