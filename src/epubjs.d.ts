declare module 'epubjs' {
  interface NavItem {
    label: string;
    href: string;
  }

  interface Navigation {
    toc: NavItem[];
  }

  interface Displayed {
    page?: number;
    total?: number;
  }

  interface Location {
    start?: { displayed?: Displayed };
  }

  interface RenditionOptions {
    width?: string;
    height?: string;
    spread?: string;
  }

  interface Rendition {
    display(target?: string): Promise<void>;
    prev(): Promise<void>;
    next(): Promise<void>;
    destroy(): void;
    on(event: string, callback: (location: Location) => void): void;
  }

  interface Book {
    ready: Promise<void>;
    loaded: { navigation: Promise<Navigation> };
    renderTo(element: Element | string, options?: RenditionOptions): Rendition;
    destroy(): void;
  }

  function ePub(url: string): Book;
  export default ePub;
}
