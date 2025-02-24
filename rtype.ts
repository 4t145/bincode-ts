type IntBitSize = 8 | 16 | 32 | 64 | 128
type FloatBitSize = 16 | 32 | 64 | 128
export type PrimitiveTypeMarker = `u${IntBitSize}` | `i${IntBitSize}` | `f${FloatBitSize}` | 'bool' | 'String'

// layout: 1. primitive 2. sum type, 3. product type, 4. collection type
// primitive type: u8, i8, u16, i16, u32, i32, u64, i64, f32, f64, bool, String
// sum type: enum
// product type: struct, tuple, array
// collection type: vec, set, map, ...etc

export type LayoutType = 'array' | 'sum' | 'product' | 'collection' | 'primitive' | 'unit'
export const SYMBOL_LAYOUT: unique symbol = Symbol('layout')
export type LayoutMarker<T extends LayoutType> = {
    [SYMBOL_LAYOUT]: T
}
export type Layout = SumLayout | ProductLayout | PrimitiveLayout | UnitLayout

export type SumLayout = {
    [key: number]: Layout
} & LayoutMarker<'sum'>

export type ProductLayout = Layout[] & LayoutMarker<'product'>
export type ArrayLayout = {
    element: Layout
    size: number
} & LayoutMarker<'array'>
export type CollectionLayout = Layout & LayoutMarker<'collection'>
export type PrimitiveLayout = PrimitiveTypeMarker & LayoutMarker<'primitive'>
export type UnitLayout = LayoutMarker<'unit'>


export type View<L extends Layout> = {
    layout: L
    bytes: Uint8Array
}


export type UnitTypeMarker = 'unit'
export type Type = TypeKindMarker<UnitTypeMarker> | TypeKindMarker<PrimitiveTypeMarker> | TupleType | ArrayType | StructType | EnumType | CollectionType;
export const TYPE_KIND: unique symbol = Symbol('type-kind')
export type TypeKind = UnitTypeMarker | PrimitiveTypeMarker | 'struct' | 'enum' | 'tuple' | 'array' | 'collection'
export type TypeKindMarker<T extends TypeKind> = {
    [TYPE_KIND]: T
}

export const TypeKindMarker = <T extends TypeKind>(type: T): TypeKindMarker<T> => ({
    [TYPE_KIND]: type
})

/* 
    unit
*/

export type Unit = TypeKindMarker<UnitTypeMarker>;
export const Unit = TypeKindMarker('unit');

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

export type EnumVariantType = (Unit | TupleType | StructType)
export const SYMBOL_EXPR: unique symbol = Symbol('expr')
export type Expr<N extends number> = {
    [SYMBOL_EXPR]: N
}
export type EnumVariant<E extends number = number, T extends EnumVariantType = EnumVariantType> = (T) & Expr<E>

export const expr: {
    <N extends number, T extends EnumVariantType>(expr: N, type: T): T & Expr<N>
    <N extends number>(expr: N): Unit & Expr<N>
}
    = <N extends number, T extends EnumVariantType>(expr: N, type?: T): T & Expr<N> => {
        const asVariant = (type ?? Unit) as T & Expr<N>;
        if (expr !== undefined) {
            asVariant[SYMBOL_EXPR] = expr
        }
        return asVariant
    }

export const Variant = expr
export const _ = expr

export type EnumType = {
    [variant: string]: EnumVariant
} & TypeKindMarker<'enum'>


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

export type Option<T extends Type> = Enum<{
    Some: EnumVariant<0, Tuple<[T]>>,
    None: EnumVariant<1, Unit>,
}>

export const Option = <T extends Type>(value: T): Option<T> => Enum({
    Some: _(0, Tuple(value)),
    None: _(1)
})

export const Vec = Collection
export const Set = Collection
export const Map = <K extends Type, V extends Type>(K: K, V: V): Collection<Tuple<[K, V]>> => (Collection(Tuple(K, V)))
export const Bytes = Collection(u8)


/* 
    RustType To Layout
*/

type RustLayout<T extends Type> =
    T extends Unit ? UnitLayout :
    T extends TypeKindMarker<infer P extends PrimitiveTypeMarker> ? LayoutMarker<'primitive'> & P :
    T extends StructType ? ProductLayout :
    T extends TupleType ? ProductLayout :
    T extends EnumType ? SumLayout :
    T extends ArrayType ? ArrayLayout :
    T extends CollectionType ? CollectionLayout :
    never



type TupleValue<T extends Type[]> =
    T extends [infer First, ...infer Tail] ?
    First extends Type ?
    Tail extends Type[] ?
    [Value<First>, ...TupleValue<Tail>] :
    never :
    never :
    T extends [infer First] ?
    First extends Type ?
    [Value<First>] :
    never :
    never

type EnumValue<T extends EnumType> = UnionToVariant<EnumValueUnion<T>>

type EnumValueUnion<T extends EnumType> = {
    [K in Extract<(keyof T), string>]: Value<T[K]>
}

type UnionToVariant<T extends {
    [variant: string]: any
}> = {
    [K in keyof T]: EnumVariantValue<K, T[K]>;
}[keyof T];

export const VARIANT: unique symbol = Symbol('variant')
export type JsonEnumVariant<K> = {
    [VARIANT]: K
}
export type EnumVariantValue<K, V> = V & JsonEnumVariant<K>
export const EnumVariantValue = <K, V>(variant: K, value: V): EnumVariantValue<K, V> => {
    let asJsonEnumVariant = {
        [VARIANT]: variant,
        ...value
    } as EnumVariantValue<K, V>;
    asJsonEnumVariant[VARIANT] = variant;
    return asJsonEnumVariant
}
export const $ = EnumVariantValue;
export type Value<T extends Type> =
    T extends Unit ? {} :
    T extends TypeKindMarker<`${'u' | 'i'}${8 | 16 | 32}` | `f${16 | 32 | 64 | 128}`> ? number :
    T extends TypeKindMarker<`${'u' | 'i'}${64}`> ? bigint :
    T extends TypeKindMarker<'bool'> ? boolean :
    T extends TypeKindMarker<'String'> ? string :
    T extends StructType ? {
        [K in (Extract<keyof T, string>)]: Value<T[K]>
    } :
    T extends TupleType ?
    T extends [infer First] ?
    First extends Type ?
    Value<First> :
    never :
    TupleValue<T> :
    T extends EnumType ? EnumValue<T> :
    T extends CollectionType ? Value<T['element']>[] :
    T extends ArrayType ? Value<T['element']>[] & { length: T['size'] } :
    never


const ResultInJson: Value<Result<u32, String>> = $("Ok", 10);





type BincodeConfig = {
    endian: 'big' | 'little',
    int_encoding: 'variant' | 'fixed',
    limit?: number
}
const STANDARD: BincodeConfig = {
    endian: 'little',
    int_encoding: 'fixed',
}
export const decode = <T extends Type>(definition: T, bytes: ArrayBuffer, config: BincodeConfig = STANDARD): {
    value: Value<T>
    offset: number
} => {
    let view = new DataView(bytes);
    const littleEndian = config.endian === 'little';
    let value: Value<T> = {} as Value<T>;
    let offset = 0;
    switch (definition[TYPE_KIND]) {
        case "unit":
            value = {} as Value<T>
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
            throw ("not supported yet")
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
            throw ("not supported yet")
        case "f16":
            throw ("not supported yet")
        case "f32":
            value = view.getFloat32(offset, littleEndian) as Value<T>
            offset += 4;
            break
        case "f64":
            value = view.getFloat64(offset, littleEndian) as Value<T>
            offset += 8;
            break
        case "bool":
            value = (view.getUint8(offset) === 0) as Value<T>
            offset += 1;
            break
        case "String":
            {
                const byteLength = Number(view.getBigUint64(offset, littleEndian));
                const decoder = new TextDecoder();
                value = decoder.decode(new Uint8Array(bytes, 8, Number(byteLength))) as Value<T>
                offset += byteLength;
            }
            break
        case "collection":
            {
                const byteLength = Number(view.getBigUint64(0, littleEndian));
                offset += 8;
                const elementDefinition = definition['element'];
                const collection = [] as Value<Type>[];
                for (let index = 0; index < byteLength; index += 1) {
                    const {
                        value: element,
                        offset: elementOffset
                    } = decode(elementDefinition, bytes.slice(offset), config);
                    offset += elementOffset
                    collection.push(element)
                }
                value = collection as Value<T>
            }
        case "tuple":
            {
                const tupleDefinition = definition as TupleType;
                const tupleValue = [] as Value<Type>[];
                for (const elementDefinition of tupleDefinition) {
                    const {
                        value: element,
                        offset: elementOffset
                    } = decode(elementDefinition, bytes.slice(offset), config);
                    offset += elementOffset
                    tupleValue.push(element)
                }
                value = tupleValue as Value<T>
            }
            break
        case "array":
            {
                const arrayDefinition = definition as ArrayType;
                const tupleValue = [] as Value<Type>[];
                const elementDefinition = arrayDefinition.element;
                for (let index = 0; index < arrayDefinition.size; index += 1) {
                    const {
                        value: element,
                        offset: elementOffset
                    } = decode(elementDefinition, bytes.slice(offset), config);
                    offset += elementOffset
                    tupleValue.push(element)
                }
                value = tupleValue as Value<T>
            }
            break
        case "struct":
            {
                const structDefinition = definition as StructType;
                let decodedObject = {} as any;
                for (const field in Object.keys(definition)) {
                    const type = structDefinition[field];
                    const {
                        value: fieldValue,
                        offset: fieldOffset
                    } = decode(type, bytes.slice(offset), config);
                    decodedObject[field] = fieldValue;
                    offset += fieldOffset;
                }
                value = decodedObject as Value<T>
            }
            break
        case "enum":
            {
                function indexed(e: EnumType): {
                    [index: number]: [Type, string]
                } {
                    const indexedDefinition = {}
                    for (const variant in e) {
                        if (typeof variant === 'string') {
                            const variantType = e[variant]
                            indexedDefinition[variantType[SYMBOL_EXPR]] = [variantType, variant]
                        }
                    }
                    return indexedDefinition
                }
                const enumDefinition = definition as EnumType;
                const indexedDefinition = indexed(enumDefinition)
                const variantIndex = view.getUint32(offset);
                offset += 4;
                const [variantType, variant] = indexedDefinition[variantIndex];
                const { value: variantValue, offset: variantOffset } = decode(variantType, bytes.slice(offset), config);
                offset += variantOffset;
                value = EnumVariantValue(variant, variantValue) as Value<T>
            }
            break
    }
    return {
        value,
        offset,
    }
}


