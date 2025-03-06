import React, { useRef } from 'react';
import styles from './Controls.module.css';

interface FileControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onFileSelected: (name: string, url: string) => void;
  currentFile: { name: string; url: string } | null;
  onExit: () => void;
}

const FileControls: React.FC<FileControlsProps> = ({
  videoRef,
  onFileSelected,
  currentFile,
  onExit
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file');
      return;
    }

    const url = URL.createObjectURL(file);
    onFileSelected(file.name, url);
  };

  // Open file dialog
  const handleOpenFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Open file using Electron's native dialog
  const handleOpenNativeDialog = async () => {
    try {
      const result = await (window as any).electronAPI.openVideo();
      if (result.success && result.filePath) {
        onFileSelected(result.fileName, `file://${result.filePath}`);
      }
    } catch (err) {
      console.error('Error opening file:', err);
    }
  };

  return (
    <div className={styles.controlsWrapper}>
      <div className={styles.fileSelectionArea}>
        <input
          type="file"
          accept="video/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {!currentFile ? (
          <div className={styles.fileButtons}>
            <button 
              className={`${styles.button} ${styles.primaryButton}`}
              onClick={handleOpenFile}
            >
              Select Video File
            </button>
            <button 
              className={`${styles.button} ${styles.primaryButton}`}
              onClick={handleOpenNativeDialog}
            >
              Browse Files
            </button>
          </div>
        ) : (
          <div className={styles.currentFileInfo}>
            <h3>Now Playing</h3>
            <p className={styles.fileName}>{currentFile.name}</p>

            <div className={styles.playbackActions}>
              <button 
                className={`${styles.button} ${styles.secondaryButton}`}
                onClick={handleOpenFile}
              >
                Open Different File
              </button>
              <button 
                className={`${styles.button} ${styles.dangerButton}`}
                onClick={onExit}
              >
                Back to Camera
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileControls;