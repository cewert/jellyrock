# Unit Tests

**Purpose:** Test individual functions, classes, and components in complete isolation.

**Characteristics:**

- No I/O operations (network, registry, file system)
- All dependencies mocked or stubbed
- Fast execution (< 1 second per test)
- Run on every commit

**Tag:** `@tags("unit")`

**Build:** `npm run build:tests-unit`

**Examples:**

- Testing data transformers
- Testing utility functions
- Testing component initialization
- Testing business logic
