# Running the Portfolio Locally

## Why Use a Local Server?

When opening HTML files directly from the file system (file:// protocol), browsers block certain features for security:
- Audio playback may be limited
- CORS restrictions prevent some features
- Some APIs don't work with file://

## Quick Start - Local Server Options

### Option 1: Python (Recommended)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then open: http://localhost:8000

### Option 2: Node.js
```bash
npx http-server
```
Then open: http://localhost:8080

### Option 3: PHP
```bash
php -S localhost:8000
```
Then open: http://localhost:8000

### Option 4: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Current Issues Fixed

✅ CORS errors - Now handles file:// protocol gracefully
✅ Missing photo - Added fallback SVG placeholder
✅ Audio loading - Improved error handling and file:// support

## Note

The audio visualizer works best when served via http:// or https://. Some features may be limited when opening directly from file://.

