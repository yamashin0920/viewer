import { detectMediaType, getFileParam, getFilenameFromUrl, resolveFileUrl } from './router';
import type { MediaSource, Viewer } from './types';
import { PdfViewer } from './viewers/pdf-viewer';
import { VideoViewer } from './viewers/video-viewer';
import { EpubViewer } from './viewers/epub-viewer';

export class App {
  private fileInput: HTMLInputElement;
  private dropZone: HTMLElement;
  private viewerContainer: HTMLElement;
  private errorMessage: HTMLElement;
  private currentViewer: Viewer | null = null;
  private currentSource: MediaSource | null = null;

  constructor() {
    this.fileInput = document.getElementById('file-input') as HTMLInputElement;
    this.dropZone = document.getElementById('drop-zone')!;
    this.viewerContainer = document.getElementById('viewer-container')!;
    this.errorMessage = document.getElementById('error-message')!;

    this.bindEvents();
    void this.loadFromUrlParam();
  }

  private bindEvents(): void {
    this.fileInput.addEventListener('change', () => {
      const file = this.fileInput.files?.[0];
      if (file) void this.loadFile(file);
      this.fileInput.value = '';
    });

    this.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropZone.classList.add('drop-zone--active');
    });

    this.dropZone.addEventListener('dragleave', () => {
      this.dropZone.classList.remove('drop-zone--active');
    });

    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropZone.classList.remove('drop-zone--active');
      const file = e.dataTransfer?.files[0];
      if (file) void this.loadFile(file);
    });
  }

  private async loadFromUrlParam(): Promise<void> {
    const fileParam = getFileParam();
    if (!fileParam) return;

    const url = await resolveFileUrl(fileParam);
    const name = getFilenameFromUrl(url);
    const type = detectMediaType(name);

    if (!type) {
      this.showError(`URL のファイル形式を判定できません: ${name}`);
      return;
    }

    await this.openViewer({ type, url, name, isObjectUrl: false });
  }

  private async loadFile(file: File): Promise<void> {
    const type = detectMediaType(file.name);
    if (!type) {
      this.showError(`対応していないファイル形式です: ${file.name}`);
      return;
    }

    const url = URL.createObjectURL(file);
    await this.openViewer({ type, url, name: file.name, isObjectUrl: true });
  }

  private async openViewer(source: MediaSource): Promise<void> {
    this.hideError();
    this.cleanup();

    this.dropZone.classList.add('hidden');
    this.viewerContainer.classList.remove('hidden');

    try {
      switch (source.type) {
        case 'pdf':
          this.currentViewer = await PdfViewer.create(this.viewerContainer, source.url);
          break;
        case 'video':
          this.currentViewer = new VideoViewer(this.viewerContainer, source.url, source.isObjectUrl);
          break;
        case 'epub':
          this.currentViewer = await EpubViewer.create(this.viewerContainer, source.url);
          break;
      }
      this.currentSource = source;
    } catch (err) {
      this.cleanup();
      this.showError(
        err instanceof Error ? err.message : `ファイルの読み込みに失敗しました: ${String(err)}`,
      );
      this.resetView();
    }
  }

  private cleanup(): void {
    this.currentViewer?.destroy();
    this.currentViewer = null;

    if (this.currentSource?.isObjectUrl) {
      URL.revokeObjectURL(this.currentSource.url);
    }
    this.currentSource = null;
  }

  private resetView(): void {
    this.viewerContainer.classList.add('hidden');
    this.viewerContainer.innerHTML = '';
    this.dropZone.classList.remove('hidden');
  }

  private showError(message: string): void {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.remove('hidden');
  }

  private hideError(): void {
    this.errorMessage.classList.add('hidden');
    this.errorMessage.textContent = '';
  }
}
