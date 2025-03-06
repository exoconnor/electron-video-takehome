import React from 'react'
import styles from './Controls.module.css'

interface PlaybackControlsProps {
  onSave: () => void
  onCancel: () => void
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({ onSave, onCancel }) => {
  return (
    <div className={styles.controlsWrapper}>
      <div className={styles.playbackButtons}>
        <div className={styles.saveActions}>
          <button className={styles.retroButton} onClick={onSave}>
            Save Recording
          </button>

          <button className={`${styles.retroButton} ${styles.dangerButton}`} onClick={onCancel}>
            Discard
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlaybackControls
