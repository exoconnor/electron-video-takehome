import { type RefObject } from 'react'

/**
 * Configuration options for camera access
 */
export interface CameraConfig {
  width?: number
  height?: number
  facingMode?: 'user' | 'environment'
}

/**
 * Results of camera access operation
 */
export interface CameraResult {
  /** The media stream if successfully acquired */
  stream: MediaStream | null

  /** Any error that occurred during camera access */
  error: Error | null

  /** Whether camera is currently initializing */
  isLoading: boolean
}

/**
 * Configuration options for recording
 */
export interface RecordingConfig {
  /** MIME type of the recording */
  mimeType?: string

  /** Video bitrate */
  videoBitsPerSecond?: number

  /** Whether to include audio */
  audio?: boolean
}

/**
 * Status of a recording
 */
export type RecordingStatus =
  | 'inactive' // Not recording
  | 'recording' // Currently recording
  | 'paused' // Recording is paused
  | 'processing' // Processing recording
  | 'error' // Error occurred

/**
 * Results of recording operation
 */
export interface RecordingState {
  /** Current status of recording */
  status: RecordingStatus

  /** Recorded data when complete */
  recordedBlob: Blob | null

  /** URL for recorded content */
  recordedUrl: string | null

  /** Timer for recording duration */
  duration: number

  /** Any error that occurred */
  error: Error | null
}

/**
 * Controls for recording
 */
export interface RecordingControls {
  /** Start recording function */
  startRecording: () => void

  /** Stop recording function */
  stopRecording: () => void

  /** Reset recording state */
  resetRecording: () => void

  /** Save recording to disk */
  saveRecording: (
    fileName: string,
  ) => Promise<{ success: boolean; filePath?: string; error?: string }>
}

/**
 * Complete recording interface
 */
export interface RecordingOperations extends RecordingState, RecordingControls {}
