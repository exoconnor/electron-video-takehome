import React, { useRef } from 'react'
import styles from './Controls.module.css'

interface FileControlsProps {
  onFileSelected: (name: string, url: string) => void
  currentFile: { name: string; url: string } | null
  onExit: () => void
}

const FileControls: React.FC<FileControlsProps> = ({ onFileSelected, currentFile, onExit }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file')
      return
    }

    const url = URL.createObjectURL(file)
    onFileSelected(file.name, url)
  }

  // Open file dialog
  const handleOpenFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={styles.controlsWrapper}>
      <div className={styles.fileSelectionArea}>
        <input
          type='file'
          accept='video/*'
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {!currentFile ? (
          <div className={styles.fileButtons}>
            <button
              className={`${styles.retroButton} ${styles.primaryButton}`}
              onClick={handleOpenFile}
            >
              Select Video File
            </button>
          </div>
        ) : (
          <div className={styles.currentFileInfo}>
            <h3>Now Playing</h3>
            <p className={styles.fileName}>{currentFile.name}</p>

            <div className={styles.playbackActions}>
              <button
                className={`${styles.retroButton} ${styles.secondaryButton}`}
                onClick={handleOpenFile}
              >
                Open Different File
              </button>
              <button className={`${styles.retroButton} ${styles.dangerButton}`} onClick={onExit}>
                Back to Camera
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileControls
