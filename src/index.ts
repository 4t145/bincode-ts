import { getI128, getU128, setI128, setU128 } from "./utils";

type IntBitSize = 8 | 16 | 32 | 64 | 128
type FloatBitSize = 16 | 32 | 64 | 128

export class BincodeError extends Error {
    bincodeErrorKind: 'Unimplemented' | 'OverflowLimit' | 'InvalidLength' | 'InvalidVariant' | 'InvalidOptionVariant' | 'InvalidType' | 'BigintOutOfRange';
    constructor(kind: BincodeError['bincodeErrorKind'], message: string,) {
        super(message);
        this.name = 'BincodeError';
        this.bincodeErrorKind = kind;
    }
}

export type PrimitiveTypeMarker = `u${IntBitSize}` | `i${IntBitSize}` | `f${FloatBitSize}` | 'bool' | 'String'

export type CustomType<Value, TypeName extends string> = {
    [TYPE_KIND]: 'custom',
    type: TypeName,
    encode(buffer: ArrayBuffer, value: Value, offset: number, config: BincodeConfig): number,
    decode(buffer: ArrayBuffer, offset: number, config: BincodeConfig): {
        value: Value,
        offset: number
    }
}
export type Type = Never | TypeKindMarker<PrimitiveTypeMarker> | TupleType | ArrayType | StructType | EnumType | OptionType | CollectionType | CustomType<unknown, string>;
export const TYPE_KIND: unique symbol = Symbol('type-kind')
export type TypeKind = 'never' | PrimitiveTypeMarker | 'struct' | 'enum' | 'option' | 'tuple' | 'array' | 'collection' | 'custom'
export type TypeKindMarker<T extends TypeKind> = {
    [TYPE_KIND]: T,
}

export const TypeKindMarker = <T extends TypeKind>(type: T): TypeKindMarker<T> => ({
    [TYPE_KIND]: type,
})

export function isType(obj: unknown): obj is Type {
    return obj !== null &&
        typeof obj === 'object' &&
        (obj as {
            [TYPE_KIND]?: TypeKind
        })[TYPE_KIND] !== undefined;
}

export function isInt(type: Type): type is IntType {
    return type[TYPE_KIND].startsWith('u') || type[TYPE_KIND].startsWith('i');
}
export function isSigned(type: IntType): type is SignedIntType {
    return type[TYPE_KIND].startsWith('i');
}
export type IntType = UnsignedIntType | SignedIntType
export type SignedIntType = TypeKindMarker<`i${IntBitSize}`>
export type UnsignedIntType = TypeKindMarker<`u${IntBitSize}`>
export type Never = TypeKindMarker<'never'>;
/* 
    primitives
*/
export type u8 = TypeKindMarker<'u8'>;
export const u8: u8 = TypeKindMarker('u8');
export type u16 = TypeKindMarker<'u16'>;
export const u16: u16 = TypeKindMarker('u16');
export type u32 = TypeKindMarker<'u32'>;
export const u32: u32 = TypeKindMarker('u32');
export type u64 = TypeKindMarker<'u64'>;
export const u64: u64 = TypeKindMarker('u64');
export type u128 = TypeKindMarker<'u128'>;
export const u128: u128 = TypeKindMarker('u128');
export type i8 = TypeKindMarker<'i8'>;
export const i8: i8 = TypeKindMarker('i8');
export type i16 = TypeKindMarker<'i16'>;
export const i16: i16 = TypeKindMarker('i16');
export type i32 = TypeKindMarker<'i32'>;
export const i32: i32 = TypeKindMarker('i32');
export type i64 = TypeKindMarker<'i64'>;
export const i64: i64 = TypeKindMarker('i64');
export type i128 = TypeKindMarker<'i128'>;
export const i128: i128 = TypeKindMarker('i128');
export type f16 = TypeKindMarker<'f16'>;
export const f16: f16 = TypeKindMarker('f16');
export type f32 = TypeKindMarker<'f32'>;
export const f32: f32 = TypeKindMarker('f32');
export type f64 = TypeKindMarker<'f64'>;
export const f64: f64 = TypeKindMarker('f64');
export type f128 = TypeKindMarker<'f128'>;
export const f128 = TypeKindMarker('f128');
export type bool = TypeKindMarker<'bool'>;
export const bool: bool = TypeKindMarker('bool');
export type String = TypeKindMarker<'String'>;
export const String: String = TypeKindMarker('String');


