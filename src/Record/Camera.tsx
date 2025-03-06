import React, { useEffect, useState, useRef } from 'react'
import { accessCamera } from './accessCamera'

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
    <div className="camera-section">
      <div className="camera-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          width={640}
          height={480}
          className="camera-video"
        />
        
        {cameraError && (
          <div className="camera-error">
            <p>Error: {cameraError.message}</p>
          </div>
        )}
      </div>
      {cameraEnabled ? (
        <>
          <div className="camera-controls">
            <button 
              onClick={() => setCameraEnabled(false)}
              className="control-btn"
            >
              Disable Camera
            </button>
          </div>
        </>
      ) : (
        <div className="camera-controls">
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