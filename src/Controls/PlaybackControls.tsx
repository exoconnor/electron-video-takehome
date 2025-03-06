import React from 'react'
import styles from './Controls.module.css'

interface PlaybackControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>
  onSave: () => void
  onCancel: () => void
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({ videoRef, onSave, onCancel }) => {
  // Additional playback functions can be added here
  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }
  }

  return (
    <div className={styles.controlsWrapper}>
      <div className={styles.playbackTitle}>
        <h3>Recording Playback</h3>
      </div>

      <div className={styles.playbackButtons}>
        <button className={`${styles.button} ${styles.primaryButton}`} onClick={handleReplay}>
          Replay
        </button>

        <div className={styles.saveActions}>
          <button className={`${styles.button} ${styles.successButton}`} onClick={onSave}>
            Save Recording
          </button>

          <button className={`${styles.button} ${styles.dangerButton}`} onClick={onCancel}>
            Discard
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlaybackControls
