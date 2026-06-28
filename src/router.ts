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

function isExternalUrl(fileParam: string): boolean {
  return /^https?:\/\//i.test(fileParam);
}

function normalizeLocalPath(fileParam: string): string {
  return fileParam.startsWith('/') ? fileParam : `/${fileParam}`;
}

async function urlExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

export async function resolveFileUrl(fileParam: string): Promise<string> {
  if (isExternalUrl(fileParam)) {
    return fileParam;
  }

  const baseUrl = import.meta.env.BASE_URL || '/';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const path = normalizeLocalPath(fileParam);

  if (normalizedBase !== '/' && path.startsWith(normalizedBase)) {
    return path;
  }

  const baseCandidate = normalizedBase === '/' ? path : `${normalizedBase.replace(/\/$/, '')}${path}`;
  if (baseCandidate === path) {
    return baseCandidate;
  }

  if (await urlExists(baseCandidate)) {
    return baseCandidate;
  }

  if (await urlExists(path)) {
    return path;
  }

  return baseCandidate;
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
