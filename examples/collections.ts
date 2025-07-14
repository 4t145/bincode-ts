import {
  u32, String as RString, u8,
  Collection, Array, Struct, encode, decode
} from 'bincode-ts';

/**
 * 集合类型编码解码示例
 */
export function collectionExample() {
  console.log('=== Collection Example ===');
  
  const NumberList = Collection(u32);
  const StringList = Collection(RString);
  
  const buffer = new ArrayBuffer(512);
  
  // 数字集合
  const numbers = [1, 2, 3, 5, 8, 13, 21, 34, 55];
  console.log('Original numbers:', numbers);
  
  let size = encode(NumberList, numbers, buffer);
  let decoded = decode(NumberList, buffer.slice(0, size));
  console.log('Decoded numbers:', decoded.value);
  console.log(`Numbers encoded size: ${size} bytes`);
  
  // 字符串集合
  const languages = ["TypeScript", "Rust", "Python", "JavaScript", "Go"];
  console.log('\nOriginal languages:', languages);
  
  size = encode(StringList, languages, buffer);
  const decodedStrings = decode(StringList, buffer.slice(0, size));
  console.log('Decoded languages:', decodedStrings.value);
  console.log(`Languages encoded size: ${size} bytes`);
  
  return {
    numbers: { original: numbers, decoded: decoded.value },
    languages: { original: languages, decoded: decodedStrings.value }
  };
}

/**
 * 固定大小数组示例
 */
export function arrayExample() {
  console.log('\n=== Array Example ===');
  
  const NumberArray = Array(u32, 5);
  const buffer = new ArrayBuffer(128);
  
  const numbers = [10, 20, 30, 40, 50] as any;
  console.log('Original fixed array:', numbers);
  
  const size = encode(NumberArray, numbers, buffer);
  const decoded = decode(NumberArray, buffer.slice(0, size));
  
  console.log('Decoded fixed array:', decoded.value);
  console.log(`Array encoded size: ${size} bytes`);
  
  return { original: numbers, decoded: decoded.value, size };
}

/**
 * 结构体集合示例
 */
export function structCollectionExample() {
  console.log('\n=== Struct Collection Example ===');
  
  const PersonStruct = Struct({
    name: RString,
    age: u8
  });
  
  const PeopleCollection = Collection(PersonStruct);
  const buffer = new ArrayBuffer(512);
  
  const people = [
    { name: "Alice", age: 25 },
    { name: "Bob", age: 30 },
    { name: "Charlie", age: 35 },
    { name: "Diana", age: 28 }
  ];
  
  console.log('Original people collection:', people);
  
  const size = encode(PeopleCollection, people, buffer);
  const decoded = decode(PeopleCollection, buffer.slice(0, size));
  
  console.log('Decoded people collection:', decoded.value);
  console.log(`People collection encoded size: ${size} bytes`);
  
  return { original: people, decoded: decoded.value, size };
}

/**
 * 空集合示例
 */
export function emptyCollectionExample() {
  console.log('\n=== Empty Collection Example ===');
  
  const EmptyNumbers = Collection(u32);
  const EmptyStrings = Collection(RString);
  
  const buffer = new ArrayBuffer(64);
  
  // 空数字集合
  const emptyNumbers: number[] = [];
  console.log('Original empty numbers:', emptyNumbers);
  
  let size = encode(EmptyNumbers, emptyNumbers, buffer);
  let decoded = decode(EmptyNumbers, buffer.slice(0, size));
  console.log('Decoded empty numbers:', decoded.value);
  console.log(`Empty numbers encoded size: ${size} bytes`);
  
  // 空字符串集合
  const emptyStrings: string[] = [];
  console.log('Original empty strings:', emptyStrings);
  
  size = encode(EmptyStrings, emptyStrings, buffer);
  const decodedStrings = decode(EmptyStrings, buffer.slice(0, size));
  console.log('Decoded empty strings:', decodedStrings.value);
  console.log(`Empty strings encoded size: ${size} bytes`);
  
  return {
    numbers: { original: emptyNumbers, decoded: decoded.value },
    strings: { original: emptyStrings, decoded: decodedStrings.value }
  };
}

// 如果直接运行此文件
if (require.main === module) {
  collectionExample();
  arrayExample();
  structCollectionExample();
  emptyCollectionExample();
}
