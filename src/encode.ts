import { Type } from "./rust-type";
import { Config } from "./config";

export class Encoder {
  buffer: Uint8Array = new Uint8Array(16);
  cursor: number = 0;
  config: Config = new Config();
  constructor(config?: Config) {
    if (config) {
      this.config = config;
    }
  }

  init(size: number = 16): this {
    this.buffer = new Uint8Array(size);
    this.cursor = 0;
    return this;
  }

  encodeAs<Data>(data: Data, type: Type<Data>): Uint8Array {
    type.encode(data, this);
    return this.buffer.slice(0, this.cursor);
  }

  write(size: number): DataView {
    const nextCursor = this.cursor + size;
    const bufferLength = this.buffer.byteLength;
    if (nextCursor > bufferLength) {
      const oldBuffer = this.buffer;
      let newBufferSize = 2 * bufferLength;
      while (newBufferSize <= nextCursor) {
        newBufferSize *= 2;
      }
      this.buffer = new Uint8Array(newBufferSize);
      this.buffer.set(oldBuffer, 0);
      return this.write(size);
    }
    const view = new DataView(this.buffer.buffer, this.cursor, size);
    this.cursor = nextCursor;
    return view;
  }

  writeLength(length: number) {
    this.write(8).setBigUint64(0, BigInt(length), this.config.littleEndian);
  }

  writeVariant(variant: number) {
    this.write(4).setUint32(0, variant, this.config.littleEndian);
  }
}