export const encode = <T extends Type>(type: T, value: Value<T>, buffer: ArrayBuffer, config: BincodeConfig = STANDARD): number => {
    let dataView = new DataView(buffer);
    let offset = 0
    const littleEndian = config.endian === 'little';

    switch (type[TYPE_KIND]) {
        case "unit": {
            break
        }
        case "u8": {
            dataView.setUint8(offset, value as number);
            offset += 1;
            break
        }
        case "u16": {
            dataView.setUint16(offset, value as number, littleEndian);
            offset += 2;
            break
        }
        case "u32": {
            dataView.setUint32(offset, value as number, littleEndian);
            offset += 4;
            break
        }
        case "u64": {
            dataView.setBigUint64(offset, value as bigint, littleEndian);
            offset += 8;
            break
        }
        case "u128": {
            throw ("unimplemented")
        }
        case "i8": {
            dataView.setInt8(offset, value as number);
            offset += 1;
            break
        }
        case "i16": {
            dataView.setInt16(offset, value as number, littleEndian);
            offset += 2;
            break
        }
        case "i32": {
            dataView.setInt32(offset, value as number, littleEndian);
            offset += 4;
            break
        }
        case "i64": {
            dataView.setBigInt64(offset, value as bigint, littleEndian);
            offset += 8;
            break
        }
        case "i128": {
            throw ("unimplemented")
        }
        case "f16": {
            throw ("unimplemented")
        }
        case "f32": {
            dataView.setFloat32(offset, value as number, littleEndian);
            offset += 4;
            break
        }
        case "f64": {
            dataView.setFloat64(offset, value as number, littleEndian);
            offset += 8;
            break
        }
        case "f128": {
            throw ("unimplemented")
        }
        case "bool": {
            dataView.setUint8(offset, value as number);
            offset += 1;
            break
        }
        case "String": {
            const encoder = new TextEncoder();
            const encoded = encoder.encode(value as string);
            dataView.setBigUint64(offset, BigInt(encoded.byteLength), littleEndian);
            offset += 8;
            new Uint8Array(buffer).set(encoded, offset);
            offset += encoded.byteLength;
            break
        }
        case "tuple": {
            const tupleType = type as TupleType;
            const tupleValue = value as TupleValue<typeof tupleType>;
            if (tupleType.length === 1) {
                offset += encode(tupleType[0], tupleValue[0], buffer.slice(offset), config)
            } else {
                for (let index = 0; index < tupleType.length; index += 1) {
                    offset += encode(tupleType[index], tupleValue[index], buffer.slice(offset), config)
                }
            }
            break
        }
        case "array": {
            const arrayType = type as ArrayType;
            const arrayValue = value as Value<typeof arrayType>;
            for (let index = 0; index < arrayType.size; index += 1) {
                offset += encode(arrayType.element, arrayValue[index], buffer.slice(offset), config)
            }
            break
        }
        case "struct": {
            const structType = type as StructType;
            const structValue = value as Value<typeof structType>;
            for (const field in structType) {
                offset += encode(structType[field], structValue[field], buffer.slice(offset), config)
            }
            break
        }
        case "enum": {
            const enumType = type as EnumType;
            const enumValue = value as EnumValue<typeof enumType>;
            const variantIndex = enumType[enumValue[VARIANT]][SYMBOL_EXPR];
            dataView.setUint32(offset, variantIndex, littleEndian);
            offset += 4;
            const variant = enumType[enumValue[VARIANT]];
            offset += encode(variant, enumValue, buffer.slice(offset), config)
            break
        }
        case "collection": {
            const collectionType = type as CollectionType;
            const collectionValue = value as Value<typeof collectionType>;
            dataView.setBigUint64(offset, BigInt(collectionValue.length), littleEndian);
            offset += 8;
            for (const element of collectionValue) {
                offset += encode(collectionType.element, element, buffer.slice(offset), config)
            }
            break
        }
    }
    return offset
}

let buffer = new ArrayBuffer(1024);
console.log($("Ok", 5));
const encoded = encode<Result<u8, String>>(Result(u8, String), $("Ok", 5), buffer);
console.log(encoded);
const decoded = decode(Result(u8, String), buffer).value;
console.log(decoded);

// export type StructValue<T extends StructType> = {
//     [K in Exclude<keyof T, typeof SYMBOL_LAYOUT>]: T[K] extends RustType ? RustValue<T[K]> : never
// } & SlicePart

// export type EnumValue<T extends EnumType> = {
//     [K in keyof T]: T[K] extends RustType ? {
//         variant: K
//         value: RustValue<T[K]>
//     } : never
// }[keyof T] & SlicePart


// type DeTupleLayout<T> = T extends (infer U & TupleLayout) ? U : T;
// type MapTupleValue<T extends unknown[]> = T extends
//     [infer U, ...infer R] ? U extends RustType ? [RustValue<U>, ...MapTupleValue<R>] : never :
//     T extends [] ? [] : never

// export type TupleValue<T extends TupleType> = MapTupleValue<DeTupleLayout<T>> & SlicePart

// export type PrimitiveValue<T extends PrimitiveType> = {
//     type: T,
// } & SlicePart

// export type collectionValue<T extends CollectionType> = RustValue<T['type']>[] & SlicePart


// export type ArrayValue<T extends ArrayType> = RustValue<T['type']>[] & {
//     length: T['length']
// } & SlicePart

// export type RustValue<T extends RustType> =
//     T extends StructType ? StructValue<T> :
//     T extends EnumType ? EnumValue<T> :
//     T extends TupleType ? TupleValue<T> :
//     T extends ArrayType ? ArrayValue<T> :
//     T extends CollectionType ? collectionValue<T> :
//     T extends PrimitiveType ? PrimitiveValue<T> :
//     never

// type X = RustValue<OptionType<'u64'>>;
// type Y = RustValue<Tuple<['u64']>>;
// type Z = RustValue<Array<'u64', 3>>;