import {
  f32, u32, String as RString,
  Tuple, encode, decode
} from 'bincode-ts';

/**
 * 元组编码解码示例
 */
export function tupleExample() {
  console.log('=== Tuple Example ===');
  
  // 3D坐标元组
  const CoordinateTuple = Tuple(f32, f32, f32);
  const buffer = new ArrayBuffer(128);
  
  const coordinate: [number, number, number] = [10.5, 20.3, 15.7];
  
  console.log('Original coordinate:', coordinate);
  
  const size = encode(CoordinateTuple, coordinate, buffer);
  const decoded = decode(CoordinateTuple, buffer.slice(0, size));
  
  console.log('Decoded coordinate:', decoded.value);
  console.log(`Encoded size: ${size} bytes`);
  
  return { original: coordinate, decoded: decoded.value, size };
}

/**
 * 混合类型元组示例
 */
export function mixedTupleExample() {
  console.log('\n=== Mixed Tuple Example ===');
  
  // 混合类型元组: (name, age, score)
  const PersonTuple = Tuple(RString, u32, f32);
  const buffer = new ArrayBuffer(128);
  
  const personData: [string, number, number] = ["Charlie", 28, 95.5];
  
  console.log('Original person tuple:', personData);
  
  const size = encode(PersonTuple, personData, buffer);
  const decoded = decode(PersonTuple, buffer.slice(0, size));
  
  console.log('Decoded person tuple:', decoded.value);
  console.log(`Encoded size: ${size} bytes`);
  
  return { original: personData, decoded: decoded.value, size };
}

/**
 * 单元素元组示例
 */
export function singleElementTupleExample() {
  console.log('\n=== Single Element Tuple Example ===');
  
  const SingleTuple = Tuple(u32);
  const buffer = new ArrayBuffer(32);
  
  const value = 42;
  
  console.log('Original single value:', value);
  
  const size = encode(SingleTuple, value, buffer);
  const decoded = decode(SingleTuple, buffer.slice(0, size));
  
  console.log('Decoded single value:', decoded.value);
  console.log(`Encoded size: ${size} bytes`);
  
  return { original: value, decoded: decoded.value, size };
}

// 如果直接运行此文件
if (require.main === module) {
  tupleExample();
  mixedTupleExample();
  singleElementTupleExample();
}
