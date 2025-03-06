import React, { useState, useRef, useEffect } from 'react';
import styles from './Controls.module.css';

interface CameraControlsProps {
  isEnabled: boolean;
  onToggleCamera: (enabled: boolean) => void;
  stream: MediaStream | null;
  onRecordingComplete: (blob: Blob) => void;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  isEnabled,
  onToggleCamera,
  stream,
  onRecordingComplete
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  // Set up media recorder when stream changes
  useEffect(() => {
    if (!stream) return;
    
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
    } catch (err) {
      console.error("Error creating MediaRecorder:", err);
    }

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [stream]);

  // Handle recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording]);

  // Handle finishing recording and processing the video
  useEffect(() => {
    const handleRecordingStop = () => {
      if (recordedChunks.length === 0) return;
      
      const blob = new Blob(recordedChunks, {
        type: 'video/webm',
      });
      
      onRecordingComplete(blob);
      
      // Reset recording state
      setRecordingTime(0);
      setRecordedChunks([]);
    };

    if (!isRecording && recordedChunks.length > 0) {
      handleRecordingStop();
    }
  }, [isRecording, recordedChunks, onRecordingComplete]);

  // Start recording
  const handleStartRecording = () => {
    if (!mediaRecorderRef.current || !isEnabled) return;
    
    setRecordedChunks([]);
    setRecordingTime(0);
    
    mediaRecorderRef.current.start(1000); // Collect data every second
    setIsRecording(true);
  };

  // Stop recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Format time display (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.controlsWrapper}>
      <div className={styles.cameraToggle}>
        <button 
          className={`${styles.button} ${isEnabled ? styles.dangerButton : styles.primaryButton}`}
          onClick={() => onToggleCamera(!isEnabled)}
        >
          {isEnabled ? 'Disable Camera' : 'Enable Camera'}
        </button>
      </div>

      {isEnabled && (
        <div className={styles.recordingControls}>
          {!isRecording ? (
            <button 
              className={`${styles.button} ${styles.recordButton}`}
              onClick={handleStartRecording}
            >
              Start Recording
            </button>
          ) : (
            <div className={styles.activeRecording}>
              <div className={styles.recordingIndicator}>
                <span className={styles.recordingDot}></span>
                Recording: {formatTime(recordingTime)}
              </div>
              <button 
                className={`${styles.button} ${styles.stopButton}`}
                onClick={handleStopRecording}
              >
                Stop Recording
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraControls;