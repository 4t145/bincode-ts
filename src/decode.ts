import { Type } from "./rust-type";
import { Config } from "./config";

export class Decoder {
  buffer: ArrayBuffer = new ArrayBuffer(0);
  cursor: number = 0;
  config: Config = new Config();
  constructor(config?: Config) {
    if (config) {
      this.config = config;
    }
  }

  load(buffer: ArrayBuffer): this {
    this.cursor = 0;
    if (buffer instanceof ArrayBuffer) {
      this.buffer = buffer;
    }
    return this;
  }

  decodeAs<Data = any>(type: Type<Data>): Data {
    return type.decode(this);
  }

  read(size: number): DataView {
    const nextCursor = this.cursor + size;
    const view = new DataView(this.buffer, this.cursor, size);
    this.cursor = nextCursor;
    return view;
  }

  readLength(): number {
    const length = Number(
      this.read(8).getBigUint64(0, this.config.littleEndian)
    );
    return length;
  }

  readVariant(): number {
    const length = this.read(4).getUint32(0, this.config.littleEndian);
    return length;
  }
}
