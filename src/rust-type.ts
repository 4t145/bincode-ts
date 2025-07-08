import { Decoder } from "./decode";
import { Encoder } from "./encode";
import { EnumData, Variant } from "./enum-data";

/**
 * Type Defination of Rust Types
 */
export interface Type<Data = any> {
  decode(decoder: Decoder): Data;
  encode(data: Data, encoder: Encoder): void;
}

//#region Primitive Types
export const bool: Type<boolean> = {
  decode: (decoder: Decoder): boolean => {
    const result = Boolean(decoder.read(1).getUint8(0));
    return result;
  },
  encode: (data: boolean, encoder: Encoder): void => {
    encoder.write(1).setUint8(0, Number(data));
  },
};

export const i8: Type<number> = {
  decode: (decoder: Decoder): number => {
    const result = decoder.read(1).getInt8(0);
    return result;
  },
  encode: (data: number, encoder: Encoder): void => {
    encoder.write(1).setInt8(0, data);
  },
};

export const u8: Type<number> = {
  decode: (decoder: Decoder): number => {
    const result = decoder.read(1).getUint8(0);
    return result;
  },
  encode: (data: number, encoder: Encoder): void => {
    encoder.write(1).setUint8(0, data);
  },
};

export const i16: Type<number> = {
  decode: (decoder: Decoder): number => {
    const result = decoder.read(2).getInt16(0, decoder.config.littleEndian);
    return result;
  },
  encode: (data: number, encoder: Encoder): void => {
    encoder.write(2).setInt16(0, data, encoder.config.littleEndian);
  },
};

export const u16: Type<number> = {
  decode: (decoder: Decoder): number => {
    const result = decoder.read(2).getUint16(0, decoder.config.littleEndian);
    return result;
  },
  encode: (data: number, encoder: Encoder): void => {
    encoder.write(2).setUint16(0, data, encoder.config.littleEndian);
  },
};

export const i32: Type<number> = {
  decode: (decoder: Decoder): number => {
    const result = decoder.read(4).getInt32(0, decoder.config.littleEndian);
    return result;
  },
  encode: (data: number, encoder: Encoder): void => {
    encoder.write(4).setInt32(0, data, encoder.config.littleEndian);
  },
};

export const u32: Type<number> = {
  decode: (decoder: Decoder): number => {
    const result = decoder.read(4).getUint32(0, decoder.config.littleEndian);
    return result;
  },
  encode: (data: number, encoder: Encoder): void => {
    encoder.write(4).setUint32(0, data, encoder.config.littleEndian);
  },
};

export const u64: Type<bigint> = {
  decode: (decoder: Decoder): bigint => {
    const result = decoder.read(8).getBigUint64(0, decoder.config.littleEndian);
    return result;
  },
  encode: (data: bigint, encoder: Encoder): void => {
    encoder.write(8).setBigUint64(0, data, encoder.config.littleEndian);
  },
};

export const i64: Type<bigint> = {
  decode: (decoder: Decoder): bigint => {
    const result = decoder.read(8).getBigUint64(0, decoder.config.littleEndian);
    return result;
  },
  encode: (data: bigint, encoder: Encoder): void => {
    encoder.write(8).setBigInt64(0, data, encoder.config.littleEndian);
  },
};

export const f32: Type<number> = {
  decode: (decoder: Decoder): number => {
    const result = decoder.read(4).getFloat32(0, decoder.config.littleEndian);
    return result;
  },
  encode: (data: number, encoder: Encoder): void => {
    encoder.write(4).setFloat32(0, data, encoder.config.littleEndian);
  },
};

export const f64: Type<number> = {
  decode: (decoder: Decoder): number => {
    const result = decoder.read(8).getFloat64(0, decoder.config.littleEndian);
    return result;
  },
  encode: (data: number, encoder: Encoder): void => {
    encoder.write(8).setFloat64(0, data, encoder.config.littleEndian);
  },
};

export const empty: Type<undefined> = {
  decode: (): undefined => {
    return;
  },
  encode: (): void => {},
};

//#endregion

//#region Compound Types
type TypeEntries<T extends Record<string, any>> = T extends any ?{
  [K in keyof T]: [K, Type<T[K]>];
}[keyof T][] : never;
/**
 * generate a rust struct type
 * @param fields fields of struct, the key is field name and the value is type defination
 * @returns generated struct
 */
export function Struct<Data extends Record<string, any>>(
  fields: TypeEntries<Data>
): Type<Data> {
  // dedup
  const map = new Map(fields)
  return {
    decode(buffer: Decoder): Data {
      const result: Record<string, any> = {};
      for (const [field, type] of map.entries()) {
        result[field] = type.decode(buffer);
      }
      return result as Data;
    },
    encode(data: Record<string, any>, encoder: Encoder): void {
      for (const [field, type] of map.entries()) {
        type.encode(data[field], encoder);
      }
    },
  };
}

type TypeProps<T> = T extends any ? {
  [Property in keyof T]: Type<T[Property]>;
} : never ;

/**
 * generate a rust tuple type
 * @param elements an array of types
 * @returns generated tuple
 */
