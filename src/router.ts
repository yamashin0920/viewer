import type { MediaType } from './types';

const PDF_EXTENSIONS = ['.pdf'];
const EPUB_EXTENSIONS = ['.epub'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];

export function detectMediaType(filename: string): MediaType | null {
  const lower = filename.toLowerCase();
  if (PDF_EXTENSIONS.some((ext) => lower.endsWith(ext))) return 'pdf';
  if (EPUB_EXTENSIONS.some((ext) => lower.endsWith(ext))) return 'epub';
  if (VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext))) return 'video';
  return null;
}

export function getFileParam(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('file');
}

export function resolveFileUrl(fileParam: string): string {
  if (/^https?:\/\//i.test(fileParam)) {
    return fileParam;
  }
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = fileParam.startsWith('/') ? fileParam : `/${fileParam}`;
  return `${base}${path}`;
}

export function getFilenameFromUrl(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin);
    const segments = parsed.pathname.split('/');
    return decodeURIComponent(segments[segments.length - 1] || 'file');
  } catch {
    const segments = url.split('/');
    return decodeURIComponent(segments[segments.length - 1] || 'file');
  }
}

export const SUPPORTED_EXTENSIONS = [
  ...PDF_EXTENSIONS,
  ...EPUB_EXTENSIONS,
  ...VIDEO_EXTENSIONS,
].join(', ');

export const ACCEPT_ATTR = '.pdf,.epub,.mp4,.webm,.ogg,.mov,.m4v';
