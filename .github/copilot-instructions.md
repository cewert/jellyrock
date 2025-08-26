<!-- markdownlint-disable -->
# JellyRock

A Jellyfin client for Roku devices built with BrighterScript and the SceneGraph framework. This is NOT a typical web app - it's a Roku application with unique architectural patterns.

## Libraries and Frameworks

- [SceneGraph framework](https://developer.roku.com/docs/developer-program/core-concepts/core-concepts.md) for building the user interface.
- [BrighterScript](https://github.com/rokucommunity/brighterscript) for the application logic and interaction with the Roku platform.
- [Rooibos](https://github.com/rokucommunity/rooibos) for unit testing.
- [Jellyfin API](https://api.jellyfin.org/) for media server interaction.

## Core Architecture

### Scene Management System
The app uses a central `SceneManager` (`components/data/SceneManager.bs`) that manages all screen navigation:
- **Stack-based navigation**: `pushScene()`, `popScene()`, `clearScenes()`
- **Life cycle hooks**: `OnScreenShown()`, `OnScreenHidden()` called automatically
- **Focus management**: Preserves `lastFocus` when switching screens, use `setFocus(true)` and check `hasFocus()`
- All screens extend either `JRScreen` or `JRGroup` base classes

### Component Inheritance Pattern
```
JRScene (root scene)
├── JRScreen (full-screen views like Home, Settings)
└── JRGroup (sub-components and dialogs)
```

### Application Flow
1. `source/Main.bs` → Entry point, initializes global state
2. `source/ShowScenes.bs` → Creates and manages different screen types
3. Scene navigation via `m.global.sceneManager.callFunc("pushScene", group)`

## Development Workflow

### Testing Commands (AI Agent Priority)
- **Code validation**: `npm run lint:bs` (lint and validate code)
- **Unit tests**: `npm run build:tests` (builds ALL Rooibos tests - requires physical Roku device to be deployed and actually run the tests)

### Runtime Error Limitations
⚠️ **CRITICAL**: Linter and build validation catch syntax/import errors but NOT runtime crashes. Code can build successfully but crash instantly when run. AI agents cannot detect runtime errors automatically - they require:
- Deployment to actual Roku device 
- Manual testing and navigation
- Monitoring VSCode output tab for debug output and crash logs
- Human verification of app functionality

## Coding Patterns

### Component Structure
Every SceneGraph component needs:
```brighterscript
' ComponentName.xml - defines UI structure and interface
' ComponentName.bs - implements logic and event handlers

sub init()
  ' Initialize component
end sub

function onKeyEvent(key as string, press as boolean) as boolean
  ' Handle remote control input
  if not press then return false
  ' Return true if handled, false to bubble up
end function
```

### API Integration
- **All Jellyfin API functions** are in `source/api/sdk.bs` - use these for server communication
- **CRITICAL**: All API calls SHOULD use Task components to avoid blocking the render thread
- **Data passing**: Avoid using `array` and `assocarray` field types when passing data back from tasks
- URL building via `buildURL()` in `source/api/baserequest.bs`

### Global State
- `m.global` contains app-wide state (session, constants, managers)
- Theme colors in `m.global.constants.colors` (see `source/utils/globals.bs`)
- Import utilities with `import "pkg:/source/utils/misc.bs"`

## Coding Standards

- Use the default values for [bslint](https://github.com/rokucommunity/bslint), except for any settings saved in the `bslint.json` file. All code must pass the linter before it can be merged into the main branch.
- Use `Rooibos` for unit tests. You won't be able to test these but make sure they pass linters and are ready to be manually tested.
- Use `isValid()` for conditional invalid comparisons. For components, ensure the file containing `isValid()` is imported as needed. i.e. `import "pkg:/source/utils/misc.bs"`

## UI Guidelines

- Never hardcode color values - Use global theme colors from the `source/utils/globals.bs` file.
- Use themed UI components when possible. `/components/ui/`
