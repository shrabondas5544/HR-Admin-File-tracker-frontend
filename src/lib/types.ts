export interface DocumentType {
  id: number;
  name: string;
  description: string;
  isBuiltIn: boolean;
  fieldsJson: string;
}

export interface FileAttachment {
  url: string;
  name: string;
}

export function parseAttachments(attachmentsJson?: string, attachmentUrl?: string, attachmentName?: string): FileAttachment[] {
  if (attachmentsJson) {
    try {
      const parsed = JSON.parse(attachmentsJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((a) => a && typeof a.url === "string");
      }
    } catch {}
  }
  if (attachmentUrl) {
    return [{ url: attachmentUrl, name: attachmentName || "Attachment 1" }];
  }
  return [];
}

export interface RecordFile {
  id: number;
  code: string;
  title: string;
  documentTypeId?: number;
  documentType?: DocumentType;
  metadataJson: string;
  magazineId?: number;
  shelfId?: number;
  orderIndex: number;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentsJson?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface Folder {
  id: number;
  name: string;
  code: string;
  colorHex: string;
  shelfId: number;
  orderIndex: number;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentsJson?: string;
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface Magazine {
  id: number;
  name: string;
  code: string;
  colorHex: string;
  shelfId: number;
  orderIndex: number;
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
  files: RecordFile[];
}

export interface Shelf {
  id: number;
  cabinetId: number;
  section: "Upper" | "Lower";
  shelfCode: string; // "U1".."U4", "L1".."L3"
  orderIndex: number;
  magazines: Magazine[];
  folders: Folder[];
  standaloneFiles: RecordFile[];
}

export interface Cabinet {
  id: number;
  cabinetNumber: number; // 1 to 6
  name: string;
  description: string;
  shelves: Shelf[];
}

export interface SearchResult {
  type: "File" | "Magazine" | "Folder";
  id: number;
  title: string;
  code: string;
  subtitle: string;
  cabinetNumber: number;
  cabinetName: string;
  section: "Upper" | "Lower";
  shelfCode: string;
  shelfId: number;
  magazineId?: number;
  magazineName?: string;
  colorHex?: string;
  highlightField?: string;
}

export interface FlatShelf {
  id: number;
  cabinetId: number;
  cabinetNumber: number;
  cabinetName: string;
  section: "Upper" | "Lower";
  shelfCode: string;
  orderIndex: number;
  displayName: string;
}

export interface TrashItem {
  type: "File" | "Magazine" | "Folder";
  id: number;
  title: string;
  code: string;
  colorHex?: string;
  deletedAt?: string;
  daysRemaining: number;
  originalLocation: string;
}
