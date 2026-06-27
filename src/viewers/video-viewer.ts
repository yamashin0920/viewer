import type { Viewer } from '../types';

export class VideoViewer implements Viewer {
  private container: HTMLElement;
  private video: HTMLVideoElement | null = null;
  private objectUrl: string | null = null;

  constructor(container: HTMLElement, url: string, isObjectUrl: boolean) {
    this.container = container;
    if (isObjectUrl) this.objectUrl = url;
    this.render(url);
  }

  private render(url: string): void {
    const wrapper = document.createElement('div');
    wrapper.className = 'video-viewer';

    const video = document.createElement('video');
    video.controls = true;
    video.src = url;

    wrapper.appendChild(video);
    this.container.replaceChildren(wrapper);
    this.video = video;
  }

  destroy(): void {
    this.video?.pause();
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
    this.container.innerHTML = '';
  }
}
