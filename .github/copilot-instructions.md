# Project Overview

This project is a roku client application that connects to Jellyfin media servers using the Jellyfin API. Users can navigate and consume their Jellyfin media (only videos, movies, tv shows, music, live tv, tv show recordings, and pictures are supported). It is built using [brighterscript](https://github.com/rokucommunity/brighterscript)

## Folder Structure

- `/components`: Contains scenegraph xml components and the .bs files that define the logic for each component.
- `/docs`: Contains documentation for the project.
- `/docs/api`: Contains documentation for the app's code base. Auto generated.
- `/images`: Contains images used in the application, such as icons and backgrounds as well as the development version of the branding images used in the app store.
- `/locale`: Contains localization files used for translating the application into different languages.
- `/resources`: Contains statice resources used by the application but are not automatically packaged with the app.
- `/resources/branding`: Contains branding images. The SVG files are used to generate image files for the app store.
- `/resources/branding/release`: Contains the branding images used in the app store for the release version of the application.
- `/scripts`: Contains javascript code used by some NPM scripts.
- `/settings`: Contains user settings and preferences for the application saved in JSON format. The data from this file is imported by the app to see available settings and apply defaults.
- `/source`: Contains all other brighterscript source code. Components must import these files to use them.
- `/unit-tests`: Contains roku [rooibos](https://github.com/rokucommunity/rooibos) unit tests for the application. These tests are used to ensure the code works as expected and to catch any regressions.

## Libraries and Frameworks

- [SceneGraph framework](https://developer.roku.com/docs/developer-program/core-concepts/core-concepts.md) for building the user interface.
- [Brighterscript](https://github.com/rokucommunity/brighterscript) for the application logic and interaction with the Roku platform.
- [Rooibos](https://github.com/rokucommunity/rooibos) for unit testing.
- [Jellyfin API](https://api.jellyfin.org/) for media server interaction.

## Coding Standards

- Use `brighterscript` for application logic and interaction with the Roku platform.
- We use the default values for [bslint](https://github.com/rokucommunity/bslint), except for any settings saved in the `bslint.json` file. All code must pass the linter before it can be merged into the main branch.
- Use `rooibos` for unit tests.
- Use 2 spaces for indentation.
- Use camelCase for variable and function names.
- Use PascalCase for class and component names.

## UI guidelines

- All theme colors are defined in the `sourcel/utils/globals.bs` file.
- Use themed labels for text elements. `/components/ui/label/colors`
- Use the primary color for active focus elements.
- Use the secondary color to highlight elements that can't be focused.