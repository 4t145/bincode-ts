import {
    u32, String as RString, bool, f32,
    encode, decode
} from 'bincode-ts';

/**
 * 基础类型编码解码示例
 */
export function basicTypesExample() {
    console.log('=== Basic Types Example ===');

    const buffer = new ArrayBuffer(256);

    // 编码和解码字符串
    const text = "Hello, RType!";
    const textSize = encode(RString, text, buffer);
    const decodedText = decode(RString, buffer.slice(0, textSize));
    console.log(`Original: "${text}", Decoded: "${decodedText.value}"`);

    // 编码和解码数字
    const number = 42;
    const numberSize = encode(u32, number, buffer);
    const decodedNumber = decode(u32, buffer.slice(0, numberSize));
    console.log(`Original: ${number}, Decoded: ${decodedNumber.value}`);

    // 编码和解码布尔值
    const boolValue = true;
    const boolSize = encode(bool, boolValue, buffer);
    const decodedBool = decode(bool, buffer.slice(0, boolSize));
    console.log(`Original: ${boolValue}, Decoded: ${decodedBool.value}`);

    // 编码和解码浮点数
    const floatValue = 3.14159;
    const floatSize = encode(f32, floatValue, buffer);
    const decodedFloat = decode(f32, buffer.slice(0, floatSize));
    console.log(`Original: ${floatValue}, Decoded: ${decodedFloat.value.toFixed(5)}`);
}

// 如果直接运行此文件
if (require.main === module) {
    basicTypesExample();
}
