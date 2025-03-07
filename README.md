# Electron Video Recorder

A single-page Electron application that allows users to record videos from their webcam, save
recordings to disk, and play them back with seeking capabilities.

## Features

- [x] **Video Recording**: Record video from your webcam and save it to disk in a common video
      format
- [x] **Video Playback**: Play back recorded videos with standard controls (play, pause, stop, seek)
- [ish] **User-Friendly Interface**: Clean, intuitive design with logical layout and controls

## Extra Features

- [ ] Different video resolution handling
- [ ] Error handling for webcam unavailability or permission denial

## Requirements

- [Node.js](https://nodejs.org/) (v16 or newer)
- npm (included with Node.js)

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/yourusername/electron-video-recorder.git
   cd electron-video-recorder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

Start the application in development mode:

```bash
npm start
```

This will launch the Electron application with hot reloading for the renderer process.

## Building

### Package the Application

Create a directory with your application and dependencies:

```bash
npm run package
```

### Create Distributables

Build the application for your current platform:

```bash
npm run make
```

The output will be in the `out` directory.

```

## Technologies

- [Electron](https://www.electronjs.org/) - Cross-platform desktop application framework
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Vite](https://vitejs.dev/) - Frontend build tool
- [Electron Forge](https://www.electronforge.io/) - Complete tool for creating, publishing, and
  installing Electron applications

## License

MIT
```
