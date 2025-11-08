declare module 'videoshow' {
  interface ImageItem {
    path: string;
    duration: number;
  }

  interface VideoShowOptions {
    fps?: number;
    transition?: boolean;
    transitionDuration?: number;
    videoBitrate?: number;
    audioBitrate?: string;
    audioChannels?: number;
    loop?: number;
    format?: string;
  }

  interface VideoShow {
    audio(audioPath: string): VideoShow;
    save(outputPath: string): VideoShowSave;
  }

  interface VideoShowSave {
    on(event: 'error' | 'end', callback: (err?: Error) => void): VideoShowSave;
  }

  function videoshow(images: ImageItem[], options?: VideoShowOptions): VideoShow;

  export = videoshow;
}