export function Tuple<DataTulpe extends Array<any>>(
  elements: TypeProps<DataTulpe>
): Type<DataTulpe> {
  return {
    decode(buffer: Decoder): DataTulpe {
      const result: Array<any> = [];
      for (const type of elements) {
        result.push(type.decode(buffer));
      }
      return result as DataTulpe;
    },
    encode(data: DataTulpe, encoder: Encoder): void {
      for (const [idx, type] of elements.entries()) {
        type.encode(data[idx], encoder);
      }
    },
  };
}

type TypeEnumDatas<UnionType extends EnumData> = UnionType extends any
  ? { [Variant in UnionType['variant']] : Type<UnionType['data']>}
  : never; 
/**
 * generate a rust enum type
 * @param variants enum defination，has a type of `Record<number, Type>`
 * @returns generated enum
 */
export function Enum<Data extends EnumData>(
  variants: TypeEnumDatas<Data>
): Type<Data> {
  return {
    decode(decoder: Decoder): {
      variant: number;
      data: any;
    } {
      const variant = decoder.readVariant();
      const type = variants[variant];
      const data = type.decode(decoder);
      return {
        variant,
        data,
      };
    },
    encode(enumData: Data, encoder: Encoder): void {
      const { variant, data } = enumData;
      encoder.writeVariant(variant);
      const type = variants[variant];
      type.encode(data, encoder);
    },
  } as Type<Data>;
}
//#endregion

//#region Collections
export function Arr<Data = any>(
  T: Type<Data>,
  length: number
): Type<Array<Data>> {
  return {
    decode(decoder: Decoder): Array<Data> {
      if (decoder.config.fixedArrayLength) {
        length = decoder.readLength();
      }
      const result = new Array(length);
      for (let idx = 0; idx < length; idx += 1) {
        result[idx] = T.decode(decoder);
      }
      return result;
    },

    encode(data: Data[], encoder: Encoder): void {
      if (encoder.config.fixedArrayLength) {
        encoder.writeLength(length);
      }
      for (const dataItem of data) {
        T.encode(dataItem, encoder);
      }
    },
  };
}

export const Str: Type<string> = {
  decode: (decoder: Decoder): string => {
    const stringLength = decoder.readLength();
    const textDecoder = new TextDecoder();
    const result = textDecoder.decode(decoder.read(stringLength));
    return result;
  },
  encode: function (data: string, encoder: Encoder): void {
    const bytes = new TextEncoder().encode(data);
    const length = bytes.length;
    encoder.writeLength(length);
    const view = encoder.write(length);
    for (const [idx, byte] of bytes.entries()) {
      view.setUint8(idx, byte);
    }
  },
};

export function Vec<Data = any>(T: Type<Data>): Type<Array<Data>> {
  return {
    decode(decoder): Array<any> {
      const length = decoder.readLength();
      const result = new Array(length);
      for (let idx = 0; idx < length; idx += 1) {
        result[idx] = T.decode(decoder);
      }
      return result;
    },
    encode(data, encoder) {
      const length = data.length;
      encoder.writeLength(length);
      for (const dataItem of data) {
        T.encode(dataItem, encoder);
      }
    },
  };
}

export function HashMap<DataK = any, DataV = any>(
  K: Type<DataK>,
  V: Type<DataV>
): Type<Map<DataK, DataV>> {
  return {
    decode(decoder): Map<DataK, DataV> {
      const map = new Map<DataK, DataV>();
      const length = decoder.readLength();
      for (let idx = 0; idx < length; idx += 1) {
        const key = K.decode(decoder);
        const value = V.decode(decoder);
        map.set(key, value);
      }
      return map;
    },
    encode(data, encoder) {
      const length = data.size;
      encoder.writeLength(length);
      for (const [key, value] of data.entries()) {
        K.encode(key, encoder);
        V.encode(value, encoder);
      }
    },
  };
}

export function HashSet<DataK = any>(K: Type<DataK>): Type<Set<DataK>> {
  return {
    decode(decoder: Decoder): Set<DataK> {
      const set = new Set<DataK>();
      const length = decoder.readLength();
      for (let idx = 0; idx < length; idx += 1) {
        const key = K.decode(decoder);
        set.add(key);
      }
      return set;
    },
    encode(data, encoder) {
      const length = data.size;
      encoder.writeLength(length);
      for (const key of data) {
        K.encode(key, encoder);
      }
    },
  };
}
//#endregion

//#region Option and Result
export const Option = <DataT = any>(T: Type<DataT>) =>
  Enum<Variant<0> | Variant<1, DataT>>([empty, T]);
export function None(): Variant<0> {
  return {
    variant: 0,
    data: undefined,
  };
}
export function Some<Data>(data: Data): Variant<1, Data> {
  return {
    variant: 1,
    data,
  };
}

export const Result = <DataT = any, DataE = any>(
  T: Type<DataT>,
  E: Type<DataE>
) => Enum<Variant<0, DataT> | Variant<1, DataE>>([T, E]);

export function Ok<Data>(data: Data): Variant<0, Data> {
  return {
    variant: 0,
    data,
  };
}

export const Err = Some;
//#endregion
