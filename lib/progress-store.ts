// Persistent progress tracking for file uploads using file system
// This ensures progress persists across API route calls in Next.js

import fs from 'fs';
import path from 'path';

export interface UploadProgress {
  stage: 'reading' | 'parsing' | 'analyzing' | 'finalizing' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  total: number;
  processed: number;
}

class ProgressStore {
  private storeDir: string;

  constructor() {
    // Create progress store directory in temp folder
    this.storeDir = path.join(process.cwd(), '.progress-store');
    if (!fs.existsSync(this.storeDir)) {
      fs.mkdirSync(this.storeDir, { recursive: true });
    }
  }

  private getFilePath(uploadId: string): string {
    return path.join(this.storeDir, `${uploadId}.json`);
  }

  set(uploadId: string, progress: UploadProgress) {
    try {
      const filePath = this.getFilePath(uploadId);
      fs.writeFileSync(filePath, JSON.stringify(progress, null, 2));
      console.log(`💾 Progress saved to file: ${filePath}`);
    } catch (error) {
      console.error('❌ Failed to save progress:', error);
    }
  }

  get(uploadId: string): UploadProgress | undefined {
    try {
      const filePath = this.getFilePath(uploadId);
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        const progress = JSON.parse(data) as UploadProgress;
        console.log(`📖 Progress loaded from file: ${filePath}`);
        return progress;
      }
    } catch (error) {
      console.error('❌ Failed to load progress:', error);
    }
    return undefined;
  }

  delete(uploadId: string) {
    try {
      const filePath = this.getFilePath(uploadId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Progress file deleted: ${filePath}`);
      }
    } catch (error) {
      console.error('❌ Failed to delete progress:', error);
    }
  }

  has(uploadId: string): boolean {
    const filePath = this.getFilePath(uploadId);
    return fs.existsSync(filePath);
  }

  // Clean up old progress files (older than 1 hour)
  cleanup() {
    try {
      const files = fs.readdirSync(this.storeDir);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      files.forEach(file => {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.storeDir, file);
          const stats = fs.statSync(filePath);
          if (now - stats.mtime.getTime() > oneHour) {
            fs.unlinkSync(filePath);
            console.log(`🧹 Cleaned up old progress file: ${file}`);
          }
        }
      });
    } catch (error) {
      console.error('❌ Failed to cleanup progress files:', error);
    }
  }
}

// Export singleton instance
export const progressStore = new ProgressStore();

// Clean up old files periodically
setInterval(() => {
  progressStore.cleanup();
}, 30 * 60 * 1000); // Every 30 minutes 