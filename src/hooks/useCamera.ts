import { useState, useEffect } from 'react'
import { type CameraConfig, type CameraResult } from './types'

/**
 * Provides access to the camera stream with the specified configuration
 *
 * @param config - Camera configuration options
 * @returns Camera state and references
 */
export function useCamera(config: CameraConfig = {}): CameraResult {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { width = 640, height = 480, facingMode = 'user' } = config

  useEffect(() => {
    async function initializeCamera() {
      try {
        setIsLoading(true)
        setError(null)

        const constraints: MediaStreamConstraints = {
          audio: false,
          video: {
            width,
            height,
            facingMode,
          },
        }

        await window.electronAPI.requestCamera()

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
        setStream(mediaStream)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to access camera'))
        console.error('Error accessing camera:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initializeCamera()

    // Release camera resources when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [width, height, facingMode])

  return { stream, error, isLoading }
}
