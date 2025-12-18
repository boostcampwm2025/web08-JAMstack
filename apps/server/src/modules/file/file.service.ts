import { Injectable } from '@nestjs/common';
import { Awareness, encodeAwarenessUpdate } from 'y-protocols/awareness';
import { writeUpdate } from 'y-protocols/sync';
import { Doc } from 'yjs';
import { createEncoder, toUint8Array } from 'lib0/encoding';
import { SOCKET_EVENTS } from '@codejam/common';
import { Server, Socket } from 'socket.io';

const PROTOTYPE_ID = 'prototype';

type RoomId = string;
type FileId = string;
export type AwarenessUpdate = {
  added: number[];
  updated: number[];
  removed: number[];
};
export type RoomFile = {
  fileId: FileId;
  roomId: RoomId;
  doc: Doc;
  awareness: Awareness;
};
export type Language = 'javascript' | 'html' | 'css';

@Injectable()
export class FileService {
  private files: Map<FileId, RoomFile> = new Map();
  constructor() {}

  getFile(fileId: FileId): RoomFile | undefined {
    return this.files.get(fileId);
  }

  getSafeFile(fileId: FileId): RoomFile {
    const file = this.getFile(fileId);

    if (!file) {
      throw new Error('file not found');
    }

    return file;
  }

  createFile(server: Server, language: Language, filename: string): RoomFile {
    const payload = {
      fileId: PROTOTYPE_ID,
      roomId: PROTOTYPE_ID,
      filename,
      language,
    };

    const { fileId, roomId } = payload;
    const file = this.getFile(fileId);
    if (file) {
      return file;
    }

    const { doc, awareness } = this.createDoc(
      server,
      PROTOTYPE_ID,
      PROTOTYPE_ID,
      language,
    );
    const result = {
      awareness,
      doc,
      fileId,
      roomId,
    };
    this.files.set(PROTOTYPE_ID, result);

    return result;
  }

  removeFile(server: Server, fileId: FileId): boolean {
    const file = this.getFile(fileId);

    if (!file) {
      return false;
    }

    const { doc, awareness, roomId } = file;
    doc.off('update', this.docListener(server, roomId));
    awareness.off('update', this.awarenessListener(awareness, roomId));

    return this.files.delete(fileId);
  }

  private createDoc(
    server: Server,
    key: string,
    roomId: RoomId,
    language: Language,
  ) {
    const doc = new Doc();
    const yText = doc.getText(key);

    if (yText.length === 0) {
      doc.transact(() => {
        yText.insert(0, this.initialCode(language));
      });
    }

    const awareness = new Awareness(doc);

    doc.on('update', this.docListener(server, roomId));
    awareness.on('update', this.awarenessListener(awareness, roomId));

    return {
      doc,
      awareness,
    };
  }

  private initialCode(language: Language): string {
    switch (language) {
      case 'javascript':
        return "// Write your JavaScript code here\n\nfunction hello() {\n  console.log('Hello, CodeJam!');\n}\n";
      case 'html':
        return '<!-- Write your HTML code here -->\n\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>CodeJam</title>\n  </head>\n  <body>\n    <h1>Hello, CodeJam!</h1>\n  </body>\n</html>\n';
      case 'css':
        return '/* Write your CSS code here */\n\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n';
    }
  }

  private docListener(server: Server, roomId: RoomId) {
    return (update: Uint8Array) => {
      const encoder = createEncoder();
      writeUpdate(encoder, update);
      const code = toUint8Array(encoder);
      server.to(roomId).emit(SOCKET_EVENTS.UPDATE_FILE, { roomId, code });
    };
  }

  private awarenessListener(awareness: Awareness, roomId: RoomId) {
    return ({ added, updated, removed }: AwarenessUpdate, origin: unknown) => {
      const changed = added.concat(updated, removed);
      const message = encodeAwarenessUpdate(awareness, changed);
      if (origin && origin instanceof Socket) {
        origin.to(roomId).emit(SOCKET_EVENTS.ROOM_PTS, {
          roomId,
          message,
        });
      }
    };
  }
}
