<!-- markdownlint-disable -->

<h1 id="top">JellyRock App Settings</h1>

<!--
  THIS FILE IS AUTO-GENERATED. DO NOT EDIT BY HAND.
  Run: npm run docs:settings
-->

This page documents all configurable settings available in the JellyRock app.


- [Global](#global)
- [Playback](#playback)
- [User Interface](#user-interface)

## Global

<a id="global"></a>

Global settings that affect everyone that uses this Roku device.

- [Remember Me?](#globalRememberMe)

<h3 id="globalRememberMe">Remember Me?</h3>

<a href="#global">Global</a> › <a href="#globalRememberMe">Remember Me?</a>

Remember the currently logged in user and try to log them in again next time you start the JellyRock app.

| Property | Value |
| --- | --- |
| Setting Name | `globalRememberMe` |
| Type | `bool` |
| Default | `false` |

<p><a href="#top">⬆️ Back to top</a></p>

## Playback

<a id="playback"></a>

Settings relating to playback and supported codec and media types.

- [Bitrate Limit](#playback-bitrate-limit)
  - [Enable Limit](#playbackBitrateMaxLimited)
  - [Maximum Bitrate](#playbackBitrateLimit)
- [Cinema Mode](#playbackCinemaMode)
- [Custom Subtitles](#playbackSubsCustom)
- [Maximum Resolution](#playbackResolutionMax)
- [Next Episode Button Time](#playbackNextUpButtonSeconds)
- [Play Next Episode Automatically](#playbackPlayNextEpisode)
- [Preferred Audio Codec](#playbackPreferredAudioCodec)
- [Text Subtitles Only](#playbackSubsOnlyText)
- [Video Codec Support](#playback-video-codec-support)
  - [MPEG-2](#playbackMpeg2)
  - [MPEG-4](#playbackMpeg4)
- [Video Profile Level Support](#playback-video-profile-level-support)
  - [H.264](#playbackTryDirectH264ProfileLevel)
  - [HEVC](#playbackTryDirectHevcProfileLevel)

<h3 id="playbackCinemaMode">Cinema Mode</h3>

<a href="#playback">Playback</a> › <a href="#playbackCinemaMode">Cinema Mode</a>

Bring the theater experience straight to your living room with the ability to play custom intros before the main feature.

| Property | Value |
| --- | --- |
| Setting Name | `playbackCinemaMode` |
| Type | `bool` |
| Default | `false` |

<h3 id="playbackSubsCustom">Custom Subtitles</h3>

<a href="#playback">Playback</a> › <a href="#playbackSubsCustom">Custom Subtitles</a>

Use custom subtitle rendering for external VTT subtitle files. Enables fallback fonts from the server and removes some formatting tags from misformatted subtitles. Note: May not fully support all Roku caption preferences.

| Property | Value |
| --- | --- |
| Setting Name | `playbackSubsCustom` |
| Type | `bool` |
| Default | `true` |

<h3 id="playbackResolutionMax">Maximum Resolution</h3>

<a href="#playback">Playback</a> › <a href="#playbackResolutionMax">Maximum Resolution</a>

Configure the maximum resolution when transcoding video files to this device.

| Property | Value |
| --- | --- |
| Setting Name | `playbackResolutionMax` |
| Type | `radio` |
| Default | `auto` |
| Options | <table cellspacing="0" cellpadding="0"><thead><tr><th align="left">Name</th><th align="left">ID</th></tr></thead><tbody><tr><td>Off - Attempt to direct play all resolutions</td><td><code>off</code></td></tr><tr><td>Auto - Use TV resolution</td><td><code>auto</code></td></tr><tr><td>360p</td><td><code>360</code></td></tr><tr><td>480p</td><td><code>480</code></td></tr><tr><td>720p</td><td><code>720</code></td></tr><tr><td>1080p</td><td><code>1080</code></td></tr><tr><td>4k</td><td><code>2160</code></td></tr><tr><td>8k</td><td><code>4320</code></td></tr></tbody></table> |

<h3 id="playbackNextUpButtonSeconds">Next Episode Button Time</h3>

<a href="#playback">Playback</a> › <a href="#playbackNextUpButtonSeconds">Next Episode Button Time</a>

Set how many seconds before the end of an episode the Next Episode button should appear. Set to 0 to disable.

| Property | Value |
| --- | --- |
| Setting Name | `playbackNextUpButtonSeconds` |
| Type | `integer` |
| Default | `30` |

<h3 id="playbackPlayNextEpisode">Play Next Episode Automatically</h3>

<a href="#playback">Playback</a> › <a href="#playbackPlayNextEpisode">Play Next Episode Automatically</a>

When finished playing a single episode, play the next one automatically.

| Property | Value |
| --- | --- |
| Setting Name | `playbackPlayNextEpisode` |
| Type | `radio` |
| Default | `webclient` |
| Options | <table cellspacing="0" cellpadding="0"><thead><tr><th align="left">Name</th><th align="left">ID</th></tr></thead><tbody><tr><td>Use Web Client Setting</td><td><code>webclient</code></td></tr><tr><td>Enabled</td><td><code>enabled</code></td></tr><tr><td>Disabled</td><td><code>disabled</code></td></tr></tbody></table> |

<h3 id="playbackPreferredAudioCodec">Preferred Audio Codec</h3>

<a href="#playback">Playback</a> › <a href="#playbackPreferredAudioCodec">Preferred Audio Codec</a>

Use the selected audio codec for transcodes. If the device or stream does not support it, a fallback codec will be used.

| Property | Value |
| --- | --- |
| Setting Name | `playbackPreferredAudioCodec` |
| Type | `radio` |
| Default | `auto` |
| Options | <table cellspacing="0" cellpadding="0"><thead><tr><th align="left">Name</th><th align="left">ID</th></tr></thead><tbody><tr><td>Use system settings</td><td><code>auto</code></td></tr><tr><td>AAC</td><td><code>aac</code></td></tr><tr><td>DD (AC3)</td><td><code>ac3</code></td></tr><tr><td>DD+ (EAC3)</td><td><code>eac3</code></td></tr><tr><td>DTS</td><td><code>dts</code></td></tr></tbody></table> |

<h3 id="playbackSubsOnlyText">Text Subtitles Only</h3>

<a href="#playback">Playback</a> › <a href="#playbackSubsOnlyText">Text Subtitles Only</a>

Only display text subtitles to minimize transcoding.

| Property | Value |
| --- | --- |
| Setting Name | `playbackSubsOnlyText` |
| Type | `bool` |
| Default | `false` |

### Bitrate Limit

<a id="playback-bitrate-limit"></a>

Configure the maximum playback bitrate.

<h4 id="playbackBitrateMaxLimited">Enable Limit</h4>

<a href="#playback">Playback</a> › <a href="#playback-bitrate-limit">Bitrate Limit</a> › <a href="#playbackBitrateMaxLimited">Enable Limit</a>

Enable or disable the 'Maximum Bitrate' setting.

| Property | Value |
| --- | --- |
| Setting Name | `playbackBitrateMaxLimited` |
| Type | `bool` |
| Default | `false` |

<h4 id="playbackBitrateLimit">Maximum Bitrate</h4>

<a href="#playback">Playback</a> › <a href="#playback-bitrate-limit">Bitrate Limit</a> › <a href="#playbackBitrateLimit">Maximum Bitrate</a>

Set the maximum bitrate in Mbps. Set to 0 to use Roku's specifications. This setting must be enabled to take effect.

| Property | Value |
| --- | --- |
| Setting Name | `playbackBitrateLimit` |
| Type | `integer` |
| Default | `0` |

### Video Codec Support

<a id="playback-video-codec-support"></a>

Enable or disable Direct Play support for certain codecs.

<h4 id="playbackMpeg2">MPEG-2</h4>

<a href="#playback">Playback</a> › <a href="#playback-video-codec-support">Video Codec Support</a> › <a href="#playbackMpeg2">MPEG-2</a>

Support Direct Play of MPEG-2 content (e.g., Live TV). This will prevent transcoding of MPEG-2 content, but uses significantly more bandwidth.

| Property | Value |
| --- | --- |
| Setting Name | `playbackMpeg2` |
| Type | `bool` |
| Default | `false` |

<h4 id="playbackMpeg4">MPEG-4</h4>

<a href="#playback">Playback</a> › <a href="#playback-video-codec-support">Video Codec Support</a> › <a href="#playbackMpeg4">MPEG-4</a>

Support Direct Play of MPEG-4 content. This may need to be disabled for playback of DIVX encoded video files.

| Property | Value |
| --- | --- |
| Setting Name | `playbackMpeg4` |
| Type | `bool` |
| Default | `true` |

### Video Profile Level Support

<a id="playback-video-profile-level-support"></a>

Attempt Direct Play of potentially unsupported profile levels

<h4 id="playbackTryDirectH264ProfileLevel">H.264</h4>

<a href="#playback">Playback</a> › <a href="#playback-video-profile-level-support">Video Profile Level Support</a> › <a href="#playbackTryDirectH264ProfileLevel">H.264</a>

Attempt Direct Play for H.264 media with unsupported profile levels before falling back to transcoding if it fails.

| Property | Value |
| --- | --- |
| Setting Name | `playbackTryDirectH264ProfileLevel` |
| Type | `bool` |
| Default | `false` |

<h4 id="playbackTryDirectHevcProfileLevel">HEVC</h4>

<a href="#playback">Playback</a> › <a href="#playback-video-profile-level-support">Video Profile Level Support</a> › <a href="#playbackTryDirectHevcProfileLevel">HEVC</a>

Attempt Direct Play for HEVC media with unsupported profile levels before falling back to transcoding if it fails.

| Property | Value |
| --- | --- |
| Setting Name | `playbackTryDirectHevcProfileLevel` |
| Type | `bool` |
| Default | `false` |

<p><a href="#top">⬆️ Back to top</a></p>

## User Interface

<a id="user-interface"></a>

Settings relating to how the application looks.

- [General](#user-interface-general)
  - [Episode Images Next Up](#uiGeneralEpisodeImages)
  - [Fallback Fonts](#uiFontFallback)
  - [Hide Clock](#uiDesignHideClock)
  - [Max Days Next Up](#uiDetailsMaxDaysNextUp)
  - [Rewatching Next Up](#uiDetailsEnableRewatchingNextUp)
  - [Row Layout](#uiRowLayout)
  - [Use Splashscreen as Home Background](#uiHomeSplashBackground)
  - [Use Web Client's Home Section Arrangement](#uiHomeUseWebArrangement)
- [Libraries](#user-interface-libraries)
  - [General](#user-interface-libraries-general)
    - [Grid View Settings](#user-interface-libraries-general-grid-view-settings)
      - [Item Count](#itemGridShowItemCount)
      - [Item Titles](#itemGridTitles)
    - [Hide Taglines](#uiDetailsHideTagline)
    - [Return to Top](#itemGridReset)
  - [Movies](#user-interface-libraries-movies)
    - [Community and Critical Ratings](#uiMoviesShowRatings)
    - [Default View](#itemGridMovieDefaultView)
  - [TV Shows](#user-interface-libraries-tv-shows)
    - [Blur Unwatched Episodes](#uiTvShowsBlurUnwatched)
    - [Disable Community Rating for Episodes](#uiTvShowsDisableCommunityRating)
    - [Disable Unwatched Episode Count](#uiTvShowsDisableUnwatchedCount)
    - [Skip Details for Single Seasons](#uiTvShowsGoStraightToEpisodes)

### General

<a id="user-interface-general"></a>

Settings relating to the appearance of the Home screen and the program in general.

<h4 id="uiGeneralEpisodeImages">Episode Images Next Up</h4>

<a href="#user-interface">User Interface</a> › <a href="#user-interface-general">General</a> › <a href="#uiGeneralEpisodeImages">Episode Images Next Up</a>

What type of images to use for Episodes shown in the 'Next Up' and 'Continue Watching' sections.

| Property | Value |
| --- | --- |
| Setting Name | `uiGeneralEpisodeImages` |
| Type | `radio` |
| Default | `webclient` |
| Options | <table cellspacing="0" cellpadding="0"><thead><tr><th align="left">Name</th><th align="left">ID</th></tr></thead><tbody><tr><td>Use Web Client Setting</td><td><code>webclient</code></td></tr><tr><td>Use Episode Image</td><td><code>episode</code></td></tr><tr><td>Use Show Image</td><td><code>show</code></td></tr></tbody></table> |

<h4 id="uiFontFallback">Fallback Fonts</h4>

<a href="#user-interface">User Interface</a> › <a href="#user-interface-general">General</a> › <a href="#uiFontFallback">Fallback Fonts</a>

Replace Roku's system font with the fallback font provided by the Jellyfin server. Fallback fonts must be configured and enabled by the server admin for this to work. JellyRock will need to be restarted.

| Property | Value |
| --- | --- |
| Setting Name | `uiFontFallback` |
| Type | `bool` |
| Default | `false` |

<h4 id="uiDesignHideClock">Hide Clock</h4>

<a href="#user-interface">User Interface</a> › <a href="#user-interface-general">General</a> › <a href="#uiDesignHideClock">Hide Clock</a>

Hide all clocks in JellyRock. JellyRock will need to be closed and reopened for changes to take effect.

| Property | Value |
| --- | --- |
| Setting Name | `uiDesignHideClock` |
| Type | `bool` |
| Default | `false` |

<h4 id="uiDetailsMaxDaysNextUp">Max Days Next Up</h4>

<a href="#user-interface">User Interface</a> › <a href="#user-interface-general">General</a> › <a href="#uiDetailsMaxDaysNextUp">Max Days Next Up</a>

Set the maximum amount of days a show should stay in the 'Next Up' list without watching it.

| Property | Value |
| --- | --- |
| Setting Name | `uiDetailsMaxDaysNextUp` |
| Type | `integer` |
| Default | `0` |

<h4 id="uiDetailsEnableRewatchingNextUp">Rewatching Next Up</h4>

<a href="#user-interface">User Interface</a> › <a href="#user-interface-general">General</a> › <a href="#uiDetailsEnableRewatchingNextUp">Rewatching Next Up</a>

Show already watched episodes in 'Next Up' sections.

| Property | Value |
| --- | --- |
| Setting Name | `uiDetailsEnableRewatchingNextUp` |
| Type | `bool` |
| Default | `false` |

<h4 id="uiRowLayout">Row Layout</h4>

<a href="#user-interface">User Interface</a> › <a href="#user-interface-general">General</a> › <a href="#uiRowLayout">Row Layout</a>

Choose how rows are displayed throughout the app.

| Property | Value |
| --- | --- |
| Setting Name | `uiRowLayout` |
| Type | `radio` |
| Default | `fullwidth` |
| Options | <table cellspacing="0" cellpadding="0"><thead><tr><th align="left">Name</th><th align="left">ID</th></tr></thead><tbody><tr><td>Original</td><td><code>original</code></td></tr><tr><td>Full Width</td><td><code>fullwidth</code></td></tr></tbody></table> |

<h4 id="uiHomeSplashBackground">Use Splashscreen as Home Background</h4>

<a href="#user-interface">User Interface</a> › <a href="#user-interface-general">General</a> › <a href="#uiHomeSplashBackground">Use Splashscreen as Home Background</a>

Use generated splashscreen image as JellyRock's home background.

| Property | Value |
| --- | --- |
| Setting Name | `uiHomeSplashBackground` |
| Type | `bool` |
| Default | `false` |

<h4 id="uiHomeUseWebArrangement">Use Web Client's Home Section Arrangement</h4>

<a href="#user-interface">User Interface</a> › <a href="#user-interface-general">General</a> › <a href="#uiHomeUseWebArrangement">Use Web Client's Home Section Arrangement</a>

Make the arrangement of the Roku home view sections match the web client's home screen. JellyRock will need to be closed and reopened for change to take effect.

| Property | Value |
| --- | --- |
| Setting Name | `uiHomeUseWebArrangement` |
| Type | `bool` |
| Default | `true` |

### Libraries

<a id="user-interface-libraries"></a>

Settings relating to the appearance of Library pages.

#### General

<a id="user-interface-libraries-general"></a>

Settings relating to the appearance of pages in all Libraries.

<h5 id="uiDetailsHideTagline">Hide Taglines</h5>

<a href="#user-interface">User Interface</a> › <a href="#user-interface-libraries">Libraries</a> › <a href="#user-interface-libraries-general">General</a> › <a href="#uiDetailsHideTagline">Hide Taglines</a>

Hides tagline text on details pages.

| Property | Value |
| --- | --- |
| Setting Name | `uiDetailsHideTagline` |
| Type | `bool` |
| Default | `false` |

<h5 id="itemGridReset">Return to Top</h5>

<a href="#user-interface">User Interface</a> › <a href="#user-interface-libraries">Libraries</a> › <a href="#user-interface-libraries-general">General</a> › <a href="#itemGridReset">Return to Top</a>

Use the replay button to slowly animate to the first item in the folder. (If disabled, the folder will reset to the first item immediately).

| Property | Value |
| --- | --- |
| Setting Name | `itemGridReset` |
| Type | `bool` |
| Default | `true` |

##### Grid View Settings

<a id="user-interface-libraries-general-grid-view-settings"></a>

Settings that apply when Grid views are enabled.

<h6 id="itemGridShowItemCount">Item Count</h6>

<a href="#user-interface">User Interface</a> › <a href="#user-interface-libraries">Libraries</a> › <a href="#user-interface-libraries-general">General</a> › <a href="#user-interface-libraries-general-grid-view-settings">Grid View Settings</a> › <a href="#itemGridShowItemCount">Item Count</a>

Show item count in the library and index of selected item.

| Property | Value |
| --- | --- |
| Setting Name | `itemGridShowItemCount` |
| Type | `bool` |
| Default | `false` |

<h6 id="itemGridTitles">Item Titles</h6>

<a href="#user-interface">User Interface</a> › <a href="#user-interface-libraries">Libraries</a> › <a href="#user-interface-libraries-general">General</a> › <a href="#user-interface-libraries-general-grid-view-settings">Grid View Settings</a> › <a href="#itemGridTitles">Item Titles</a>

Select when to show titles.

| Property | Value |
| --- | --- |
| Setting Name | `itemGridTitles` |
| Type | `radio` |
| Default | `showalways` |
| Options | <table cellspacing="0" cellpadding="0"><thead><tr><th align="left">Name</th><th align="left">ID</th></tr></thead><tbody><tr><td>Show On Hover</td><td><code>showonhover</code></td></tr><tr><td>Always Show</td><td><code>showalways</code></td></tr><tr><td>Always Hide</td><td><code>hidealways</code></td></tr></tbody></table> |

#### Movies

<a id="user-interface-libraries-movies"></a>

Settings relating to the appearance of pages in Movie Libraries.

<h5 id="uiMoviesShowRatings">Community and Critical Ratings</h5>

<a href="#user-interface">User Interface</a> › <a href="#user-interface-libraries">Libraries</a> › <a href="#user-interface-libraries-movies">Movies</a> › <a href="#uiMoviesShowRatings">Community and Critical Ratings</a>

Ratings for how good a movie is.

| Property | Value |
| --- | --- |
| Setting Name | `uiMoviesShowRatings` |
| Type | `bool` |
| Default | `true` |

<h5 id="itemGridMovieDefaultView">Default View</h5>

<a href="#user-interface">User Interface</a> › <a href="#user-interface-libraries">Libraries</a> › <a href="#user-interface-libraries-movies">Movies</a> › <a href="#itemGridMovieDefaultView">Default View</a>

Default view for Movie Libraries.

| Property | Value |
| --- | --- |
| Setting Name | `itemGridMovieDefaultView` |
| Type | `radio` |
| Default | `moviesgrid` |
| Options | <table cellspacing="0" cellpadding="0"><thead><tr><th align="left">Name</th><th align="left">ID</th></tr></thead><tbody><tr><td>Movies (Presentation)</td><td><code>Movies</code></td></tr><tr><td>Movies (Grid)</td><td><code>MoviesGrid</code></td></tr></tbody></table> |

#### TV Shows

<a id="user-interface-libraries-tv-shows"></a>

Settings relating to the appearance of pages in TV Libraries.

<h5 id="uiTvShowsBlurUnwatched">Blur Unwatched Episodes</h5>

<a href="#user-interface">User Interface</a> › <a href="#user-interface-libraries">Libraries</a> › <a href="#user-interface-libraries-tv-shows">TV Shows</a> › <a href="#uiTvShowsBlurUnwatched">Blur Unwatched Episodes</a>

Blur images of unwatched episodes.

| Property | Value |
| --- | --- |
| Setting Name | `uiTvShowsBlurUnwatched` |
| Type | `bool` |
| Default | `false` |

<h5 id="uiTvShowsDisableCommunityRating">Disable Community Rating for Episodes</h5>

<a href="#user-interface">User Interface</a> › <a href="#user-interface-libraries">Libraries</a> › <a href="#user-interface-libraries-tv-shows">TV Shows</a> › <a href="#uiTvShowsDisableCommunityRating">Disable Community Rating for Episodes</a>

Hide the star and community rating for episodes of a TV show. This is to prevent spoilers of an upcoming good/bad episode.

| Property | Value |
| --- | --- |
| Setting Name | `uiTvShowsDisableCommunityRating` |
| Type | `bool` |
| Default | `false` |

<h5 id="uiTvShowsDisableUnwatchedCount">Disable Unwatched Episode Count</h5>

<a href="#user-interface">User Interface</a> › <a href="#user-interface-libraries">Libraries</a> › <a href="#user-interface-libraries-tv-shows">TV Shows</a> › <a href="#uiTvShowsDisableUnwatchedCount">Disable Unwatched Episode Count</a>

If enabled, the number of unwatched episodes in a series/season will be removed.

| Property | Value |
| --- | --- |
| Setting Name | `uiTvShowsDisableUnwatchedCount` |
| Type | `bool` |
| Default | `false` |

<h5 id="uiTvShowsGoStraightToEpisodes">Skip Details for Single Seasons</h5>

<a href="#user-interface">User Interface</a> › <a href="#user-interface-libraries">Libraries</a> › <a href="#user-interface-libraries-tv-shows">TV Shows</a> › <a href="#uiTvShowsGoStraightToEpisodes">Skip Details for Single Seasons</a>

If enabled, selecting a TV series with only one season will go straight to the episode list rather than the show details and season list.

| Property | Value |
| --- | --- |
| Setting Name | `uiTvShowsGoStraightToEpisodes` |
| Type | `bool` |
| Default | `false` |

<p><a href="#top">⬆️ Back to top</a></p>

