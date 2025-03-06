import React, { useRef, useEffect, useState } from 'react'
import styles from './Controls.module.css'
import { AppMode } from '../types'

interface ModeSelectorProps {
  currentMode: AppMode
  onModeChange: (mode: AppMode) => void
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  const [sliderWidth, setSliderWidth] = useState(0)
  const [sliderPosition, setSliderPosition] = useState(0)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([null, null, null])

  // Map modes to their index positions
  const modeIndexMap = {
    [AppMode.Camera]: 0,
    [AppMode.RecordingPlayback]: 1,
    [AppMode.FilePlayback]: 2,
  }

  // Update slider position and dimensions based on the current mode
  useEffect(() => {
    const currentIndex = modeIndexMap[currentMode]
    const button = buttonRefs.current[currentIndex]

    if (button) {
      setSliderWidth(button.offsetWidth)
      setSliderPosition(button.offsetLeft)
    }
  }, [currentMode])

  return (
    <div className={styles.modeSelector}>
      <div className={styles.modeSelectorInner}>
        <button
          ref={el => (buttonRefs.current[0] = el)}
          className={styles.modeButton}
          onClick={() => onModeChange(AppMode.Camera)}
        >
          Camera
        </button>

        {/* <button
          ref={el => buttonRefs.current[1] = el}
          className={styles.modeButton}
          onClick={() => onModeChange(AppMode.RecordingPlayback)}
        >
          Playback
        </button> */}

        <button
          ref={el => (buttonRefs.current[2] = el)}
          className={styles.modeButton}
          onClick={() => onModeChange(AppMode.FilePlayback)}
        >
          Files
        </button>

        <div
          className={styles.slider}
          style={{
            width: sliderWidth,
            transform: `translateX(${sliderPosition}px)`,
          }}
        />
      </div>
    </div>
  )
}

export default ModeSelector