export type TupleType = Type[] & TypeKindMarker<'tuple'>

export type StructType = {
    [field: string]: Type
} & TypeKindMarker<'struct'>

/**
 * - TupleType: Variant(a, b, c, ...)
 * - StructType: Variant { a, b, c, ... }
 * - null: Variant
 */
export type EnumVariantType = (TupleType | StructType | null)
export const SYMBOL_EXPR: unique symbol = Symbol('expr')
export type Expr<N extends number> = {
    [SYMBOL_EXPR]: N
}
export type EnumVariant<E extends number = number, T extends EnumVariantType = EnumVariantType> = {
    kind: T
} & Expr<E>

export const expr: {
    <N extends number, T extends EnumVariantType>(expr: N, type: T): { kind: T } & Expr<N>
    <N extends number>(expr: N): { kind: null } & Expr<N>
}
    = <N extends number, T extends EnumVariantType>(expr: N, type?: T): { kind: T } & Expr<N> => {
        return {
            [SYMBOL_EXPR]: expr,
            kind: type ?? null as T
        }
    }
/**
 * Creates an enum variant with a specific expression value.
 * 
 * @param expr - The expression value for the variant.
 * @param type - The type of the variant, defaults to Unit if not provided.
 */
export const Variant = expr

export const _ = Variant

export type EnumType = {
    [variant: string]: EnumVariant
} & TypeKindMarker<'enum'>

export type OptionType = {
    optionType: Type
} & TypeKindMarker<'option'>

export type ArrayType = {
    element: Type,
    size: number
} & TypeKindMarker<'array'>

export type CollectionType = {
    element: Type,
} & TypeKindMarker<'collection'>

export type Collection<T extends Type> = {
    element: T,
} & TypeKindMarker<'collection'>

export const Collection = <T extends Type>(element: T): Collection<T> => (
    {
        element,
        ...TypeKindMarker('collection')
    }
)

export type Array<T extends Type, N extends number> = {
    element: T
    size: N
} & TypeKindMarker<'array'>

export const Array = <T extends Type, N extends number>(element: T, size: N): Array<T, N> => ({
    element,
    size,
    ...TypeKindMarker('array')
})

export type Tuple<T extends Type[]> = T & TypeKindMarker<'tuple'>

export const Tuple = <T extends Type[]>(...element: T): Tuple<T> => {
    const elementAsTuple = element as Tuple<T>;
    elementAsTuple[TYPE_KIND] = 'tuple'
    return elementAsTuple
}
export const Unit = Tuple();
export type Enum<T extends {
    [variant: string]: EnumVariant
}> = T & TypeKindMarker<'enum'>


export const Enum = <T extends {
    [variant: string]: EnumVariant
}>(variants: T): Enum<T> => {
    const asEnum = variants as Enum<T>;
    asEnum[TYPE_KIND] = 'enum'
    return asEnum
}

export type Struct<T extends {
    [variant: string]: Type
}> = T & TypeKindMarker<'struct'>

export const Struct = <T extends {
    [variant: string]: Type
}>(fields: T): Struct<T> => {
    const elementAsStruct = fields as Struct<T>;
    elementAsStruct[TYPE_KIND] = 'struct'
    return elementAsStruct
}

export type Result<T extends Type, E extends Type> = Enum<{
    Ok: EnumVariant<0, Tuple<[T]>>,
    Err: EnumVariant<1, Tuple<[E]>>,
}>

export const Result = <T extends Type, E extends Type>(ok: T, err: E): Result<T, E> => Enum({
    Ok: _(0, Tuple(ok)),
    Err: _(1, Tuple(err))
})

export type Option<T extends Type> = OptionType & {
    optionType: T
}

export const Option = <T extends Type>(value: T): Option<T> => (
    {
        optionType: value,
        [TYPE_KIND]: 'option',
    }
)

