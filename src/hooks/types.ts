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

