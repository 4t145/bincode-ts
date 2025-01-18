import {Decoder, Encoder, RustType} from "../src";
import {enumData, Variant} from "../src/enum-data";
import {Arr, empty, Enum, Err, i32, i64, Result, Str, Struct, Tuple, Type, u32, Vec,} from "../src/rust-type";
import {describe, expect, test} from "vitest"

const myTuple = Tuple<[number, string]>([i32, Str]);
export namespace MyEnum {
    export enum _ {
        BigInt,
        Tuple,
        Empty,
    }

    export type BigInt = Variant<_.BigInt, bigint>;
    export type Tuple = Variant<_.Tuple, [number, string]>;
    export type Empty = Variant<_.Empty, undefined>;
    export type $ = BigInt | Tuple | Empty;
    export const Type: Type<$> = Enum<$>({
        [_.BigInt]: i64,
        [_.Tuple]: myTuple,
        [_.Empty]: empty,
    });
}

describe("Encoding", () => {
    test("Encode and decode round trip", () => {
        const decoder = new Decoder();
        const encoder = new Encoder();
        decoder.config.with_little_endian().skip_fixed_array_length();
        encoder.config.with_little_endian().skip_fixed_array_length();
        type MyStruct = {
            reason: string;
            code: number;
        };
        const myStruct: RustType.Type<MyStruct> = Struct([
            ["reason", Str],
            ["code", u32],
        ]);
        let myEnumData0 = enumData<MyEnum.$, MyEnum.BigInt>(
            MyEnum._.BigInt,
            123456789n
        );
        let myEnumData1 = enumData<MyEnum.$, MyEnum.Tuple>(
            MyEnum._.Tuple,
            [0, "你好"]
        );
        let myEnumData2 = enumData<MyEnum.$, MyEnum.Empty>(
            MyEnum._.Empty,
            undefined
        );

        const bincode0 = encoder.init().encodeAs([myEnumData0, myEnumData1, myEnumData2, myEnumData0], Vec(MyEnum.Type));
        expect(bincode0).toMatchSnapshot();
        const result = decoder.load(bincode0).decodeAs(Vec(MyEnum.Type));
        expect(result).toMatchInlineSnapshot(`
          [
            {
              "data": 123456789n,
              "variant": 0,
            },
            {
              "data": [
                0,
                "你好",
              ],
              "variant": 1,
            },
            {
              "data": undefined,
              "variant": 2,
            },
            {
              "data": 123456789n,
              "variant": 0,
            },
          ]
        `)
        const myType = Result(i32, myStruct);
        const myData = Err<MyStruct>({
            reason: "hello world, 早上好🇨🇳, 现在我有🍦",
            code: 400,
        });
        const bincode1 = encoder.init().encodeAs(myData, myType);
        expect(bincode1);
        const result1 = decoder.load(bincode1).decodeAs(myType);
        expect(result1).toMatchInlineSnapshot(`
          {
            "data": {
              "code": 400,
              "reason": "hello world, 早上好🇨🇳, 现在我有🍦",
            },
            "variant": 1,
          }
        `);

        const array = Arr(myStruct, 3);
        const bincode2 = encoder.init().encodeAs(
            [
                {
                    reason: "早上好🇨🇳, 现在我有🍦",
                    code: 400,
                },
                {
                    reason: "现在是🍦时间",
                    code: 401,
                },
                {
                    reason: "给他一点小小的中国震撼",
                    code: 402,
                },
            ],
            array
        );
        expect(bincode2).toMatchSnapshot();
        const result3 = decoder.load(bincode2).decodeAs(array);
        expect(result3).toMatchInlineSnapshot(`
          [
            {
              "code": 400,
              "reason": "早上好🇨🇳, 现在我有🍦",
            },
            {
              "code": 401,
              "reason": "现在是🍦时间",
            },
            {
              "code": 402,
              "reason": "给他一点小小的中国震撼",
            },
          ]
        `);
    })
})