export const Vec = Collection
export const Set = Collection
export const Map = <K extends Type, V extends Type>(K: K, V: V): Collection<Tuple<[K, V]>> => (Collection(Tuple(K, V)))
export const Bytes = Collection(u8)


export type TupleValue<T extends unknown[]> = {
    [K in Extract<(keyof T), `${number}`>]: Value<T[K]>
} & unknown[]

export type EnumValue<T extends EnumType> = UnionToVariant<EnumValueUnion<T>>

type EnumValueUnion<T extends EnumType> = {
    [K in Extract<(keyof T), string>]: T[K] extends EnumVariant<T[K][typeof SYMBOL_EXPR], infer VT> ? Value<VT> : never
}

type UnionToVariant<T extends {
    [variant: string]: unknown
}> = {
    [K in keyof T]: EnumVariantValue<K, T[K]>;
}[keyof T];

export const VARIANT: unique symbol = Symbol('variant')
export const VALUE: unique symbol = Symbol('value')
export type EnumVariantValue<K, V> = {
    [VALUE]: V,
    [VARIANT]: K
}
export const EnumVariantValue: {
    <K, V>(variant: K, value: V): EnumVariantValue<K, V>
    <K>(variant: K): EnumVariantValue<K, void>
} = <K, V>(variant: K, value?: V) => {
    let asJsonEnumVariant = {
        [VARIANT]: variant,
        [VALUE]: value
    } as EnumVariantValue<K, V>;
    return asJsonEnumVariant
}
export const $ = EnumVariantValue;

export type Value<T> =
    T extends Type ?
    T extends TypeKindMarker<`${'u' | 'i'}${8 | 16 | 32}` | `f${16 | 32 | 64 | 128}`> ? number :
    T extends TypeKindMarker<`${'u' | 'i'}${64}`> ? bigint :
    T extends TypeKindMarker<'bool'> ? boolean :
    T extends TypeKindMarker<'String'> ? string :
    T extends StructType ? {
        [K in (Extract<keyof T, string>)]: Value<T[K]>
    } :
    T extends CollectionType ? Value<T['element']>[] :
    T extends ArrayType ? Value<T['element']>[] & { readonly length: T['size'] } :
    T extends OptionType ? Value<T['optionType']> | null :
    T extends EnumType ? EnumValue<T> :
    T extends unknown[] & TypeKindMarker<"tuple"> ? TupleValue<T> :
    T extends CustomType<infer V, string> ? V :
    never
    : unknown
export type BincodeConfig = {
    endian: 'big' | 'little',
    intEncoding: 'variant' | 'fixed',
    limit?: number
}

export const BincodeConfig = {
    STANDARD: {
        endian: 'little',
        intEncoding: 'variant',
    } as BincodeConfig
} as const;



