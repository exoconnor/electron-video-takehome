import React, { useState, useRef, useEffect } from 'react';
import { accessCamera } from './Record/accessCamera';
import styles from './App.module.css';

// Define app modes
type AppMode = 'camera' | 'recording-playback' | 'file-playback';

// Controls components will be imported here
import CameraControls from './Controls/CameraControls';
import PlaybackControls from './Controls/PlaybackControls';
import FileControls from './Controls/FileControls';

const App: React.FC = () => {
  // Main video element reference
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // App state
  const [mode, setMode] = useState<AppMode>('camera');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<{blob: Blob, url: string} | null>(null);
  const [selectedFile, setSelectedFile] = useState<{name: string, url: string} | null>(null);
  
  // Camera access hook
  const { stream, error: cameraError } = accessCamera({
    width: 640,
    height: 480
  });

  // Handle camera toggling
  useEffect(() => {
    if (videoRef.current) {
      if (mode === 'camera' && cameraEnabled) {
        videoRef.current.srcObject = stream;
      } else if (mode === 'recording-playback' && recordedVideo) {
        // Stop camera stream when switching to playback
        if (videoRef.current.srcObject instanceof MediaStream) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
        }
        videoRef.current.srcObject = null;
        videoRef.current.src = recordedVideo.url;
      } else if (mode === 'file-playback' && selectedFile) {
        videoRef.current.srcObject = null;
        videoRef.current.src = selectedFile.url;
      } else if (!cameraEnabled && videoRef.current.srcObject) {
        // Clean up when camera is disabled
        if (videoRef.current.srcObject instanceof MediaStream) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
      }
    }
  }, [mode, cameraEnabled, stream, recordedVideo, selectedFile]);

  // Handle recording completion
  const handleRecordingComplete = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    setRecordedVideo({ blob, url });
    setMode('recording-playback');
  };

  // Handle file selection
  const handleFileSelected = (name: string, url: string) => {
    setSelectedFile({ name, url });
    setMode('file-playback');
  };

  // Return to camera mode (discard recording)
  const handleBackToCamera = () => {
    if (recordedVideo?.url) {
      URL.revokeObjectURL(recordedVideo.url);
      setRecordedVideo(null);
    }
    setMode('camera');
  };

  // Return to camera mode from file playback
  const handleExitFilePlayback = () => {
    if (selectedFile?.url) {
      URL.revokeObjectURL(selectedFile.url);
      setSelectedFile(null);
    }
    setMode('camera');
  };

  // Save recording and go back to camera
  const handleSaveRecording = async () => {
    if (!recordedVideo) return;
    
    try {
      const buffer = await recordedVideo.blob.arrayBuffer();
      const array = new Uint8Array(buffer);
      const fileName = `recording_${new Date().toISOString().replace(/:/g, '-')}.webm`;
      
      const result = await (window as any).electronAPI.saveVideo(fileName, array);
      
      if (result.success) {
        alert(`Video saved successfully to: ${result.filePath}`);
        // Clean up and return to camera mode
        URL.revokeObjectURL(recordedVideo.url);
        setRecordedVideo(null);
        setMode('camera');
      } else {
        alert(`Failed to save video: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error saving video:", err);
      alert(`Error saving video: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Electron Video Recorder</h1>
        
        {/* Mode selection buttons */}
        <div className={styles.modeButtons}>
          <button 
            className={`${styles.modeButton} ${mode === 'camera' ? styles.activeMode : ''}`}
            onClick={() => mode !== 'camera' && setMode('camera')}
          >
            Camera
          </button>
          <button 
            className={`${styles.modeButton} ${mode === 'file-playback' ? styles.activeMode : ''}`}
            onClick={() => mode !== 'file-playback' && setMode('file-playback')}
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
          <CameraControls 
            isEnabled={cameraEnabled}
            onToggleCamera={(enabled) => setCameraEnabled(enabled)}
            stream={stream}
            onRecordingComplete={handleRecordingComplete}
          />
        )}
        
        {mode === 'recording-playback' && recordedVideo && (
          <PlaybackControls 
            videoRef={videoRef}
            onSave={handleSaveRecording}
            onCancel={handleBackToCamera}
          />
        )}
        
        {mode === 'file-playback' && (
          <FileControls 
            videoRef={videoRef}
            onFileSelected={handleFileSelected}
            currentFile={selectedFile}
            onExit={handleExitFilePlayback}
          />
        )}
      </div>
    </div>
  );
};

export default App;