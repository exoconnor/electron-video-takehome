import { useState } from 'react'

/**
 * The app can be one of three main modes at all times.
 * 
 * AppMode.Camera - ready to record
 * RecordingPlayback - preview a recording before saving
 * FilePlayback - play a video from file
 * 
 * Any mode can transition to Camera or FilePlayback, RecordingPlayback
 * is only transitioned to from Camera mode upon completion of a recording
 */
enum AppMode {
  Camera = 'camera',
  RecordingPlayback = 'recording-playback',
  FilePlayback = 'file-playback'
}

/**
 * Camera is on 
 */
type AppState = {
  mode: AppMode,
}