const U8_MAX = 250;
const U16_FLAG = 251;
const U16_MAX = 0xff_ff;
const U32_FLAG = 252;
const U32_MAX = 0xff_ff_ff_ff;
const I32_MIN = -0x8000_0000;
const U64_FLAG = 253;
const U64_MAX = 0xff_ff_ff_ff_ff_ff_ff_ffn;
const I64_MIN = -0x8000_0000_0000_0000n;
const U128_FLAG = 254;
const U128_MIN = -0x8000_0000_0000_0000_0000_0000_0000_0000n;
const U128_MAX = 0xffff_ffff_ffff_ffff_ffff_ffff_ffff_ffffn;
export const array = <T, N extends number>(...element: T[] & { readonly length: N }): T[] & { readonly length: N } => element
export const decode = <T>(type: T, buffer: ArrayBuffer, offset = 0, config: BincodeConfig = BincodeConfig.STANDARD): {
    value: Value<T>
    offset: number
} => {
    if (config.limit !== undefined && offset >= config.limit) {
        throw new BincodeError('OverflowLimit', `Buffer overflow at offset ${offset}, limit is ${config.limit}`);
    }
    let view = new DataView(buffer);
    const littleEndian = config.endian === 'little';
    const isVariantIntEncoding = config.intEncoding === 'variant';
    function decodeVariantInt(offset: number, view: DataView, type: IntType): {
        value: number | bigint,
        offset: number
    } {
        let flag = view.getUint8(offset);
        offset += 1;
        let zigzagInt: number | bigint;
        if (flag <= U8_MAX) {
            zigzagInt = flag;
        } else if (flag === U16_FLAG) {
            zigzagInt = view.getUint16(offset, littleEndian);
            offset += 2;
        } else if (flag === U32_FLAG) {
            zigzagInt = view.getUint32(offset, littleEndian);
            offset += 4;
        } else if (flag === U64_FLAG) {
            zigzagInt = view.getBigUint64(offset, littleEndian);
            offset += 8;
        } else if (flag === U128_FLAG) {
            zigzagInt = getU128(view, offset, littleEndian);
            offset += 16;
        } else {
            throw new BincodeError('BigintOutOfRange', `Invalid int encoding flag: ${flag}`);
        }
        // unzigzag
        let value: number | bigint = zigzagInt;
        if (isSigned(type)) {
            if (typeof zigzagInt === 'bigint') {
                value = (zigzagInt >> 1n) ^ -(zigzagInt & 1n);
            } else {
                value = (zigzagInt >>> 1) ^ -(zigzagInt & 1);
            }
        }
        return {
            value,
            offset
        };
    }
    let value: Value<T> = undefined as Value<T>;
    if (!isType(type)) {
        throw new BincodeError('InvalidType', `Expected a valid type definition, but got ${type}`);
    }
    if (isVariantIntEncoding && isInt(type) && type[TYPE_KIND] !== 'u8' && type[TYPE_KIND] !== 'i8') {
        return decodeVariantInt(offset, view, type) as {
            value: Value<T>
            offset: number
        }
    }
    switch (type[TYPE_KIND]) {
        case "never":
            throw new BincodeError('InvalidType', 'Cannot decode a value of type "never"');
        case "u8":
            value = view.getUint8(offset) as Value<T>
            offset += 1;
            break
        case "u16":
            value = view.getUint16(offset, littleEndian) as Value<T>
            offset += 2;
            break
        case "u32":
            value = view.getUint32(offset, littleEndian) as Value<T>
            offset += 4;
            break
        case "u64":
            value = view.getBigUint64(offset, littleEndian) as Value<T>
            offset += 8;
            break
        case "u128":
            value = getU128(view, offset, littleEndian) as Value<T>
            offset += 16;
            break
        case "i8":
            value = view.getInt8(offset) as Value<T>
            offset += 1;
            break
        case "i16":
            value = view.getInt16(offset, littleEndian) as Value<T>
            offset += 2;
            break
        case "i32":
            value = view.getInt32(offset, littleEndian) as Value<T>
            offset += 4;
            break
        case "i64":
            value = view.getBigInt64(offset, littleEndian) as Value<T>
            offset += 8;
            break
        case "i128":
            value = getI128(view, offset, littleEndian) as Value<T>
            offset += 16;
            break
        case "f16":
            throw new BincodeError('Unimplemented', 'f16 decoding is not implemented yet');
        case "f32":
            value = view.getFloat32(offset, littleEndian) as Value<T>
            offset += 4;
            break
        case "f64":
            value = view.getFloat64(offset, littleEndian) as Value<T>
            offset += 8;
            break
        case "bool":
            value = (view.getUint8(offset) === 1) as Value<T>
            offset += 1;
            break
        case "String":
            {
                let byteLength: number
                if (isVariantIntEncoding) {
                    const { value, offset: newOffset } = decodeVariantInt(offset, view, u64);
                    offset = newOffset;
                    byteLength = Number(value);
                } else {
                    byteLength = Number(view.getBigUint64(offset, littleEndian));
                    offset += 8;
                }
                const decoder = new TextDecoder();
                value = decoder.decode(new Uint8Array(buffer, offset, Number(byteLength))) as Value<T>
                offset += byteLength;
            }
            break
        case "collection":
            {
                let byteLength: number;
                if (isVariantIntEncoding) {
                    const { value, offset: newOffset } = decodeVariantInt(offset, view, u64);
                    offset = newOffset;
                    byteLength = Number(value);
                } else {
                    byteLength = Number(view.getBigUint64(offset, littleEndian));
                    offset += 8;
                }
                const elementDefinition = type['element'];
                const collection = [] as unknown[];
                for (let index = 0; index < byteLength; index += 1) {
                    const {
                        value: element,
                        offset: elementOffset
                    } = decode<unknown>(elementDefinition, buffer, offset, config);
                    offset = elementOffset
                    collection.push(element)
                }
                value = collection as Value<T>
            }
            break
        case "tuple":
            {
                const tupleDefinition = type as TupleType;
                const tupleValue = [] as unknown[];
                for (const elementDefinition of tupleDefinition) {
                    const {
                        value: element,
                        offset: elementOffset
                    } = decode<unknown>(elementDefinition, buffer, offset, config);
                    offset = elementOffset
                    tupleValue.push(element)
                }
                value = tupleValue as Value<T>
            }
            break
        case "array":
            {
                const arrayDefinition = type as ArrayType;
                const tupleValue = [] as unknown[];
                const elementDefinition = arrayDefinition.element;
                for (let index = 0; index < arrayDefinition.size; index += 1) {
                    const {
                        value: element,
                        offset: elementOffset
                    } = decode<unknown>(elementDefinition, buffer, offset, config);
                    offset = elementOffset
                    tupleValue.push(element)
                }
                value = tupleValue as Value<T>
            }
            break
        case "struct":
            {
                const structDefinition = type as StructType;
                let decodedObject = {} as Record<string, unknown>;
                for (const field of Object.keys(type)) {
                    if (typeof field === 'string') {
                        const type = structDefinition[field];
                        const {
                            value: fieldValue,
                            offset: fieldOffset
                        } = decode<unknown>(type, buffer, offset, config);
                        decodedObject[field] = fieldValue;
                        offset = fieldOffset;
                    }
                }
                value = decodedObject as Value<T>
            }
            break
        case "enum":
            {
                function indexed(e: EnumType): {
                    [index: number]: [Type | null, string]
                } {
                    const indexedDefinition = {} as {
                        [index: number]: [Type | null, string]
                    }
                    for (const variant in e) {
                        if (typeof variant === 'string') {
                            const variantType = e[variant]
                            indexedDefinition[variantType[SYMBOL_EXPR]] = [variantType.kind, variant]
                        }
                    }
                    return indexedDefinition
                }
                const enumDefinition = type as EnumType;
                const indexedDefinition = indexed(enumDefinition);
                let variantIndex
                if (isVariantIntEncoding) {
                    let result = decodeVariantInt(offset, view, u32)
                    offset = result.offset;
                    variantIndex = Number(result.value);
                } else {
                    variantIndex = view.getUint32(offset, littleEndian);
                    offset += 4;
                }
                if (indexedDefinition[variantIndex] == undefined) {
                    throw new BincodeError('InvalidVariant', `Invalid enum variant index: ${variantIndex}`);
                }
                const [variantType, variant] = indexedDefinition[variantIndex];
                if (variantType !== null) {
                    const { value: variantValue, offset: variantOffset } = decode<unknown>(variantType, buffer, offset, config);
                    offset = variantOffset;
                    value = EnumVariantValue(variant, variantValue) as Value<T>
                } else {
                    value = EnumVariantValue(variant) as Value<T>
                }
            }
            break
        case "option":
            {
                const optionDefinition = type as OptionType;
                const variantFlag = view.getUint8(offset);
                offset += 1;
                if (variantFlag === 0) {
                    return {
                        value: null as Value<T>,
                        offset
                    }
                } else if (variantFlag === 1) {
                    return decode<unknown>(optionDefinition.optionType, buffer, offset, config) as {
                        value: Value<T>
                        offset: number
                    }
                } else {
                    throw new BincodeError('InvalidOptionVariant', `Invalid option variant flag: ${variantFlag}`);
                }
            }
        case "custom":
            {
                const customType = type as CustomType<unknown, string>;
                const { value: customValue, offset: customOffset } = customType.decode(buffer, offset, config);
                value = customValue as Value<T>;
                offset = customOffset;
            }
            break
    }
    return {
        value,
        offset,
    }
}

