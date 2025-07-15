import {
  u8, String as RString, bool, f32,
  Struct, encode, decode,
  Value
} from 'bincode-ts';

/**
 * 结构体编码解码示例
 */
export function structExample() {
  console.log('=== Struct Example ===');

  const PersonStruct = Struct({
    name: RString,
    age: u8,
    height: f32,
    isStudent: bool
  });

  const buffer = new ArrayBuffer(256);
  const person: Value<typeof PersonStruct> = {
    name: "Alice Johnson",
    age: 25,
    height: 5.6,
    isStudent: true
  };

  console.log('Original person:', person);

  const size = encode(PersonStruct, person, buffer);
  const encoded = buffer.slice(0, size);

  console.log(`Encoded size: ${size} bytes`);

  const decoded = decode(PersonStruct, encoded);
  console.log('Decoded person:', decoded.value);

  return { original: person, decoded: decoded.value, size };
}

/**
 * 嵌套结构体示例
 */
export function nestedStructExample() {
  console.log('\n=== Nested Struct Example ===');

  const AddressStruct = Struct({
    street: RString,
    city: RString,
    zipCode: u8
  });

  const PersonStruct = Struct({
    name: RString,
    age: u8,
    address: AddressStruct
  });

  const buffer = new ArrayBuffer(256);
  const person = {
    name: "Bob Smith",
    age: 35,
    address: {
      street: "456 Oak Ave",
      city: "Boston",
      zipCode: 123
    }
  };

  console.log('Original nested person:', JSON.stringify(person, null, 2));

  const size = encode(PersonStruct, person, buffer);
  console.log(`Encoded size: ${size} bytes`);

  const decoded = decode(PersonStruct, buffer.slice(0, size));
  console.log('Decoded nested person:', JSON.stringify(decoded.value, null, 2));

  return { original: person, decoded: decoded.value, size };
}

// 如果直接运行此文件
if (require.main === module) {
  structExample();
  nestedStructExample();
}
