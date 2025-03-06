import { useState, useEffect, useRef } from 'react'
import type { RecordingConfig, RecordingOperations, RecordingStatus } from './types'

/**
 * Creates and manages a video recording from a media stream
 *
 * @param stream - Media stream to record
 * @param config - Recording configuration options
 * @returns Recording state and controls
 */
export function useRecording(
  stream: MediaStream | null,
  config: RecordingConfig = {},
): RecordingOperations {
  const [status, setStatus] = useState<RecordingStatus>('inactive')
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const recordedChunks = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)

  // Determine supported MIME types
  const getMimeType = () => {
    const defaultTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ]

    if (config.mimeType && MediaRecorder.isTypeSupported(config.mimeType)) {
      return config.mimeType
    }

    // Find first supported type
    const supportedType = defaultTypes.find(type => MediaRecorder.isTypeSupported(type))
    if (!supportedType) {
      console.warn('None of the preferred MIME types are supported. Using browser default.')
    }

    return supportedType || ''
  }

  const startRecording = () => {
    if (!stream) {
      setError(new Error('No camera stream available'))
      setStatus('error')
      return
    }

    try {
      // Reset state
      recordedChunks.current = []
      setError(null)
      setRecordedBlob(null)
      setRecordedUrl(null)
      setDuration(0)

      // Create MediaRecorder
      const options: MediaRecorderOptions = {
        mimeType: getMimeType(),
        videoBitsPerSecond: config.videoBitsPerSecond || 2500000, // 2.5 Mbps default
      }

      mediaRecorder.current = new MediaRecorder(stream, options)

      // Set up event handlers
      mediaRecorder.current.ondataavailable = event => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data)
        }
      }

      mediaRecorder.current.onstop = () => {
        if (recordedChunks.current.length === 0) {
          setStatus('inactive')
          return
        }

        setStatus('processing')

        // Create a single blob from all chunks
        const blob = new Blob(recordedChunks.current, { type: getMimeType() })
        const url = URL.createObjectURL(blob)

        setRecordedBlob(blob)
        setRecordedUrl(url)
        setStatus('inactive')

        // Stop the timer
        if (timerRef.current !== null) {
          window.clearInterval(timerRef.current)
          timerRef.current = null
        }
      }

      mediaRecorder.current.onerror = event => {
        setError(new Error('Recording error: ' + event.error))
        setStatus('error')
      }

      // Start recording
      mediaRecorder.current.start(1000) // Collect data every second
      setStatus('recording')

      // Start duration timer
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to start recording'))
      setStatus('error')
      console.error('Error starting recording:', err)
    }
  }

  const stopRecording = () => {
    if (
      mediaRecorder.current &&
      (mediaRecorder.current.state === 'recording' || mediaRecorder.current.state === 'paused')
    ) {
      mediaRecorder.current.stop()
    }
  }

  const resetRecording = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl)
    }

    setStatus('inactive')
    setRecordedBlob(null)
    setRecordedUrl(null)
    setDuration(0)
    setError(null)
    recordedChunks.current = []
  }

  const saveRecording = async (fileName?: string) => {
    if (!recordedBlob) {
      return {
        success: false,
        error: 'No recording available to save',
      }
    }

    try {
      // Convert blob to ArrayBuffer for saving via IPC
      const arrayBuffer = await recordedBlob.arrayBuffer()

      // Use the electron API exposed in preload script
      const result = await (window as any).electronAPI.saveVideo(fileName, arrayBuffer)
      return result
    } catch (err) {
      console.error('Error saving recording:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to save recording',
      }
    }
  }

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current)
      }

      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl)
      }
    }
  }, [recordedUrl])

  return {
    // State
    status,
    recordedBlob,
    recordedUrl,
    duration,
    error,

    // Controls
    startRecording,
    stopRecording,
    resetRecording,
    saveRecording,
  }
}