export const encode = <T>(type: T, value: Value<T>, buffer: ArrayBuffer, offset: number = 0, config: BincodeConfig = BincodeConfig.STANDARD): number => {
    if (config.limit !== undefined && offset >= config.limit) {
        throw new BincodeError('OverflowLimit', `Buffer overflow at offset ${offset}, limit is ${config.limit}`);
    }
    let dataView = new DataView(buffer);
    // let offset = 0
    const isLittleEndian = config.endian === 'little';
    const isVariantIntEncoding = config.intEncoding === 'variant';
    function variantIntEncoding(int: number | bigint, dateView: DataView, offset: number, type: IntType): number {
        let zigzagInt
        // zigzag encoding
        if (isSigned(type)) {
            if (typeof int === 'number') {
                if (int === I32_MIN) {
                    zigzagInt = U32_MAX; // Special case for i32 minimum value
                } else {
                    zigzagInt = (int << 1) ^ (int >> 31);
                }
            } else {
                if (type[TYPE_KIND] === 'i64') {
                    if (int === I64_MIN) {
                        zigzagInt = U64_MAX; // Special case for i64 minimum value
                    } else {
                        zigzagInt = (BigInt(int) << 1n) ^ (BigInt(int) >> 63n);
                    }
                } else {
                    if (int === U128_MIN) {
                        zigzagInt = U128_MAX; // Special case for i128 minimum value
                    } else {
                        zigzagInt = (BigInt(int) << 1n) ^ (BigInt(int) >> 127n);
                    }
                }
            }
        } else {
            zigzagInt = int;
        }
        if (zigzagInt < 0) {
            throw new BincodeError('InvalidLength', `Value ${zigzagInt} cannot be negative`);
        } else if (zigzagInt <= U8_MAX) {
            dateView.setUint8(offset, Number(zigzagInt));
            return offset + 1;
        } else if (zigzagInt <= U16_MAX) {
            dataView.setUint8(offset, U16_FLAG);
            offset += 1;
            dataView.setUint16(offset, Number(zigzagInt), isLittleEndian);
            return offset + 2;
        } else if (zigzagInt <= U32_MAX) {
            dataView.setUint8(offset, U32_FLAG);
            offset += 1;
            dataView.setUint32(offset, Number(zigzagInt), isLittleEndian);
            return offset + 4;
        } else if (zigzagInt <= U64_MAX) {
            dataView.setUint8(offset, U64_FLAG);
            offset += 1;
            dataView.setBigUint64(offset, BigInt(zigzagInt), isLittleEndian);
            return offset + 8;
        } else {
            dataView.setUint8(offset, U128_FLAG);
            offset += 1;
            setU128(dataView, offset, BigInt(zigzagInt), isLittleEndian);
            return offset + 16;
        }
    }
    if (!isType(type)) {
        throw new BincodeError('InvalidType', `Expected a valid type definition, but got ${type}`);
    }
    if (isVariantIntEncoding && isInt(type) && type[TYPE_KIND] !== 'u8' && type[TYPE_KIND] !== 'i8') {
        offset = variantIntEncoding(value as number, dataView, offset, type);
        return offset;
    }
    switch (type[TYPE_KIND]) {
        case "u8": {
            dataView.setUint8(offset, value as number);
            offset += 1;
            break
        }
        case "u16": {
            dataView.setUint16(offset, value as number, isLittleEndian);
            offset += 2;
            break
        }
        case "u32": {
            dataView.setUint32(offset, value as number, isLittleEndian);
            offset += 4;
            break
        }
        case "u64": {
            dataView.setBigUint64(offset, value as bigint, isLittleEndian);
            offset += 8;
            break
        }
        case "u128": {
            setU128(dataView, offset, value as bigint, isLittleEndian);
            offset += 16;
            break
        }
        case "i8": {
            dataView.setInt8(offset, value as number);
            offset += 1;
            break
        }
        case "i16": {
            dataView.setInt16(offset, value as number, isLittleEndian);
            offset += 2;
            break
        }
        case "i32": {
            dataView.setInt32(offset, value as number, isLittleEndian);
            offset += 4;
            break
        }
        case "i64": {
            dataView.setBigInt64(offset, value as bigint, isLittleEndian);
            offset += 8;
            break
        }
        case "i128": {
            setI128(dataView, offset, value as bigint, isLittleEndian);
            offset += 16;
            break
        }
        case "f16": {
            throw new BincodeError('Unimplemented', 'f16 encoding is not implemented yet');
        }
        case "f32": {
            dataView.setFloat32(offset, value as number, isLittleEndian);
            offset += 4;
            break
        }
        case "f64": {
            dataView.setFloat64(offset, value as number, isLittleEndian);
            offset += 8;
            break
        }
        case "f128": {
            throw new BincodeError('Unimplemented', 'f128 encoding is not implemented yet');
        }
        case "bool": {
            dataView.setUint8(offset, value as number);
            offset += 1;
            break
        }
        case "String": {
            const encoder = new TextEncoder();
            const encoded = encoder.encode(value as string);
            if (isVariantIntEncoding) {
                offset = variantIntEncoding(encoded.byteLength, dataView, offset, u64);
            } else {
                dataView.setBigUint64(offset, BigInt(encoded.byteLength), isLittleEndian);
                offset += 8;
            }
            new Uint8Array(buffer).set(encoded, offset);
            offset += encoded.byteLength;
            break
        }
        case "tuple": {
            const tupleType = type as TupleType;
            const tupleValue = value as TupleValue<typeof tupleType>;
            if (tupleType.length === 1) {
                offset = encode<unknown>(tupleType[0], tupleValue, buffer, offset, config)
            } else {
                for (let index = 0; index < tupleType.length; index += 1) {
                    offset = encode<unknown>(tupleType[index], tupleValue[index], buffer, offset, config)
                }
            }
            break
        }
        case "array": {
            const arrayType = type as ArrayType;
            const arrayValue = value as unknown[];
            for (let index = 0; index < arrayType.size; index += 1) {
                offset = encode<unknown>(arrayType.element, arrayValue[index], buffer, offset, config)
            }
            break
        }
        case "struct": {
            const structType = type as StructType;
            const structValue = value as Record<string, unknown>;
            for (const field in structType) {
                offset = encode<unknown>(structType[field], structValue[field], buffer, offset, config)
            }
            break
        }
        case "enum": {
            const enumType = type as EnumType;
            const enumValue = value as EnumValue<typeof enumType>;
            const variantIndex = enumType[enumValue[VARIANT]][SYMBOL_EXPR];
            const variantValue = enumValue[VALUE];
            if (isVariantIntEncoding) {
                offset = variantIntEncoding(variantIndex, dataView, offset, u32);
            } else {
                dataView.setUint32(offset, variantIndex, isLittleEndian);
                offset += 4;
            }
            const variant = enumType[enumValue[VARIANT]];
            if (variant.kind !== null) {
                offset = encode<unknown>(variant.kind, variantValue, buffer, offset, config)
            }
            break
        }
        case "option": {
            const optionType = type as OptionType;
            if (value === null || value === undefined) {
                dataView.setUint8(offset, 0);
                offset += 1;
            } else {
                dataView.setUint8(offset, 1);
                offset += 1;
                offset = encode<unknown>(optionType.optionType, value as unknown, buffer, offset, config);
            }
            break
        }
        case "collection": {
            const collectionType = type as CollectionType;
            const collectionValue = value as unknown[];
            if (isVariantIntEncoding) {
                offset = variantIntEncoding(collectionValue.length, dataView, offset, u64);
            } else {
                dataView.setBigUint64(offset, BigInt(collectionValue.length), isLittleEndian);
                offset += 8;
            }
            for (const element of collectionValue) {
                offset = encode<unknown>(collectionType.element, element, buffer, offset, config)
            }
            break
        }
        case "custom": {
            const customType = type as CustomType<unknown, string>;
            offset = customType.encode(buffer, value, offset, config);
            break
        }
    }
    return offset
}


export abstract class CustomTypeClass<V, S extends string> implements CustomType<V, S> {
    readonly [TYPE_KIND]: 'custom' = 'custom' as const;
    readonly abstract type: S;

    abstract encode(buffer: ArrayBuffer, value: V, offset: number, config: BincodeConfig): number;
    abstract decode(buffer: ArrayBuffer, offset: number, config: BincodeConfig): { value: V, offset: number };
}

// test
