// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // We'll add methods here as needed for file handling, etc.
  saveVideo: (filePath: string, buffer: ArrayBuffer) =>
    ipcRenderer.invoke('save-video', filePath, buffer),
  requestCamera: () => ipcRenderer.invoke('request-permissions'),
})

type saveVideoResult =
  | {
      success: true
      filePath: string
    }
  | {
      success: false
      message: string
    }

// Add TypeScript interface
declare global {
  interface Window {
    electronAPI: {
      saveVideo: (fileName: string, data: Uint8Array) => Promise<saveVideoResult>
      requestCamera: () => Promise<void>
    }
  }
}
