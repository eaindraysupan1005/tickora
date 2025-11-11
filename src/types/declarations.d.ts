declare module 'sonner@2.0.3' {
  export * from 'sonner';
}

declare module 'html-to-image' {
  export type JpegOptions = {
    quality?: number;
    backgroundColor?: string;
    pixelRatio?: number;
    canvasWidth?: number;
    canvasHeight?: number;
    filter?: (domNode: HTMLElement) => boolean;
    style?: Record<string, string>;
  };

  export function toJpeg(node: HTMLElement, options?: JpegOptions): Promise<string>;
}
