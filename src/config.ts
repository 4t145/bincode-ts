export class Config {
  littleEndian: boolean = true;
  fixedArrayLength: boolean = false;
  with_big_endian(): this {
    this.littleEndian = false;
    return this;
  }
  with_little_endian(): this {
    this.littleEndian = true;
    return this;
  }
  write_fixed_array_length(): this {
    this.fixedArrayLength = true;
    return this;
  }
  skip_fixed_array_length(): this {
    this.fixedArrayLength = false;
    return this;
  }
}
