/**
 * Contract every storage backend implements. The rest of the app only
 * talks to this interface, so moving from local disk to S3, R2, Cloudinary
 * or Vercel Blob means adding one driver file and setting
 * MEDIA_STORAGE_DRIVER. Credentials come from environment variables read
 * inside the driver.
 */
export interface StorageDriver {
  /** Identifier stored on each media document. */
  readonly name: string;
  put(input: { key: string; body: Uint8Array; contentType: string }): Promise<void>;
  delete(key: string): Promise<void>;
  /** Public URL for a stored key. */
  url(key: string): string;
}
