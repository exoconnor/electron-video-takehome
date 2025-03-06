import React, { useEffect, useState, useRef } from 'react'
import { accessCamera } from './accessCamera'

import styles from './Camera.module.css'

const Camera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraEnabled, setCameraEnabled] = useState(false);
    
  // Access camera
  const { stream, error: cameraError } = accessCamera({
    width: 640,
    height: 480
  });

  // update video ref based on webcam state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = cameraEnabled ? stream : null
    }
  }, [cameraEnabled, stream])

  
  return (   
    <div className={styles.section}>
      <div className={styles.container}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          width={640}
          height={480}
          className={styles.video}
        />
        
        {cameraError && (
          <div className={styles.error}>
            <p>Error: {cameraError.message}</p>
          </div>
        )}
      </div>
      {cameraEnabled ? (
        <>
          <div className={styles.controls}>
            <button 
              onClick={() => setCameraEnabled(false)}
              className="control-btn"
            >
              Disable Camera
            </button>
          </div>
        </>
      ) : (
        <div className={styles.controls}>
          <button 
            onClick={() => setCameraEnabled(true)}
            className="control-btn"
          >
            Enable Camera
          </button>
        </div>
      )}
    </div>
  );
}

export default Camera