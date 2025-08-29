# Automatic Changelog System

This system keeps the `CHANGELOG.md` file automatically synchronized with git commits and releases.

## How It Works

### 🔄 **Push to Main Branch**

- **Trigger**: Any push to `main` branch
- **Action**: Updates the `[Unreleased]` section with new commits
- **Result**: Changelog always reflects current unreleased changes

### 🚀 **Release Finalization**

- **Trigger**: When a git tag is created (via release publication)
- **Action**: Converts `[Unreleased]` section to versioned release
- **Result**: Release is documented in changelog with proper format

## Workflow

### `changelog-sync.yml`

**Unreleased updates** - Triggered by pushes to main:

- Monitors all commits pushed to main branch
- Categorizes commits into Added/Changed/Fixed sections
- Updates the `[Unreleased]` section automatically
- Does NOT handle releases (handled by release system)

### Release Integration

**Finalization** - Triggered by tag creation during release:

- Converts `[Unreleased]` to versioned release section
- Preserves all commit categorization
- Maintains Keep-a-Changelog format
- Commits changelog updates back to main

## Commands

```bash
# Check current changelog status
npm run changelog:status

# Manually sync unreleased changes (usually automatic)
npm run changelog:sync-unreleased

# Manually create release entry (usually automatic)
npm run changelog:sync-release 1.21.3

# Validate changelog consistency
npm run changelog:validate
```

## Commit Categorization

The system automatically categorizes commits into changelog sections:

### Added

- `feat:`, `add:`, `implement:`
- Commits containing "new", "create", "implement"

### Changed

- `change:`, `update:`, `improve:`, `refactor:`
- Commits containing "change", "update", "improve", "enhance"

### Fixed

- `fix:`, `resolve:`, `correct:`
- Commits containing "fix", "resolve", "repair", "correct"

### Removed

- `remove:`, `delete:`, `drop:`
- Commits containing "remove", "delete", "drop"

### Security

- Commits containing "security", "vulnerability", "CVE"

## Error Handling

The system will **fail with clear errors** if:

- Changelog format is invalid
- Version format is wrong (must be x.y.z)
- Git operations fail
- Inconsistencies are detected

## Manual Overrides

If you need to manually adjust the changelog:

1. Edit `CHANGELOG.md` directly
2. The system will preserve your changes
3. Run `npm run changelog:validate` to check format
4. Automatic sync will continue from your changes

## Key Benefits

✅ **Always Current** - Unreleased section stays up to date  
✅ **Zero Maintenance** - No manual changelog editing needed  
✅ **Consistent Format** - Follows Keep-a-Changelog standard  
✅ **Smart Categorization** - Commits automatically sorted  
✅ **Validation** - Catches format issues early
