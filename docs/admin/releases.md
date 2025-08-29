# Release Management System

This system automates the complete release process from branch creation to publication, with manual control points for quality assurance.

## Release Process Overview

### 🚀 **Complete Release Workflow**

```bash
# 1. Create release branch
git checkout -b release-1.21.3
git push origin release-1.21.3

# 2. System automatically:
#    - Validates version
#    - Updates package.json & manifest
#    - Creates PR "Prepare for v1.21.3 release"
#    - Creates draft release with ZIP

# 3. Review and merge the PR
#    - System updates draft release with version-bumped ZIP

# 4. Edit the draft release:
#    - Add scheduled release date
#    - Review release notes
#    - Publish when ready

# 5. Publishing creates tag and finalizes changelog
```

## Detailed Steps

### 1. Create Release Branch

```bash
git checkout -b release-1.21.3
git push origin release-1.21.3
```

**Triggers**: `release-management.yml`

- ✅ Validates version format (must be x.y.z)
- ✅ Validates version is greater than latest release
- ✅ Updates `package.json` and `manifest` files (not Makefile)
- ✅ JellyRock-bot creates PR "Prepare for v1.21.3 release"
- ✅ Creates draft GitHub release with initial ZIP

### 2. Merge Release PR

When you merge the PR to main:

**Triggers**: `update-draft-release.yml`

- ✅ Builds new ZIP with version-bumped files
- ✅ Updates the draft release with new ZIP
- ✅ Release is ready for your manual editing

### 3. Manually Publish Release

When you publish the draft release:

**Triggers**: `release-build.yml` (finalize-release)

- ✅ Creates git tag pointing to merge commit on main
- ✅ Converts `[Unreleased]` to versioned release in changelog
- ✅ Release process is complete

## Workflows

### `release-management.yml`

**Branch creation workflow** - Triggered by `release-*.*.*` branches:

- Validates semantic version format and increment
- Updates package.json and manifest files with new version
- JellyRock-bot creates release preparation PR
- Creates initial draft release with production ZIP
- Handles version validation errors gracefully

### `update-draft-release.yml`

**PR merge workflow** - Triggered when release PR is merged to main:

- Detects merged release PR by label `release-prep`
- Builds updated ZIP with version-bumped files
- Updates existing draft release with new ZIP
- Prepares release for manual publication

### `release-build.yml` (finalize-release)

**Tag creation workflow** - Triggered when draft release is published:

- Extracts version from created git tag
- Finalizes changelog by converting unreleased to release
- Commits changelog updates back to main branch
- Provides release completion summary

## Manual Control Points

### ✅ **You Control:**

- **When** to create release branch
- **When** to merge the PR (after review)
- **When** to publish the release
- **Release notes** and scheduled date editing
- **Quality assurance** at each step

### 🤖 **Automated:**

- Version validation and file updates
- ZIP building with proper versions
- Changelog synchronization
- Git tag creation and placement

## Error Handling

The system will **fail with clear errors** if:

### Version Validation

- Invalid version format (must be x.y.z)
- Version not greater than current release
- Non-numeric version components

### File Operations

- Git operation failures
- Build process errors
- ZIP creation issues

### Release State

- Draft release conflicts
- Missing release preparations
- Changelog format issues

## File Updates

### Automatically Updated

- **`package.json`** - version field updated to match release
- **`manifest`** - major_version, minor_version, build_version updated

### Manually Managed

- **`Makefile`** - version stays at 1.0.0 until manually changed
- **Release notes** - scheduled dates added manually
- **`CHANGELOG.md`** - automatically synced but can be manually edited

## Key Benefits

### ✅ **Manual Control**

- You decide timing of each release step
- Quality gates at PR merge and release publication
- Manual release note editing capability

### ✅ **Early Preparation**

- Draft release ready before Roku submission
- ZIP available for testing before publication
- Time to add scheduled release dates

### ✅ **Version Safety**

- Prevents invalid version releases
- Validates version increments
- Ensures proper file updates

### ✅ **Always Current**

- ZIP always reflects latest version bump
- Changelog stays synchronized
- Git tags point to correct commits

### ✅ **Simple Process**

- Just create branch and merge PR
- Clear error messages when issues occur
- Minimal manual intervention required

## Advanced Usage

### Testing Releases

After creating release branch, you can:

- Review the generated ZIP in draft release
- Test the version-bumped build
- Make adjustments in PR if needed

### Release Notes

The draft release includes:

- Automatic changelog extraction
- Template for scheduled release date

### Rollback Options

If issues are found:

- Delete draft release to start over
- Update PR with fixes before merging
- Edit draft release notes before publishing
