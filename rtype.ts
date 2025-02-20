type IntBitSize = 8 | 16 | 32 | 64 | 128
type FloatBitSize = 16 | 32 | 64
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
export type RustType = TypeKindMarker<UnitTypeMarker> | TypeKindMarker<PrimitiveTypeMarker> | TupleType | ArrayType | StructType | EnumType | CollectionType;
export const SYMBOL_TYPE_KIND: unique symbol = Symbol('type-kind')
export type TypeKind = UnitTypeMarker | PrimitiveTypeMarker | 'struct' | 'enum' | 'tuple' | 'array' | 'collection'
export type TypeKindMarker<T extends TypeKind> = {
    [SYMBOL_TYPE_KIND]: T
}

export const TypeKindMarker = <T extends TypeKind>(type: T): TypeKindMarker<T> => ({
    [SYMBOL_TYPE_KIND]: type
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
export type bool = TypeKindMarker<'bool'>;
export const bool: bool = TypeKindMarker('bool');
export type String = TypeKindMarker<'String'>;
export const String: String = TypeKindMarker('String');


export type TupleType = RustType[] & TypeKindMarker<'tuple'>

export type StructType = {
    [field: string]: RustType
} & TypeKindMarker<'struct'>

export type EnumVariantType = (Unit | TupleType | StructType)
export const SYMBOL_EXPR: unique symbol = Symbol('expr')
export type Expr<N extends number> = {
    [SYMBOL_EXPR]: N
}
export type EnumVariant = (EnumVariantType) & Expr<number>

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
    element: RustType,
    size: number
} & TypeKindMarker<'array'>

export type CollectionType = {
    element: RustType,
} & TypeKindMarker<'collection'>

export type Collection<T extends RustType> = {
    element: T,
} & TypeKindMarker<'collection'>

export const Collection = <T extends RustType>(element: T): Collection<T> => (
    {
        element,
        ...TypeKindMarker('collection')
    }
)

export type Array<T extends RustType, N extends number> = {
    element: T
    size: N
} & TypeKindMarker<'array'>

export const Array = <T extends RustType, N extends number>(element: T, size: N): Array<T, N> => ({
    element,
    size,
    ...TypeKindMarker('array')
})

export type Tuple<T extends RustType[]> = T & TypeKindMarker<'tuple'>

export const Tuple = <T extends RustType[]>(...element: T): Tuple<T> => {
    const elementAsTuple = element as Tuple<T>;
    elementAsTuple[SYMBOL_TYPE_KIND] = 'tuple'
    return elementAsTuple
}
export type Enum<T extends {
    [variant: string]: EnumVariant
}> = T & TypeKindMarker<'enum'>


export const Enum = <T extends {
    [variant: string]: EnumVariant
}>(variants: T): Enum<T> => {
    const asEnum = variants as Enum<T>;
    asEnum[SYMBOL_TYPE_KIND] = 'enum'
    return asEnum
}

export type Struct<T extends {
    [variant: string]: RustType
}> = T & TypeKindMarker<'struct'>

export const Struct = <T extends {
    [variant: string]: RustType
}>(fields: T): Struct<T> => {
    const elementAsStruct = fields as Struct<T>;
    elementAsStruct[SYMBOL_TYPE_KIND] = 'struct'
    return elementAsStruct
}


export const Result = <T extends RustType, E extends RustType>(ok: T, err: E) => Enum({
    Ok: _(0, Tuple(ok)),
    Err: _(1, Tuple(err))
})

export const Option = <T extends RustType>(value: T) => Enum({
    Some: _(0, Tuple(value)),
    None: _(1)
})

export const Vec = Collection
export const Set = Collection
export const Map = <K extends RustType, V extends RustType>(K: K, V: V): Collection<Tuple<[K, V]>> => (Collection(Tuple(K, V)))
export const Bytes = Collection(u8)


/* 
    RustType To Layout
*/

type RustLayout<T extends RustType> = 
    T extends Unit ? UnitLayout :
    T extends TypeKindMarker<infer P extends PrimitiveTypeMarker> ? LayoutMarker<'primitive'> & P :
    T extends StructType ? ProductLayout :
    T extends TupleType ? ProductLayout :
    T extends EnumType ? SumLayout :
    T extends ArrayType ? ArrayLayout :
    T extends CollectionType ? CollectionLayout :
    never



type JsonTupleValue<T extends RustType[]> = 
    T extends [infer First, ...infer Tail] ? 
        First extends RustType ? 
            Tail extends RustType[]?
                [JsonType<First>, ...JsonTupleValue<Tail>] : 
            never :
        never : 
    T extends [infer First] ? 
        First extends RustType ? 
            [JsonType<First>] : 
        never : 
    never

type JsonEnumValue<T extends EnumType> = UnionToVariant<JsonEnumValueUnion<T>>

type JsonEnumValueUnion<T extends EnumType> = {
    [K in Extract<(keyof T), string>]: JsonType<T[K]>
}

type UnionToVariant<T extends {
    [variant: string]: any
}> =  {
    [K in keyof T]: JsonEnumVariantType<K, T[K]>;
}[keyof T];

export const SYMBOL_VARIANT_KIND: unique symbol = Symbol('variant-kind')
export type JsonEnumVariant<K> = {
    [SYMBOL_VARIANT_KIND]: K
}
export type JsonEnumVariantType<K, V> =  V & JsonEnumVariant<K>

export type JsonType<T extends RustType> =
    T extends Unit ? {} :
    T extends TypeKindMarker<`${'u' | 'i'}${8 | 16 | 32}` | `f${16 | 32 | 64}`> ? number :
    T extends TypeKindMarker<`${'u' | 'i'}${64}`> ? bigint :
    T extends TypeKindMarker<'bool'> ? boolean :
    T extends TypeKindMarker<'String'> ? string :
    T extends StructType ? {
        [K in (Extract<keyof T, string>)]: JsonType<T[K]>
    } :
    T extends TupleType ?
        T extends [infer First] ? 
            First extends RustType ? 
                JsonType<First> : 
            never : 
        JsonTupleValue<T> :
    T extends EnumType ? JsonEnumValue<T>:
    T extends CollectionType ? JsonType<T['element']>[] :
    T extends ArrayType ? JsonType<T['element']>[] & { length: T['size'] } :
never




const Sex = Enum({
    Male: _(0),
    Female: _(1),
    Other: _(2, Tuple(String))
})
const Id = Array(u8, 16);

const User = Struct({
    age: u32,
    sex: Sex,
    accounts: Set(Id),
})

type UserInJson = JsonType<typeof User>;



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