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

export interface ArchiveHeldItem {
  type: "File" | "Magazine" | "Folder";
  id: number;
  title: string;
  code: string;
  colorHex?: string;
  originShelfId?: number;
  originLocationName?: string;
  itemData: RecordFile | Magazine | Folder;
  heldAt: string;
}

export interface ChecklistSubItem {
  name: string;
  checked: boolean;
}

export interface ChecklistItem {
  sn: number;
  name: string;
  status: "YES" | "NO" | "NONE";
  remarks: string;
  subItems?: ChecklistSubItem[];
}

export const DEFAULT_FILE_CHECKLIST: ChecklistItem[] = [
  { sn: 1, name: "Manpower Requisition (Approved Copy)", status: "NONE", remarks: "" },
  { sn: 2, name: "Interview Evaluation (Approved Copy)", status: "NONE", remarks: "" },
  { sn: 3, name: "Joining Letter", status: "NONE", remarks: "" },
  { sn: 4, name: "Appointment / Offer Letter (Photocopy)", status: "NONE", remarks: "" },
  { sn: 5, name: "Resume / CV with Photo (Update)", status: "NONE", remarks: "" },
  { sn: 6, name: "Education Certificate (Photocopy)", status: "NONE", remarks: "" },
  { sn: 7, name: "NID / Birth Certificate / Passport / DL", status: "NONE", remarks: "" },
  { sn: 8, name: "Nominee Form (with Photo & NID)", status: "NONE", remarks: "" },
  { sn: 9, name: "Employee Information Form (Bn & En)", status: "NONE", remarks: "" },
  { sn: 10, name: "Guarantor Declaration Form (with Photo & NID)", status: "NONE", remarks: "If any / applicable" },
  { sn: 11, name: "Conflict of Interest (COI)", status: "NONE", remarks: "" },
  { sn: 12, name: "Training Certificates", status: "NONE", remarks: "If any / applicable" },
  { sn: 13, name: "Experience Certificate", status: "NONE", remarks: "" },
  { sn: 14, name: "Clearance / Release / Resignation Letter", status: "NONE", remarks: "If applicable" },
  { sn: 15, name: "E-TIN & TAX return copy", status: "NONE", remarks: "If applicable" },
  { sn: 16, name: "Bank Account Information (DBBL/Dhaka Bank/SCB/City Bank)", status: "NONE", remarks: "" },
  { sn: 17, name: "Provident Fund Membership Form", status: "NONE", remarks: "Permanent Employees" },
  { sn: 18, name: "Job Description", status: "NONE", remarks: "" },
  {
    sn: 19,
    name: "Personal Requisition Form",
    status: "NONE",
    remarks: "If applicable",
    subItems: [
      { name: "IT Products", checked: false },
      { name: "Email Account", checked: false },
      { name: "Official Business Card", checked: false },
      { name: "Corporate SIM", checked: false },
      { name: "Official ID Card", checked: false }
    ]
  }
];

export function parseChecklist(metadataJson?: string): ChecklistItem[] {
  if (!metadataJson) return JSON.parse(JSON.stringify(DEFAULT_FILE_CHECKLIST));
  try {
    const parsed = JSON.parse(metadataJson);
    if (parsed.checklist && Array.isArray(parsed.checklist) && parsed.checklist.length > 0) {
      return parsed.checklist;
    }
  } catch {}
  return JSON.parse(JSON.stringify(DEFAULT_FILE_CHECKLIST));
}

export type WallId = "W1" | "W2" | "W3R" | "W3L";

export interface WallOption {
  id: WallId;
  label: string;
  fullName: string;
}

export const WALL_OPTIONS: WallOption[] = [
  { id: "W1", label: "W1", fullName: "Wall 1" },
  { id: "W2", label: "W2", fullName: "Wall 2" },
  { id: "W3R", label: "W3R", fullName: "Wall 3 Right" },
  { id: "W3L", label: "W3L", fullName: "Wall 3 Left" },
];
