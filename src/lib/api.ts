import { Cabinet, DocumentType, FlatShelf, Folder, Magazine, RecordFile, SearchResult, TrashItem } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function fetchCabinets(): Promise<Cabinet[]> {
  const res = await fetch(`${API_BASE}/api/cabinets`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch cabinets");
  return res.json();
}

export async function fetchCabinet(id: number): Promise<Cabinet> {
  const res = await fetch(`${API_BASE}/api/cabinets/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch cabinet");
  return res.json();
}

export async function fetchFlatShelves(): Promise<FlatShelf[]> {
  const res = await fetch(`${API_BASE}/api/cabinets/flat-shelves`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch flat shelves");
  return res.json();
}

export async function fetchDocumentTypes(): Promise<DocumentType[]> {
  const res = await fetch(`${API_BASE}/api/documenttypes`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch document types");
  return res.json();
}

export async function createDocumentType(data: { name: string; description: string; fieldsJson: string }): Promise<DocumentType> {
  const res = await fetch(`${API_BASE}/api/documenttypes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to create document type");
  }
  return res.json();
}

export async function searchArchive(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) return [];
  const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to search");
  return res.json();
}

export async function createFile(payload: {
  code: string;
  title: string;
  documentTypeId?: number;
  metadataJson: string;
  magazineId?: number;
  shelfId?: number;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentsJson?: string;
}): Promise<RecordFile> {
  const res = await fetch(`${API_BASE}/api/files`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to create file");
  }
  return res.json();
}

export async function updateFile(id: number, payload: {
  code: string;
  title: string;
  documentTypeId?: number;
  metadataJson: string;
  magazineId?: number;
  shelfId?: number;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentsJson?: string;
}): Promise<RecordFile> {
  const res = await fetch(`${API_BASE}/api/files/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to update file");
  }
  return res.json();
}

export async function deleteFile(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/files/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete file");
}

export async function moveFile(id: number, target: { targetShelfId?: number; targetMagazineId?: number; orderIndex?: number }): Promise<RecordFile> {
  const res = await fetch(`${API_BASE}/api/files/${id}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(target)
  });
  if (!res.ok) throw new Error("Failed to move file");
  return res.json();
}

export async function moveMagazine(id: number, target: { targetShelfId?: number; orderIndex?: number }): Promise<Magazine> {
  const res = await fetch(`${API_BASE}/api/magazines/${id}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(target)
  });
  if (!res.ok) throw new Error("Failed to move magazine");
  return res.json();
}

export async function moveFolder(id: number, target: { targetShelfId?: number; orderIndex?: number }): Promise<Folder> {
  const res = await fetch(`${API_BASE}/api/folders/${id}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(target)
  });
  if (!res.ok) throw new Error("Failed to move folder");
  return res.json();
}

export async function reorderShelfItems(
  shelfId: number,
  items: Array<{ type: "Magazine" | "Folder" | "File"; id: number; orderIndex: number }>
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/cabinets/shelves/${shelfId}/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to reorder shelf items");
  }
}

export async function createMagazine(payload: {
  name: string;
  code: string;
  colorHex: string;
  shelfId: number;
}): Promise<Magazine> {
  const res = await fetch(`${API_BASE}/api/magazines`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to create magazine");
  }
  return res.json();
}

export async function updateMagazine(id: number, payload: {
  name: string;
  code: string;
  colorHex: string;
  shelfId: number;
}): Promise<Magazine> {
  const res = await fetch(`${API_BASE}/api/magazines/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to update magazine");
  }
  return res.json();
}

export async function deleteMagazine(id: number, deleteContents: boolean = true): Promise<void> {
  const res = await fetch(`${API_BASE}/api/magazines/${id}?deleteContents=${deleteContents}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete magazine");
}

export async function createFolder(payload: {
  name: string;
  code: string;
  colorHex: string;
  shelfId: number;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentsJson?: string;
}): Promise<Folder> {
  const res = await fetch(`${API_BASE}/api/folders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to create folder");
  }
  return res.json();
}

export async function updateFolder(id: number, payload: {
  name: string;
  code: string;
  colorHex: string;
  shelfId: number;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentsJson?: string;
}): Promise<Folder> {
  const res = await fetch(`${API_BASE}/api/folders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to update folder");
  }
  return res.json();
}

export async function deleteFolder(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/folders/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete folder");
}

export async function uploadAttachment(file: globalThis.File): Promise<{ url: string; fileName: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/attachments/upload`, {
    method: "POST",
    body: formData
  });
  if (!res.ok) throw new Error("Failed to upload file");
  return res.json();
}

export function getFileUrl(path?: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

// Trash API Endpoints
export async function fetchTrash(): Promise<TrashItem[]> {
  const res = await fetch(`${API_BASE}/api/trash`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch trash");
  return res.json();
}

export async function restoreTrashItem(type: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/trash/restore/${type}/${id}`, {
    method: "POST"
  });
  if (!res.ok) throw new Error("Failed to restore item");
}

export async function permanentlyDeleteTrashItem(type: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/trash/permanent/${type}/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to permanently delete item");
}

export async function emptyTrash(): Promise<void> {
  const res = await fetch(`${API_BASE}/api/trash/empty`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to empty trash");
}
