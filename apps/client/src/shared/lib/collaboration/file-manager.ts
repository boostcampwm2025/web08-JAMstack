import { Doc as YDoc, Map as YMap } from 'yjs';
import { v7 as uuidv7 } from 'uuid';
import {
  DEFAULT_DOC_TITLE,
  DEFAULT_LANGUAGE,
  getDefaultFileName,
  getDefaultFileTemplate,
  type FileType,
} from '@codejam/common';
import { FileNode } from './file-node';

export interface DocMetadata {
  title: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  type: FileType;
}

export class FileManager {
  private yDoc: YDoc;
  private files: YMap<YMap<unknown>>;
  private names: YMap<string>;
  private meta: YMap<unknown>;

  constructor(yDoc: YDoc) {
    this.yDoc = yDoc;

    // Initialize Y.Doc structure
    this.files = yDoc.getMap('files'); // Y.Map<fileId, Y.Map<name, Y.Text>>
    this.names = yDoc.getMap('names'); // File name -> File Id tracking
    this.meta = yDoc.getMap('meta'); // Y.Doc Metadata
  }

  private generateId(): string {
    return uuidv7();
  }

  getYDoc(): YDoc {
    return this.yDoc;
  }

  getFilesMap(): YMap<YMap<unknown>> {
    return this.files;
  }

  getFileNamesMap(): YMap<string> {
    return this.names;
  }

  /**
   * Get the document metadata
   */
  getDocMetadata(): DocMetadata {
    const data = { title: this.getTitle() };
    return data;
  }

  /**
   * Register a callback when document metadata changes
   * Triggers on: title changes and other document-level metadata updates
   */
  onDocMetadataChange(callback: () => void): void {
    this.meta.observe(() => callback());
  }

  /**
   * Get the document title
   * Returns empty string if no title is set
   */
  getTitle(): string {
    const title = this.meta.get('title') as string;
    return title ?? '';
  }

  /**
   * Set the document title
   */
  setTitle(title: string): void {
    this.meta.set('title', title);
  }

  /**
   * Register a callback when file change occurs
   * Triggers on: file add, remove, rename, and content changes
   * Use this when you need to track all changes including content edits
   */
  onFilesChange(callback: () => void): void {
    this.files.observeDeep(() => callback());
  }

  /**
   * Register a callback when file metadata changes
   * Triggers on: file add, remove, rename
   * Use this for UI file lists to avoid overhead from content edits
   */
  onFilesMetadataChange(callback: () => void): void {
    this.files.observeDeep((events) => {
      const hasMetaChange = events.some((event) => event.path.length <= 1);
      if (!hasMetaChange) return;
      callback();
    });
  }

  /**
   * Check if a file with the given name exists
   */
  hasFile(fileName: string): boolean {
    if (!this.names) return false;
    return this.names.has(fileName);
  }

  /**
   * Initializes the document with a default file if needed
   * Creates a default file only if:
   * - No files exist
   * - Document has not been previously initialized
   */
  initializeDefaultFile(): string | null {
    let fileId: string | null = null;

    const language = DEFAULT_LANGUAGE;
    const name = getDefaultFileName(language);
    const template = getDefaultFileTemplate(language);

    this.yDoc.transact(() => {
      // Create if empty and not previously initialized
      const isInitialized = this.meta.get('initialized');
      if (this.files.size > 0 || isInitialized) return null;

      // Initialize Y.Doc metadata
      this.meta.set('title', DEFAULT_DOC_TITLE);

      // Create default file
      fileId = this.createFile(name, template);

      // Mark doc as initialized to prevent recreation after deletion
      this.meta.set('initialized', true);
    });

    return fileId;
  }

  createFile(name: string, content?: string, type: FileType = 'text'): string {
    const fileId = this.generateId();

    this.yDoc.transact(() => {
      const file = FileNode.create(fileId, name, content, type);
      this.files.set(fileId, file);
      this.names.set(name, fileId);
    });

    return fileId;
  }

  deleteFile(fileId: string): void {
    const node = this.getFileNode(fileId);
    if (!node) return;

    const fileName = node.name;
    if (!fileName) return;

    this.yDoc.transact(() => {
      this.files.delete(fileId);
      this.names.delete(fileName);
    });
  }

  renameFile(fileId: string, newName: string): void {
    const node = this.getFileNode(fileId);
    if (!node) return;

    const oldName = node.name;

    // Check if new name already exists
    if (!oldName || this.hasFile(newName)) {
      return;
    }

    this.yDoc.transact(() => {
      node.name = newName;
      this.names.delete(oldName);
      this.names.set(newName, fileId);
    });
  }

  overwriteFile(fileId: string, text: string, type?: FileType): void {
    const node = this.getFileNode(fileId);
    if (!node) return;

    this.yDoc.transact(() => {
      node.text = text;
      if (type) node.type = type;
    });
  }

  getFileNode(fileId: string): FileNode | null {
    const file = this.files.get(fileId);
    return file ? new FileNode(file) : null;
  }

  getFileId(name: string): string | null {
    const fileId = this.names.get(name);
    return fileId ?? null;
  }

  getFileName(fileId: string): string | null {
    const node = this.getFileNode(fileId);
    return node ? node.name : null;
  }

  getFileContent(fileId: string): string | null {
    const node = this.getFileNode(fileId);
    if (!node) return null;

    return node.text;
  }

  getFileType(fileId: string): FileType | null {
    const node = this.getFileNode(fileId);
    return node ? node.type : null;
  }

  getFileTree(): FileMetadata[] {
    const result: FileMetadata[] = [];

    this.files.forEach((file) => {
      const node = new FileNode(file);
      const metadata = node.getMetadata();
      result.push(metadata);
    });

    return result;
  }

  getTotalCapacity(): number {
    let total = 0;

    this.files.forEach((file) => {
      const node = new FileNode(file);
      total += node.capacity;
    });

    return total;
  }
}
