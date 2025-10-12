# Integration Tests

**Purpose:** Test component interactions and integration with Roku platform APIs.

**Characteristics:**

- May perform real I/O (registry writes, network calls to demo servers)
- Tests multiple components working together
- Slower execution than unit tests
- Requires cleanup after execution (handled by BaseTestSuite)

**Tag:** `@tags("integration")`

**Build:** `npm run build:tests-integration`

**Examples:**

- Testing `user.Login()` with real registry writes
- Testing server connection to demo.jellyfin.org
- Testing full authentication flow
- Testing session management with persistent storage

**Cleanup:**

- Registry sections with "test-user-" prefix are automatically cleaned up
- BaseTestSuite.afterEach() handles cleanup
