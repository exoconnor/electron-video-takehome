import React, { useState, useRef, useEffect } from 'react'
import { accessCamera } from './Record/accessCamera'
import { createRecording } from './Record/createRecording'
import styles from './App.module.css'

/**
 * The app can be one of four main modes at all times.
 *
 * Camera - ready to record
 * RecordingPlayback - preview a recording before saving
 * FilePlayback - play a video from file
 * Error - No video source
 *
 *
 * Any mode can transition to Camera or FilePlayback, RecordingPlayback
 * is only transitioned to from Camera mode upon completion of a recording
 */
enum AppMode {
  Camera = 'camera',
  RecordingPlayback = 'recording-playback',
  FilePlayback = 'file-playback',
  Error = 'error',
}

type RecordedVideo = { blob: Blob; url: string }
type VideoFile = { name: string; url: string }
type DisplayInput = MediaStream | RecordedVideo | VideoFile | null

type InputMode =
  | [AppMode.Error, any]
  | [AppMode, null]
  | [AppMode.Camera, MediaStream]
  | [AppMode.RecordingPlayback, RecordedVideo]
  | [AppMode.FilePlayback, VideoFile]

// Controls components will be imported here
import CameraControls from './Controls/CameraControls'
import PlaybackControls from './Controls/PlaybackControls'
import FileControls from './Controls/FileControls'

/**
 * 3 buttons and a viewport
 * Start with camera mount
 */
const App: React.FC = () => {
  // Main video element reference
  const videoRef = useRef<HTMLVideoElement>(null)

  // App state
  const [inputMode, setInputMode] = useState<InputMode>([AppMode.Camera, null])
  const [mode, input] = inputMode

  // Determine camera access
  const { stream, error: cameraError } = accessCamera({
    width: 640,
    height: 480,
  })

  // If/once camera stream becomes available connect it
  useEffect(() => {
    if (stream) {
      if (mode === AppMode.Camera && input === null) {
        // Initialize camera mode with stream
        setInputMode([AppMode.Camera, stream])
      } else if (mode === AppMode.Error && cameraError === null) {
        // Recover from error state if stream becomes available
        setInputMode([AppMode.Camera, stream])
      }
    }
  }, [stream, mode, input])

  // Switch videoRef based on inputMode (the HDMI cable special)
  useEffect(() => {
    if (!videoRef.current) return

    // First, clean up any existing stream
    if (videoRef.current.srcObject instanceof MediaStream) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }

    // Clear the src attribute
    videoRef.current.src = ''

    // Set up the appropriate source based on mode
    switch (mode) {
      case 'camera':
        videoRef.current.srcObject = input
        break

      case 'recording-playback':
        videoRef.current.src = input?.url ?? ''
        break

      case 'file-playback':
        videoRef.current.src = input?.url ?? ''
        break
    }
  }, [inputMode])

  // Handle recording completion
  const handleRecordingComplete = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    setInputMode([AppMode.RecordingPlayback, { blob, url }])
  }

  // Handle file selection
  const handleFileSelected = (name: string, url: string) => {
    setInputMode([AppMode.FilePlayback, { name, url }])
  }

  // Return to camera mode (discard recording)
  const cameraMode = () => {
    if (input?.url) {
      URL.revokeObjectURL(input.url)
    }
    setInputMode([AppMode.Camera, stream])
  }

  // Save recording and go back to camera
  const handleSaveRecording = async () => {
    if (mode !== AppMode.RecordingPlayback || !input) return

    try {
      const buffer = await input.blob.arrayBuffer()
      const array = new Uint8Array(buffer)
      const fileName = `recording_${new Date().toISOString().replace(/:/g, '-')}.webm`

      const result = await (window as any).electronAPI.saveVideo(fileName, array)

      if (result.success) {
        alert(`Video saved successfully to: ${result.filePath}`)
        // Clean up and return to camera mode
        cameraMode()
      } else {
        alert(`Failed to save video: ${result.message || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Error saving video:', err)
      alert(`Error saving video: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Electron Video Recorder</h1>

        {/* Mode selection buttons */}
        <div className={styles.modeButtons}>
          <button
            className={`${styles.modeButton} ${mode === 'camera' ? styles.activeMode : ''}`}
            onClick={() => mode !== 'camera' && cameraMode()}
          >
            Camera
          </button>
          <button
            className={`${styles.modeButton} ${mode === 'file-playback' ? styles.activeMode : ''}`}
            onClick={() => mode !== 'file-playback' && setInputMode([AppMode.FilePlayback, null])}
          >
            File Playback
          </button>
        </div>
      </header>

      {/* Main video container - consistent across all modes */}
      <div className={styles.videoContainer}>
        <video
          ref={videoRef}
          className={styles.videoElement}
          autoPlay={mode === 'camera'}
          playsInline
          muted={mode === 'camera'} // Only mute in camera mode
          controls={mode !== 'camera'} // Show controls in playback modes
        />

        {cameraError && mode === 'camera' && (
          <div className={styles.errorOverlay}>
            <p>Camera Error: {cameraError.message}</p>
          </div>
        )}
      </div>

      {/* Dynamic controls based on current mode */}
      <div className={styles.controlsContainer}>
        {mode === 'camera' && (
          <CameraControls stream={stream} onRecordingComplete={handleRecordingComplete} />
        )}

        {mode === 'recording-playback' && (
          <PlaybackControls
            videoRef={videoRef}
            onSave={handleSaveRecording}
            onCancel={cameraMode}
          />
        )}

        {mode === 'file-playback' && (
          <FileControls
            videoRef={videoRef}
            onFileSelected={handleFileSelected}
            currentFile={input}
            onExit={cameraMode}
          />
        )}
      </div>
    </div>
  )
}

export default App
