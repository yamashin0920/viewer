import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { Viewer } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
const SCALE_STEP = 0.25;

export class PdfViewer implements Viewer {
  private container: HTMLElement;
  private pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;
  private currentPage = 1;
  private scale = 1.0;
  private canvas: HTMLCanvasElement | null = null;
  private pageInfoEl: HTMLElement | null = null;
  private prevBtn: HTMLButtonElement | null = null;
  private nextBtn: HTMLButtonElement | null = null;

  private constructor(container: HTMLElement) {
    this.container = container;
    this.renderShell();
  }

  static async create(container: HTMLElement, url: string): Promise<PdfViewer> {
    const viewer = new PdfViewer(container);
    await viewer.load(url);
    return viewer;
  }

  private renderShell(): void {
    this.container.innerHTML = `
      <div class="pdf-viewer">
        <div class="toolbar">
          <button class="btn btn--secondary" id="pdf-prev" disabled>前へ</button>
          <button class="btn btn--secondary" id="pdf-next" disabled>次へ</button>
          <button class="btn btn--secondary" id="pdf-zoom-out">−</button>
          <button class="btn btn--secondary" id="pdf-zoom-in">＋</button>
          <span class="toolbar__info" id="pdf-page-info">読み込み中…</span>
        </div>
        <div class="pdf-viewer__canvas-wrap">
          <canvas id="pdf-canvas"></canvas>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#pdf-canvas');
    this.pageInfoEl = this.container.querySelector('#pdf-page-info');
    this.prevBtn = this.container.querySelector('#pdf-prev');
    this.nextBtn = this.container.querySelector('#pdf-next');
    const zoomOutBtn = this.container.querySelector('#pdf-zoom-out');
    const zoomInBtn = this.container.querySelector('#pdf-zoom-in');

    this.prevBtn?.addEventListener('click', () => void this.goToPage(this.currentPage - 1));
    this.nextBtn?.addEventListener('click', () => void this.goToPage(this.currentPage + 1));
    zoomOutBtn?.addEventListener('click', () => void this.changeScale(-SCALE_STEP));
    zoomInBtn?.addEventListener('click', () => void this.changeScale(SCALE_STEP));
  }

  private async load(url: string): Promise<void> {
    const loadingTask = pdfjsLib.getDocument(url);
    this.pdfDoc = await loadingTask.promise;
    this.currentPage = 1;
    await this.renderPage();
  }

  private async goToPage(page: number): Promise<void> {
    if (!this.pdfDoc) return;
    if (page < 1 || page > this.pdfDoc.numPages) return;
    this.currentPage = page;
    await this.renderPage();
  }

  private async changeScale(delta: number): Promise<void> {
    this.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, this.scale + delta));
    await this.renderPage();
  }

  private async renderPage(): Promise<void> {
    if (!this.pdfDoc || !this.canvas) return;

    const page = await this.pdfDoc.getPage(this.currentPage);
    const viewport = page.getViewport({ scale: this.scale });
    const context = this.canvas.getContext('2d');
    if (!context) return;

    this.canvas.height = viewport.height;
    this.canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;

    if (this.pageInfoEl) {
      this.pageInfoEl.textContent = `${this.currentPage} / ${this.pdfDoc.numPages}  （${Math.round(this.scale * 100)}%）`;
    }
    if (this.prevBtn) this.prevBtn.disabled = this.currentPage <= 1;
    if (this.nextBtn) this.nextBtn.disabled = this.currentPage >= this.pdfDoc.numPages;
  }

  destroy(): void {
    void this.pdfDoc?.destroy();
    this.pdfDoc = null;
    this.container.innerHTML = '';
  }
}
