import ePub from 'epubjs';
import type { Viewer } from '../types';

interface TocItem {
  label: string;
  href: string;
}

export class EpubViewer implements Viewer {
  private container: HTMLElement;
  private book: ReturnType<typeof ePub> | null = null;
  private rendition: ReturnType<ReturnType<typeof ePub>['renderTo']> | null = null;
  private prevBtn: HTMLButtonElement | null = null;
  private nextBtn: HTMLButtonElement | null = null;
  private locationEl: HTMLElement | null = null;
  private tocListEl: HTMLElement | null = null;

  private constructor(container: HTMLElement) {
    this.container = container;
    this.renderShell();
  }

  static async create(container: HTMLElement, url: string): Promise<EpubViewer> {
    const viewer = new EpubViewer(container);
    await viewer.load(url);
    return viewer;
  }

  private renderShell(): void {
    this.container.innerHTML = `
      <div class="epub-viewer">
        <aside class="epub-viewer__sidebar">
          <p class="epub-viewer__sidebar-title">目次</p>
          <ul class="epub-viewer__toc" id="epub-toc"></ul>
        </aside>
        <div class="epub-viewer__content">
          <div class="toolbar">
            <button class="btn btn--secondary" id="epub-prev">前へ</button>
            <button class="btn btn--secondary" id="epub-next">次へ</button>
            <span class="toolbar__info" id="epub-location">読み込み中…</span>
          </div>
          <div class="epub-viewer__rendition" id="epub-rendition"></div>
        </div>
      </div>
    `;

    this.prevBtn = this.container.querySelector('#epub-prev');
    this.nextBtn = this.container.querySelector('#epub-next');
    this.locationEl = this.container.querySelector('#epub-location');
    this.tocListEl = this.container.querySelector('#epub-toc');

    this.prevBtn?.addEventListener('click', () => void this.rendition?.prev());
    this.nextBtn?.addEventListener('click', () => void this.rendition?.next());
  }

  private async load(url: string): Promise<void> {
    this.book = ePub(url);
    await this.book.ready;

    const renditionEl = this.container.querySelector('#epub-rendition');
    if (!renditionEl) return;

    this.rendition = this.book.renderTo(renditionEl, {
      width: '100%',
      height: '100%',
      spread: 'none',
    });

    await this.rendition.display();

    this.rendition.on('relocated', (location) => {
      const displayed = location.start?.displayed;
      if (this.locationEl && displayed) {
        this.locationEl.textContent = `${displayed.page ?? '?'} / ${displayed.total ?? '?'}`;
      }
    });

    await this.buildToc();
  }

  private async buildToc(): Promise<void> {
    if (!this.book || !this.tocListEl) return;

    const navigation = await this.book.loaded.navigation;
    const toc: TocItem[] = navigation.toc.map((item) => ({
      label: item.label.trim(),
      href: item.href,
    }));

    this.tocListEl.innerHTML = '';
    for (const item of toc) {
      const li = document.createElement('li');
      li.className = 'epub-viewer__toc-item';
      li.textContent = item.label;
      li.addEventListener('click', () => {
        void this.rendition?.display(item.href);
        this.tocListEl?.querySelectorAll('.epub-viewer__toc-item--active').forEach((el) => {
          el.classList.remove('epub-viewer__toc-item--active');
        });
        li.classList.add('epub-viewer__toc-item--active');
      });
      this.tocListEl.appendChild(li);
    }
  }

  destroy(): void {
    this.rendition?.destroy();
    this.book?.destroy();
    this.rendition = null;
    this.book = null;
    this.container.innerHTML = '';
  }
}
