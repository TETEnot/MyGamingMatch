declare module 'formidable' {
  import { IncomingMessage } from 'http';

  export class IncomingForm {
    parse(req: IncomingMessage, callback: (err: Error | null, fields: Fields, files: Files) => void): void;
  }

  export interface File {
    filepath: string;
    newFilename: string;
    type: string;
  }

  export interface Fields {
    [key: string]: string | string[];
  }

  export interface Files {
    [key: string]: File | File[];
  }
}
