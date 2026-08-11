import "dotenv/config";
import { google } from "googleapis";
import { Readable } from "stream";

// Service Account credentials (minified JSON in env) or parsed object.
const RAW = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
if (!RAW) {
  console.warn("[google-drive] GOOGLE_SERVICE_ACCOUNT_JSON not set — Drive features disabled.");
}

let credentials: object | null = null;
if (RAW) {
  try {
    credentials = JSON.parse(RAW);
  } catch (e) {
    console.error("[google-drive] Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:", e);
  }
}

const auth = credentials
  ? new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive"],
    })
  : null;

export const drive = auth ? google.drive({ version: "v3", auth }) : null;

// Shared Drive (Team Drive) ID. Service Accounts have no personal storage quota,
// so all files live on a Shared Drive. Set via GOOGLE_DRIVE_PARENT_FOLDER_ID.
export const PARENT_FOLDER_ID = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID || "";
const SHARED_DRIVE_NAME = "FSAE_2026";

// Cache the resolved shared drive id so we don't list drives on every call.
let cachedDriveId: string | null = null;

/** Find or create the FSAE_2026 Shared Drive (idempotent). */
export async function ensureSharedDrive(): Promise<string> {
  if (cachedDriveId) return cachedDriveId;
  const d = await ensureDrive();
  const list = await d.drives.list();
  const existing = (list.data.drives || []).find((x) => x.name === SHARED_DRIVE_NAME);
  if (existing) {
    cachedDriveId = existing.id!;
    return cachedDriveId;
  }
  const created = await d.drives.create({
    requestId: "fsae-2026-drive",
    requestBody: { name: SHARED_DRIVE_NAME },
    fields: "id",
  });
  cachedDriveId = created.data.id!;
  return cachedDriveId;
}

async function ensureDrive() {
  if (!drive) throw new Error("Google Drive not configured (missing GOOGLE_SERVICE_ACCOUNT_JSON).");
  return drive;
}

export interface UploadResult {
  id: string;
  webViewLink: string;
  webContentLink: string;
}

/** Upload a buffer to Drive under a parent folder (on the shared drive). */
export async function uploadFileToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  parentFolderId: string = PARENT_FOLDER_ID
): Promise<UploadResult> {
  const d = await ensureDrive();
  const driveId = await ensureSharedDrive();
  const res = await d.files.create({
    supportsAllDrives: true,
    requestBody: {
      name: fileName,
      parents: parentFolderId ? [parentFolderId] : [driveId],
    },
    media: {
      mimeType,
      body: Readable.from(fileBuffer),
    },
    fields: "id,webViewLink,webContentLink,driveId",
  });
  const file = res.data;
  return {
    id: file.id!,
    webViewLink: file.webViewLink || "",
    webContentLink: file.webContentLink || "",
  };
}

/** Download a file's binary stream from Drive. */
export async function downloadFileFromDrive(fileId: string): Promise<Readable> {
  const d = await ensureDrive();
  const res = await d.files.get({ fileId, alt: "media", supportsAllDrives: true }, { responseType: "stream" });
  return res.data as unknown as Readable;
}

/** List files in a folder, returning id + modifiedTime for sync. */
export async function listFilesInFolder(folderId: string = PARENT_FOLDER_ID) {
  const d = await ensureDrive();
  const driveId = await ensureSharedDrive();
  const res = await d.files.list({
    driveId,
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    corpora: "drive",
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id,name,mimeType,modifiedTime,webViewLink,webContentLink)",
    orderBy: "modifiedTime desc",
  });
  return res.data.files || [];
}

/** Create a subfolder under the shared drive (idempotent by name). */
export async function ensureFolder(name: string, parentFolderId: string = PARENT_FOLDER_ID): Promise<string> {
  const d = await ensureDrive();
  const driveId = await ensureSharedDrive();
  const existing = await d.files.list({
    driveId,
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    corpora: "drive",
    q: `'${parentFolderId}' in parents and name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id)",
  });
  if (existing.data.files && existing.data.files.length > 0) {
    return existing.data.files[0].id!;
  }
  const res = await d.files.create({
    supportsAllDrives: true,
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentFolderId ? [parentFolderId] : [driveId],
    },
    fields: "id",
  });
  return res.data.id!;
}
