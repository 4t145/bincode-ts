import {
  u32, String as RString,
  Option, Result, encode, decode, $
} from 'bincode-ts';

/**
 * Option 类型示例
 */
export function optionExample() {
  console.log('=== Option Example ===');
  
  const NumberOption = Option(u32);
  const buffer = new ArrayBuffer(128);
  
  // Some 变体
  console.log('\n--- Some Variant ---');
  const someValue = $('Some' as const, 42);
  console.log('Original Some value:', someValue);
  
  let size = encode(NumberOption, someValue, buffer);
  let decoded = decode(NumberOption, buffer.slice(0, size));
  console.log('Decoded Some value:', decoded.value);
  console.log(`Some encoded size: ${size} bytes`);
  
  // None 变体
  console.log('\n--- None Variant ---');
  const noneValue = $('None' as const, {});
  console.log('Original None value:', noneValue);
  
  size = encode(NumberOption, noneValue, buffer);
  decoded = decode(NumberOption, buffer.slice(0, size));
  console.log('Decoded None value:', decoded.value);
  console.log(`None encoded size: ${size} bytes`);
  
  return {
    some: { original: someValue, decoded: decoded.value },
    none: { original: noneValue, decoded: decoded.value }
  };
}

/**
 * Result 类型示例
 */
export function resultExample() {
  console.log('\n=== Result Example ===');
  
  const StringResult = Result(RString, u32);
  const buffer = new ArrayBuffer(128);
  
  // Ok 变体
  console.log('\n--- Ok Variant ---');
  const okValue = $('Ok' as const, "Success!");
  console.log('Original Ok value:', okValue);
  
  let size = encode(StringResult, okValue, buffer);
  let decoded = decode(StringResult, buffer.slice(0, size));
  console.log('Decoded Ok value:', decoded.value);
  console.log(`Ok encoded size: ${size} bytes`);
  
  // Err 变体
  console.log('\n--- Err Variant ---');
  const errValue = $('Err' as const, 404);
  console.log('Original Err value:', errValue);
  
  size = encode(StringResult, errValue, buffer);
  const decodedErr = decode(StringResult, buffer.slice(0, size));
  console.log('Decoded Err value:', decodedErr.value);
  console.log(`Err encoded size: ${size} bytes`);
  
  return {
    ok: { original: okValue, decoded: decoded.value },
    err: { original: errValue, decoded: decodedErr.value }
  };
}

/**
 * 嵌套 Option 示例
 */
export function nestedOptionExample() {
  console.log('\n=== Nested Option Example ===');
  
  const StringOption = Option(RString);
  const NestedOption = Option(StringOption);
  const buffer = new ArrayBuffer(128);
  
  // Some(Some("value"))
  console.log('\n--- Some(Some("value")) ---');
  const innerSome = $('Some' as const, "Hello World");
  const outerSome = $('Some' as const, innerSome);
  console.log('Original nested Some:', outerSome);
  
  let size = encode(NestedOption, outerSome, buffer);
  let decoded = decode(NestedOption, buffer.slice(0, size));
  console.log('Decoded nested Some:', decoded.value);
  
  // Some(None)
  console.log('\n--- Some(None) ---');
  const innerNone = $('None' as const, {});
  const outerSomeNone = $('Some' as const, innerNone);
  console.log('Original Some(None):', outerSomeNone);
  
  size = encode(NestedOption, outerSomeNone, buffer);
  const decodedSomeNone = decode(NestedOption, buffer.slice(0, size));
  console.log('Decoded Some(None):', decodedSomeNone.value);
  
  // None
  console.log('\n--- None ---');
  const outerNone = $('None' as const, {});
  console.log('Original outer None:', outerNone);
  
  size = encode(NestedOption, outerNone, buffer);
  const decodedNone = decode(NestedOption, buffer.slice(0, size));
  console.log('Decoded outer None:', decodedNone.value);
  
  return {
    someSome: { original: outerSome, decoded: decoded.value },
    someNone: { original: outerSomeNone, decoded: decodedSomeNone.value },
    none: { original: outerNone, decoded: decodedNone.value }
  };
}

// 如果直接运行此文件
if (require.main === module) {
  optionExample();
  resultExample();
  nestedOptionExample();
}
