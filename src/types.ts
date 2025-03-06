/**
 * The app can be one of four main modes at all times.
 *
 * Camera - ready to record
 * RecordingPlayback - preview a recording before saving
 * FilePlayback - play a video from file
 * Error - No video source
 *
 *
 * Any mode can transition to Camera or FilePlayback, RecordingPlayback
 * is only transitioned to from Camera mode upon completion of a recording
 */
export enum AppMode {
  Camera = 'camera',
  RecordingPlayback = 'recording-playback',
  FilePlayback = 'file-playback',
}

type RecordedVideo = { blob: Blob; url: string }
type VideoFile = { name: string; url: string }
export type MediaInput = MediaStream | RecordedVideo | VideoFile | null

export type InputMode =
  | [AppMode, null]
  | [AppMode.Camera, MediaStream]
  | [AppMode.RecordingPlayback, RecordedVideo]
  | [AppMode.FilePlayback, VideoFile]
