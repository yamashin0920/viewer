export type MediaType = 'pdf' | 'epub' | 'video';

export interface MediaSource {
  type: MediaType;
  url: string;
  name: string;
  /** True when url was created via URL.createObjectURL and should be revoked on cleanup */
  isObjectUrl: boolean;
}

export interface Viewer {
  destroy(): void;
}
