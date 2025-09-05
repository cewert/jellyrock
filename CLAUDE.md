# JellyRock
A Jellyfin client for Roku devices allowing users to consume media from their personal Jellyfin servers.
## Technologies used
- BrightScript - Roku's proprietary scripting language. `ExampleFile.brs`
- BrighterScript - A superset of BrightScript that compiles to standard BrightScript. `ExampleFile.bs`
- Roku Scene Graph (RSG) - XML-based programming framework. Uses a hierarchical node structure to manage UI elements and separates design (XML) from logic (BrighterScript). `ExampleFile.xml`
- Jellyfin Server REST API - All API calls to a Jellyfin server should use functions from the sdk.bs file. `source/api/sdk.bs`
## Expected Behavior and Workflow
1. Provide a brief overview of any changes made.
2. Provide a list of app behavior to test e.g. button clicks, focus on certain elements, screenshot a specific screen, etc. and what logging information will show up to prove they are working.
3. A human will test your code and provide you with the logging output.
## Folder Structure
- `components` - XML and .bs file pairs categorized by folders.
- `scripts` - JavaScript files used for NPM scripts.
- `settings/settings.json` - All the available app settings and their metadata. e.g. id, description, type, default state, etc
- `source` - .bs files containing main app logic and utilities.
- `CHANGELOG.md` - "Keep a Changelog" format, automatically updated by CI.
## BrighterScript Guide
- XML and .bs files in the same folder, with the same name, are automatically scoped together when compiled.
- ALWAYS use `import` statements instead of XML script tags(`<script type="text/brighterscript" uri="ExampleComponent.bs" />`)
- Use `isValid()` for conditional invalid comparisons. For components, ensure the file containing `isValid()` is imported as needed. i.e. `import "pkg:/source/utils/misc.bs"`
- ⚠️ **Minimize rendezvous with Task nodes (main thread)!** ⚠️
## Roku Scene Graph (RSG) Guide
Component system functions:
```brighterscript
sub init()
  ' Initialize component

  ' Save references to frequently accessed components
  m.nodeRef = m.top.findNode("ExampleComponent")
end sub

' Handle remote control input
function onKeyEvent(key as string, press as boolean) as boolean
  if not press then return false

  if key = "play"
    m.nodeRef.control = "play"
    return true ' Return true if we are done processing button input, false to let the event bubble up
  end if

  return false ' default return value is false
end function
```
## Task Nodes
⚠️ **Minimize rendezvous with render thread!** ⚠️
- Use field type `assocarray` to pass all input data to the task at once, when the input data is more than one string.
- Use node field types (`node` and `nodearray`) when passing large amounts of data.
- Cache references to render-thread nodes in local variables.
- ONLY use `setFields()` to update node data when we don't have a local copy of the node and we don't need to process the node before updating.
- ONLY use `getFields()` to access node data when you need a **static** snapshot of the data.
```brighterscript
function badExample()
    title = m.global.content.title        ' Rendezvous 1
    description = m.global.content.description  ' Rendezvous 2
    url = m.global.content.url            ' Rendezvous 3
end function

function goodExample()
    ' Single rendezvous to get all data at once
    localNode = m.global.content      ' ONE rendezvous
    
    ' Now work with local data - NO additional rendezvous
    newTitle = processTitle(localNode.title)
    localNode.title = newTitle
    newDescription = processDescription(localNode.description)
    localNode.description = newDescription
    newURL = processURL(localNode.url)
    localNode.url = newURL

    ' Can still call node methods
    childCount = localNode.getChildCount()

    ' Pass complete node tree to render thread in ONE operation
    m.top.result = localNode  ' Single rendezvous, ownership transfers
end function
```
## Style Guide
- ALWAYS use 2 spaces for indentation.
- No more than 1 blank line for visual spacing.
- `camelCase` variable names and function names.
- `PascalCase` file names and class names.
- Use comments to make the code easier to scan, understand, and maintain by a junior dev. e.g. function definitions, to explain complex code, to explain any roku specific oddities and best practices.
## Coding Standards
- Never hardcode color values - Use global theme colors from the `source/utils/globals.bs` file.
- Use themed UI components when possible. `/components/ui/`
- NEVER use an API or write to the file system on the render thread (don't block the render thread).
- Lint and validate all code changes before commiting `npm run lint:bs`
- Format all code changes before commiting `npm run format`
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
1. `source/Main.bs` → Entry point, initializes global state.
2. `source/ShowScenes.bs` → Creates and manages different screen types.
3. Scene navigation via `m.global.sceneManager.callFunc("pushScene", group)`.
### Global State
- `m.global` - App-wide state.
- `m.global.session` - Current session state.
- `m.global.session.server` - The active Jellyfin server state.
- `m.global.session.user` - The state of the authenticated user connected to the active server and using the app.
- `m.global.session.user.settings` - The active user's app setting config