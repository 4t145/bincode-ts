type IntBitSize = 8 | 16 | 32 | 64 | 128 | 'size'
type FloatBitSize = 16 | 32 | 64

export type RustType = PrimitiveType | StructType | TupleType | ArrayType | EnumType | CollectionType | UnitType
export type UnitType = 'unit'
export type PrimitiveType = `u${IntBitSize}` | `i${IntBitSize}` | `f${FloatBitSize}` | 'bool' | 'String'

export const SYMBOL_LAYOUT: unique symbol = Symbol('layout')
export const SYMBOL_SLICE: unique symbol = Symbol('slice')

export type Layout = 'collection' | 'struct' | 'tuple' | 'array' | 'enum'
export type EnumLayout = {
    [SYMBOL_LAYOUT]: 'enum'
}
export type CollectionType = {
    [SYMBOL_LAYOUT]: 'collection'
    type: RustType
}

export type StructDefinition = {
    [key: string]: RustType
}

export type StructType = StructDefinition & {
    [SYMBOL_LAYOUT]: 'struct'
}

export type TupleLayout = {
    [SYMBOL_LAYOUT]: 'tuple'
}
export type TupleType = RustType[] & TupleLayout

export type ArrayType = {
    [SYMBOL_LAYOUT]: 'array'
    type: RustType
    length: number
}

export type EnumVariantKind = UnitType | TupleType | StructType

export type EnumVariant = {
    variant: number,
    kind: EnumVariantKind
}

export type EnumDefinition = {
    [key: number]: EnumVariantKind
}

export type EnumType = {
    [key: number]: EnumVariantKind
} & EnumLayout


export function struct(definition: StructDefinition): StructType {
    let definitionAsStruct = definition as StructType
    definitionAsStruct[SYMBOL_LAYOUT] = 'struct'
    return definitionAsStruct
}

export function tuple(...types: RustType[]): TupleType {
    let typesAsTuple = types as TupleType
    typesAsTuple[SYMBOL_LAYOUT] = 'tuple'
    return typesAsTuple
}

export function enumerate(definition: EnumDefinition): EnumType {
    let definitionAsStruct = definition as EnumType
    definitionAsStruct[SYMBOL_LAYOUT] = 'enum'
    return definitionAsStruct
}

export function variant(variant: number, kind?: EnumVariantKind): EnumVariant {
    return { variant, kind: kind ?? 'unit' }
}

export function array(type: RustType, length: number): ArrayType {
    return { [SYMBOL_LAYOUT]: 'array', type, length }
}

export function collection(type: RustType): CollectionType {
    return { [SYMBOL_LAYOUT]: 'collection', type }
}

export const vec = collection;
export const set = collection;
export const map = (k: RustType, v: RustType) => collection(tuple(k, v));
export const SOME = 1;
export const NONE = 0;
export const OK = 1;
export const ERROR = 0;
export type Tuple<Types extends RustType[]> = Types & TupleLayout;
export type OptionType<T extends RustType> = {
    [SOME]: Tuple<[T]>
    [NONE]: UnitType
} & EnumLayout

export const option = (t: RustType): EnumType => enumerate(
    {
        [SOME]: tuple(t),
        [NONE]: 'unit'
    }
)

export const result = (t: RustType, e: RustType): EnumType => enumerate(
    {
        [OK]: tuple(t),
        [ERROR]: tuple(e)
    }
)

export type Slice = {
    from: number
    to: number
}
export type SlicePart = {
    [SYMBOL_SLICE]: Slice
}

export type StructValue<T extends StructType> = {
    [K in Exclude<keyof T, typeof SYMBOL_LAYOUT>]: T[K] extends RustType ? RustValue<T[K]> : never
} & SlicePart

export type EnumValue<T extends EnumType> = {
    [K in keyof T]: T[K] extends RustType ? {
        variant: K
        value: RustValue<T[K]>
    } : never
}[keyof T] & SlicePart
type TupleValue<T> = {
    [K in keyof T]: K extends number ? T[K] extends RustType ? {
        variant: K
        value: RustValue<T[K]>
    } : never : never
} & SlicePart

export type PrimitiveValue<T extends PrimitiveType> = {
    type: PrimitiveType,
} & SlicePart
export type RustValue<T extends RustType> =
    T extends StructType ? StructValue<T> :
    T extends EnumType ? EnumValue<T> :
    T extends TupleType ? TupleValue<T> :
    T extends PrimitiveType ? PrimitiveValue<T> :
    never

type X = RustValue<OptionType<'u64'>>;
type Y = TupleValue<['u64']>;
