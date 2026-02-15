# Tyson Player

## Overview
A Samsung Tizen TV media player application that browses and plays media files from USB storage. Built with vanilla HTML, CSS, and JavaScript targeting the Tizen web platform.

## Project Architecture
- **Type**: Static HTML/CSS/JS web application (Tizen TV app)
- **Entry point**: `index.html`
- **Styles**: `css/style.css`
- **Logic**: `js/main.js`
- **Assets**: `images/` (SVG icons for player controls)
- **Tizen package**: `TysonPlayer.wgt` (pre-built widget), `config.xml` (Tizen config)

## Running
- Served via `npx serve -l 5000 -s .` on port 5000
- Note: Tizen-specific APIs (AVPlay, USB, Content API) are unavailable in browser; the app shows "Error scanning USB" which is expected outside a Tizen TV environment

## Key Features
- USB media browsing with folder navigation
- Video playback (MP4, MKV, MOV, AVI) with controls
- Image viewer with navigation
- Grid and list view modes
- Remote control navigation support
