import { basicTypesExample } from './basic-types';
import { structExample, nestedStructExample } from './structs';
import { tupleExample, mixedTupleExample, singleElementTupleExample } from './tuples';
import { collectionExample, arrayExample, structCollectionExample, emptyCollectionExample } from './collections';
import { optionExample, resultExample, nestedOptionExample } from './enums';
import { complexNestedExample, optionalFieldsExample, deepNestingExample } from './complex-structures';
import { runCustomTypeExamples } from './custom-types';

/**
 * 运行所有示例
 */
export function runAllExamples() {
  console.log('🚀 Running All bincode ts Examples\n');
  console.log('=' .repeat(50));
  
  try {
    // 基础类型示例
    basicTypesExample();
    
    console.log('\n' + '=' .repeat(50));
    
    // 结构体示例
    structExample();
    nestedStructExample();
    
    console.log('\n' + '=' .repeat(50));
    
    // 元组示例
    tupleExample();
    mixedTupleExample();
    singleElementTupleExample();
    
    console.log('\n' + '=' .repeat(50));
    
    // 集合示例
    collectionExample();
    arrayExample();
    structCollectionExample();
    emptyCollectionExample();
    
    console.log('\n' + '=' .repeat(50));
    
    // 枚举类型示例
    optionExample();
    resultExample();
    nestedOptionExample();
    
    console.log('\n' + '=' .repeat(50));
    
    // 复杂结构示例
    complexNestedExample();
    optionalFieldsExample();
    deepNestingExample();
    
    console.log('\n' + '=' .repeat(50));
    
    // 自定义类型示例
    runCustomTypeExamples();
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ All Examples Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Example failed:', error);
    throw error;
  }
}

/**
 * 性能测试示例
 */
export function performanceExample() {
  console.log('\n🏃‍♂️ Performance Example');
  console.log('=' .repeat(30));
  
  const { Collection, u32, encode, decode } = require('../src/index');
  
  const LargeCollection = Collection(u32);
  const buffer = new ArrayBuffer(100000);
  
  // 创建大型数据集
  const largeData = Array.from({ length: 10000 }, (_, i) => i);
  
  console.log(`Testing with ${largeData.length} numbers...`);
  
  // 编码性能测试
  const encodeStart = performance.now();
  const size = encode(LargeCollection, largeData, buffer);
  const encodeTime = performance.now() - encodeStart;
  
  console.log(`Encoding took: ${encodeTime.toFixed(2)}ms`);
  console.log(`Encoded size: ${size} bytes`);
  console.log(`Compression ratio: ${(largeData.length * 4 / size * 100).toFixed(1)}%`);
  
  // 解码性能测试
  const decodeStart = performance.now();
  const decoded = decode(LargeCollection, buffer.slice(0, size));
  const decodeTime = performance.now() - decodeStart;
  
  console.log(`Decoding took: ${decodeTime.toFixed(2)}ms`);
  console.log(`Data integrity: ${decoded.value.length === largeData.length ? '✅ Passed' : '❌ Failed'}`);
  
  return {
    encodeTime,
    decodeTime,
    size,
    dataIntegrity: decoded.value.length === largeData.length
  };
}

// 导出所有示例函数
export {
  basicTypesExample,
  structExample,
  nestedStructExample,
  tupleExample,
  mixedTupleExample,
  singleElementTupleExample,
  collectionExample,
  arrayExample,
  structCollectionExample,
  emptyCollectionExample,
  optionExample,
  resultExample,
  nestedOptionExample,
  complexNestedExample,
  optionalFieldsExample,
  deepNestingExample,
  runCustomTypeExamples
};

// 如果直接运行此文件
if (require.main === module) {
  runAllExamples();
  performanceExample();
}
