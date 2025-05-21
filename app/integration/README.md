# Integration Testing

This directory contains integration tests for the evolver-ui application using Playwright.

## Testing Approach

The integration tests use a combination of technologies to ensure reliable and isolated testing:

1. **Playwright** for browser automation
2. **MSW (Mock Service Worker)** for intercepting network requests
3. **@mswjs/data** for an in-memory mock database

## Test Data Setup

The tests use a mock database setup that is:

- Isolated: Tests don't affect the real SQLite database
- Consistent: Pre-seeded with test data in each run
- In-memory: No data persistence between test runs

### Mock Database Configuration

- The mock database is defined in `app/mocks/db.ts`
- It's pre-seeded with a test device at `http://127.0.0.1:8080`
- All Prisma client operations are mocked in `app/mocks/prisma.ts`

### Network Request Mocking

- All API requests to the Evolver device are intercepted by MSW
- The handlers are defined in `app/mocks/evolver.ts`
- MSW is automatically started in test mode via `app/entry.client.tsx`

## Running Tests

To run the integration tests:

```bash
npm run test:integ
```

To debug the integration tests playwright provides a `--debug` flag.

```bash
npm run test:integ -- --debug
```

## Test Organization

- `setup.test.ts` - Verifies the mock database is working correctly
- `devices.test.ts` - Tests for the devices list and device detail pages
- `_index.test.ts` - Tests for the root route

## Adding New Tests

When adding new tests, keep these points in mind:

1. The mock database is already pre-seeded with a test device
2. Any changes to the database during a test will not persist to other tests
3. Extend the MSW handlers in `app/mocks/evolver.ts` if you need to mock additional API endpoints
4. Extend the mock database schema in `app/mocks/db.ts` if you need additional data models
5. Extend the mock prisma client in `app/mocks/prisma.ts` if you need additional db client methods
