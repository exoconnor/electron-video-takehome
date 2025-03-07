import React, { useState, useRef, useEffect } from 'react'
import { useCamera } from './hooks/useCamera'
import { AppMode, InputMode } from './types'
import styles from './App.module.css'

import ModeSelector from './Controls/ModeSelector'
import CameraControls from './Controls/CameraControls'
import PlaybackControls from './Controls/PlaybackControls'
import FileControls from './Controls/FileControls'

const App: React.FC = () => {
  // Main video element reference
  const videoRef = useRef<HTMLVideoElement>(null)

  // App state
  const [inputMode, setInputMode] = useState<InputMode>([AppMode.Camera, null])
  const [mode, input] = inputMode

  // Determine camera access
  const { stream, error: cameraError } = useCamera({
    width: 640,
    height: 480,
  })

  // If/once camera stream becomes available connect it
  useEffect(() => {
    if (stream) {
      if (mode === AppMode.Camera && input === null) {
        // Initialize camera mode with stream
        setInputMode([AppMode.Camera, stream])
      }
      //  else if (mode === AppMode.Error && cameraError === null) {
      //   // Recover from error state if stream becomes available
      //   setInputMode([AppMode.Camera, stream])
      // }
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
    } else if (videoRef.current.src) {
      URL.revokeObjectURL(videoRef.current.src)
      videoRef.current.src = ''
    }

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

  // Handle mode changes
  const handleModeChange = (newMode: AppMode) => {
    if (newMode === mode) return

    // Clean up URLs when changing modes
    if ((mode === AppMode.RecordingPlayback || mode === AppMode.FilePlayback) && input?.url) {
      URL.revokeObjectURL(input.url)
    }

    switch (newMode) {
      case AppMode.Camera:
        setInputMode([AppMode.Camera, stream])
        break
      case AppMode.FilePlayback:
        setInputMode([AppMode.FilePlayback, null])
        break
      // RecordingPlayback mode is only entered after recording
    }
  }

  const handleSaveRecording = async () => {
    if (mode !== AppMode.RecordingPlayback || !input) return

    try {
      const buffer = await input.blob.arrayBuffer()
      const array = new Uint8Array(buffer)
      const fileName = `recording_${new Date().toISOString().replace(/:/g, '-')}.webm`

      const result = await window.electronAPI.saveVideo(fileName, array)

      if (result.success) {
        alert(`Video saved successfully to: ${result.filePath}`)
        handleModeChange(AppMode.Camera)
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

        {/* {cameraError && mode === 'camera' && (
          <div className={styles.errorOverlay}>
            <p>Camera Error: {cameraError.message}</p>
          </div>
        )} */}
      </div>

      <div className={styles.controlsContainer}>
        <ModeSelector currentMode={mode} onModeChange={handleModeChange} />
        <div>
          {mode === 'camera' && (
            <CameraControls stream={stream} onRecordingComplete={handleRecordingComplete} />
          )}

          {mode === 'recording-playback' && (
            <PlaybackControls onSave={handleSaveRecording} onCancel={() => handleModeChange(AppMode.Camera)} />
          )}

          {mode === 'file-playback' && (
            <FileControls
              onFileSelected={handleFileSelected}
              currentFile={input}
              onExit={() => handleModeChange(AppMode.Camera)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
