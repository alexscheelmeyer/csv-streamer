import { Transform } from "node:stream";

export interface CSVReaderOptions {
  delimiter?: "," | (string & {});
  headers?: boolean;
  readableObjectMode?: boolean;
}

class CSVReader extends Transform {
  options: CSVReaderOptions;
  buffer: string;
  queue: string[];
  headers: unknonw[] | null;
  Item: Record<string, string>;
  firstWrite: boolean;
  lineCount: 0;

  constructor(options?: CSVReaderOptions): CSVReader;

  addToQueue(lines: string[], callback: (line: null) => void): void;
  emitLine(line: string, callback: (error: string | null) => void): void;
}

export class Reader extends CSVReader {}

export declare function load(filename: string, options?: CSVReaderOptions): Promise<Array<Record<string, string>>>;

export declare function save(
  filename: string,
  data: Array<Record<string, string>>,
  keys?: Array<string>
): Promise<void>;

export declare function writeLine(out: string, keys: Array<string>, data?: Record<string, string>): boolean;
