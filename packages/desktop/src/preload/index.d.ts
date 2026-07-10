import type { ElectronAPI } from "./index";

declare global {
  interface Window {
    api: ElectronAPI;
    electron: ElectronAPI;
  }
}
