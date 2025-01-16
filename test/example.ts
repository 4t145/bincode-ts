import { RustType, Decoder, Encoder } from "../src";
const { u32, Vec, Struct, Str } = RustType;
// TypeScript type defination
type MyStruct = {
    message: string,
    code: number,
    tags: Array<number>
}

// create a corresponded rust type defination
const MyStrcut = Struct<MyStruct>([
    ["message", Str],
    ["code", u32],
    ["tags", Vec(u32)],
])

// the js object to encode
const data: MyStruct = {
    message: "给他一点小小的ts震撼",
    code: 200,
    tags: [20, 5, 8, 6001]
}

// encode
const encoder = new Encoder()
const bincode = encoder.init().encodeAs(data, MyStrcut)
console.log('bincode is', bincode.buffer)

// decode
const decoder = new Decoder()
const decodedData = decoder.load(bincode).decodeAs(MyStrcut)
console.log('decoded object is', decodedData)
