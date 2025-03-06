import React, { useEffect, useState, useRef } from 'react'
import { accessCamera } from './accessCamera'
import { createRecording } from './createRecording'

import styles from './Camera.module.css'

const Camera: React.FC = () => {
  // The main video element
  const videoRef = useRef<HTMLVideoElement>(null)
  // Default on is probably better anyways
  const [cameraEnabled, setCameraEnabled] = useState(false);

  // Access camera
  const { stream, error: cameraError } = accessCamera({
    width: 640,
    height: 480
  });
  
  // Setup recording
  const {
      status: recordingStatus,
      duration,
      recordedUrl,
      startRecording,
      stopRecording,
      resetRecording,
      saveRecording
  } = createRecording(stream);
    

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
      <div className={styles.controls}>
        <button 
          onClick={() => setCameraEnabled(!cameraEnabled)}
          className="control-btn"
        >
          {cameraEnabled ? "Disable Camera" : "Enable Camera"}
        </button>
        <button 
          onClick={() => startRecording()}
          className="control-btn"
        >
          Start Recording
        </button>
        <button 
          onClick={() => stopRecording()}
          className="control-btn"
        >
          Stop Recording
        </button>
        <button 
          onClick={() => resetRecording()}
          className="control-btn"
        >
          Reset Recording
        </button>
        <button 
          onClick={() => saveRecording()}
          className="control-btn"
        >
          Save Recording
        </button>
      </div>
    </div>
  );
}

export default Camera