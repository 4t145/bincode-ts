# BincodeTs

A library to decode/encode [bincode](https://github.com/bincode-org/bincode) to JavaScript object.

## Install

`npm install bincode-ts`

## Usage

```typescript
import { RustType, Decoder, Encoder } from "bincode-ts";
const { u32, Vec, Struct, Str } = RustType;
// TypeScript type defination
type MyStruct = {
  message: string;
  code: number;
  tags: Array<number>;
};

// create a corresponded rust type defination
const MyStrcut = Struct<MyStruct>([
  ["message", Str],
  ["code", u32],
  ["tags", Vec(u32)],
]);

// the js object to encode
const data: MyStruct = {
  message: "给他一点小小的ts震撼",
  code: 200,
  tags: [20, 5, 8, 6001],
};

// encode
const encoder = new Encoder();
const bincode = encoder.init().encodeAs(data, MyStrcut);
console.log("bincode is", bincode.buffer);

// decode
const decoder = new Decoder();
const decodedData = decoder.load(bincode.buffer).decodeAs(MyStrcut);
console.log("decoded object is", decodedData);
```

## Rust Type Defination

A rust type defination is a object implements interface `RustType.Type<Data>`, where generic parameter `Data` is the corresponded TypeScript type.

### Primitive Types

```typescript
import { RustType } from "bincode-ts";
// here are primitive types
const { i8, u8, i16, u16, i32, u32, i64, u64, f32, f64, empty } = RustType;
```

The `empty` type is corresponded to `()` type in Rust，it will by decoded as `undefined` .

`i64` and `f64` is corresponded to `bigint` is JavaScript.
### Compound Types

```typescript
import { RustType } from "bincode-ts";
// here are compound type constructor functions
const { Struct, Tuple, Enum } = RustType;
```

#### Struct

`RustType.Struct` is a function to create `Struct` type defination, it accepts an array of `[string, RustType.Type]`.

```typescript
// TypeScript type defination
type MyStruct = {
  message: string;
  code: number;
  empty: undefined;
};

// create a corresponded rust type defination
const MyStrcut = Struct<MyStruct>([
  ["message", Str],
  ["code", u32],
  ["empty", empty],
]);
```

#### Tuple

`RustType.Tuple` is a function to create `Tuple` type defination, it accepts an array of `RustType.Type`.

```typescript
// TypeScript type defination
type MyTuple = [string, number, boolean];

// create a corresponded rust type defination
const MyStrcut = Tuple<MyTuple>([Str, i32, bool]);
```

#### Enum

`RustType.Enum` is a function to create `Enum` type defination, it's a little bit more complex than previous two. It accepts an array of `[RustType.Type]`.

An bincode Enum value will be decoed as an EnumData
```typescript
type EnumData<T> = {
    variant: number,
    data: T
}
```

```typescript
import { enumData, EnumData, Variant } from "bincode-ts";
export namespace MyEnum {
  // ts type of this enum variants code
  export enum _ {
    BigInt,
    Tuple,
    Empty = 5,
  }
  // variants
  export type BigInt = Variant<_.BigInt, bigint>;
  export type Tuple = Variant<_.Tuple, [number, string]>;
  export type Empty = Variant<_.Empty, undefined>;

  // ts type of this enum
  export type $ =
    | BigInt 
    | Tuple 
    | Empty;

  // Corresponed RustType
  export const Type: Type<$> = Enum<$>({
    [_.BigInt]: i64,
    [_.Tuple]: myTuple,
    [_.Empty]: empty,
  });
}

// create js objects of this enum
let myEnumData0 = enumData<MyEnum.$, MyEnum.BigInt>(
  MyEnum._.BigInt,
  123456789n
);

let myEnumData1 = enumData<MyEnum.$, MyEnum.Tuple>(MyEnum._.Tuple, [
  0,
  "hello",
]);

let myEnumData2 = enumData<MyEnum.$, MyEnum.Empty>(MyEnum._.Empty, undefined);
```

### Array Types
Function `Arr` is for `Array` type in Rust, 
```typescript
const { Arr } = RustType;

// it creates a type of `[i32; 10]`, and will be decoded as `numebr[]`
const MyArr = Arr<number>(i32, 10);

```

### Collections
```typescript
const { Vec, Map, Set } = RustType;

// it implements Type<Array<number>>
const MyVec = Vec<number>(i32);

// it implements Type<Map<string, bigint>>
const MyHashMap = HashMap<string, bigint>(Str, u64);

// it implements Type<Set<number>>
const MyHashSet = HashSet<number>(i8);
```