
import { GenerativePart } from "@google/genai";

// Converts a File object to a base64 string
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // result is "data:mime/type;base64,..." - we only want the part after the comma
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Converts a File object to a GenerativePart object for the Gemini API
export const fileToGenerativePart = async (file: File): Promise<GenerativePart> => {
  const base64Data = await fileToBase64(file);
  return {
    inlineData: {
      data: base64Data,
      mimeType: file.type,
    },
  };
};

// Extracts frames from a video element as base64 strings
export const extractFramesFromVideo = (videoElement: HTMLVideoElement, fps: number): Promise<string[]> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const frames: string[] = [];
    
    videoElement.addEventListener('loadeddata', async () => {
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      const duration = videoElement.duration;
      const interval = 1 / fps;
      let currentTime = 0;

      const captureFrame = async () => {
        if (currentTime > duration) {
          resolve(frames);
          return;
        }

        videoElement.currentTime = currentTime;
        
        // Wait for the seek to complete
        videoElement.addEventListener('seeked', () => {
          if (!context) { resolve(frames); return; }
          context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          frames.push(dataUrl.split(',')[1]);
          currentTime += interval;
          // Use requestAnimationFrame for smoother processing
          requestAnimationFrame(captureFrame);
        }, { once: true });
      };
      
      captureFrame();
    });
    
    // Start loading the video data
    videoElement.load();
  });
};
