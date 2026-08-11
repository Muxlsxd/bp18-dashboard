import mongoose from "mongoose";
import { Readable } from "stream";

// GridFS-backed file storage (used when Google Drive is unavailable, e.g.
// Service Account has no storage quota / no Shared Drive). This keeps the
// file-upload feature fully working locally while Drive remains a drop-in
// alternative (see lib/google-drive.ts).

let bucket: mongoose.mongo.GridFSBucket | null = null;

function getBucket(): mongoose.mongo.GridFSBucket {
  if (!bucket) {
    const db = mongoose.connection.db!;
    bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "fsae_files" });
  }
  return bucket;
}

export interface StoredFile {
  id: string;
  viewLink: string; // local API route to preview/download
  contentLink: string;
}

/** Store a buffer in GridFS, return the stored file id. */
export async function storeFileInMongo(
  buf: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const b = getBucket();
  const id = new mongoose.Types.ObjectId();
  await new Promise<void>((resolve, reject) => {
    const upload = b.openUploadStreamWithId(id, fileName, { metadata: { contentType: mimeType } });
    Readable.from(buf).pipe(upload);
    upload.on("error", reject);
    upload.on("finish", () => resolve());
  });
  return id.toString();
}

/** Read a file's bytes back from GridFS. */
export async function readFileFromMongo(fileId: string): Promise<Buffer> {
  const b = getBucket();
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    const download = b.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    download.on("data", (c) => chunks.push(c as Buffer));
    download.on("error", reject);
    download.on("end", () => resolve());
  });
  return Buffer.concat(chunks);
}

/** Delete a file from GridFS. */
export async function deleteFileFromMongo(fileId: string): Promise<void> {
  const b = getBucket();
  await b.delete(new mongoose.Types.ObjectId(fileId));
}
