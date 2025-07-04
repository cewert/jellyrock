# JellyRock

<!-- [![Current Release](https://img.shields.io/github/release/cewert/jellyrock.svg?logo=github "Current Release")](https://github.com/cewert/jellyrock/releases) -->
[![Build Status](https://img.shields.io/github/actions/workflow/status/cewert/jellyrock/build-prod.yml?logo=github&branch=main "Build Status")](https://github.com/cewert/jellyrock/actions/workflows/build-prod.yml)
[![Code Documentation](https://img.shields.io/badge/Code%20Documentation-purple)](https://cewert.github.io/jellyrock/)
[![License](https://img.shields.io/github/license/cewert/jellyrock.svg "GPL 2.0 License")](LICENSE)
<!-- [![Translation Status](https://translate.jellyfin.org/widgets/jellyfin/-/jellyfin-roku/svg-badge.svg "Translation Status")](https://translate.jellyfin.org/projects/jellyfin/jellyfin-roku/?utm_source=widget) -->

JellyRock is a Jellyfin client for Roku devices.

## Install / Sideload

1. Put your Roku device in [developer mode](https://blog.roku.com/developer/2016/02/04/developer-setup-guide). Write down your Roku device IP and the password you created - you will need these!
2. Download the [latest build](https://github.com/cewert/jellyrock/actions/workflows/build-prod.yml) created by GitHub Actions. Select the first item listed then click the link at the bottom of the page i.e. `JellyRock-v1.0.0-d3352495c579f6adeca085cdbc137ac36e70d558`. This will download a zip file to your computer.
3. Put your Roku's IP from step 1 into a browser i.e. `http://192.168.1.2` and press enter.
4. Log in with credentials from step 1.
5. Upload and install the zip file downloaded in step 2.

> NOTE: The app will always be at the bottom of your Roku's channel list and it will *not* automatically update.

## Advanced

For more advanced deployment methods, access to crash logs, or to learn how to setup a developer environment so you can write some code yourself please read the [DEVGUIDE](docs/DEVGUIDE.md).
