import {
  u32, u8, String as RString,
  Struct, Collection, Option, encode, decode, $,
  Value
} from 'bincode-ts';

/**
 * 复杂嵌套结构示例
 */
export function complexNestedExample() {
  console.log('=== Complex Nested Structures Example ===');
  
  const AddressStruct = Struct({
    street: RString,
    city: RString,
    zipCode: u32
  });
  
  const UserStruct = Struct({
    id: u32,
    profile: Struct({
      firstName: RString,
      lastName: RString,
      age: u8
    }),
    address: AddressStruct,
    tags: Collection(RString),
    scores: Collection(u32)
  });
  
  const buffer = new ArrayBuffer(512);
  const user: Value<typeof UserStruct> = {
    id: 12345,
    profile: {
      firstName: "John",
      lastName: "Doe",
      age: 30
    },
    address: {
      street: "123 Main St",
      city: "Springfield",
      zipCode: 12345
    },
    tags: ["developer", "typescript", "rust"],
    scores: [95, 87, 92, 88, 94]
  };
  
  console.log('Original user:', JSON.stringify(user, null, 2));
  
  const size = encode(UserStruct, user, buffer);
  console.log(`Encoded size: ${size} bytes`);
  
  const decoded = decode(UserStruct, buffer.slice(0, size));
  console.log('Decoded user:', JSON.stringify(decoded.value, null, 2));
  
  return { original: user, decoded: decoded.value, size };
}

/**
 * 带有可选字段的结构示例
 */
export function optionalFieldsExample() {
  console.log('\n=== Optional Fields Example ===');
  
  const ProductStruct = Struct({
    id: u32,
    name: RString,
    description: Option(RString),
    price: u32,
    tags: Collection(RString),
    metadata: Option(Struct({
      created_at: u32,
      updated_at: u32,
      version: u8
    }))
  });
  
  const buffer = new ArrayBuffer(512);
  
  // 产品有完整信息
  const fullProduct = {
    id: 1001,
    name: "Premium Widget",
    description: $('Some' as const, "A high-quality widget for all your needs"),
    price: 2999,
    tags: ["premium", "widget", "quality"],
    metadata: $('Some' as const, {
      created_at: 1640995200,
      updated_at: 1640995300,
      version: 2
    })
  };
  
  console.log('Full product:', JSON.stringify(fullProduct, null, 2));
  
  let size = encode(ProductStruct, fullProduct, buffer);
  let decoded = decode(ProductStruct, buffer.slice(0, size));
  console.log('Decoded full product:', JSON.stringify(decoded.value, null, 2));
  console.log(`Full product encoded size: ${size} bytes`);
  
  // 产品只有基本信息
  const minimalProduct = {
    id: 1002,
    name: "Basic Widget",
    description: $('None' as const, {}),
    price: 999,
    tags: ["basic", "widget"],
    metadata: $('None' as const, {})
  };
  
  console.log('\nMinimal product:', JSON.stringify(minimalProduct, null, 2));
  
  size = encode(ProductStruct, minimalProduct, buffer);
  const decodedMinimal = decode(ProductStruct, buffer.slice(0, size));
  console.log('Decoded minimal product:', JSON.stringify(decodedMinimal.value, null, 2));
  console.log(`Minimal product encoded size: ${size} bytes`);
  
  return {
    full: { original: fullProduct, decoded: decoded.value },
    minimal: { original: minimalProduct, decoded: decodedMinimal.value }
  };
}

/**
 * 深度嵌套示例
 */
export function deepNestingExample() {
  console.log('\n=== Deep Nesting Example ===');
  
  const Level3Struct = Struct({
    value: u32,
    name: RString
  });
  
  const Level2Struct = Struct({
    level3: Level3Struct,
    items: Collection(u32)
  });
  
  const Level1Struct = Struct({
    level2: Level2Struct,
    metadata: RString
  });
  
  const RootStruct = Struct({
    id: u32,
    level1: Level1Struct,
    tags: Collection(RString)
  });
  
  const buffer = new ArrayBuffer(512);
  const deepData = {
    id: 9999,
    level1: {
      level2: {
        level3: {
          value: 42,
          name: "Deep Value"
        },
        items: [1, 2, 3, 4, 5]
      },
      metadata: "Level 1 metadata"
    },
    tags: ["deep", "nested", "structure"]
  };
  
  console.log('Deep nested data:', JSON.stringify(deepData, null, 2));
  
  const size = encode(RootStruct, deepData, buffer);
  console.log(`Deep structure encoded size: ${size} bytes`);
  
  const decoded = decode(RootStruct, buffer.slice(0, size));
  console.log('Decoded deep structure:', JSON.stringify(decoded.value, null, 2));
  
  return { original: deepData, decoded: decoded.value, size };
}

// 如果直接运行此文件
if (require.main === module) {
  complexNestedExample();
  optionalFieldsExample();
  deepNestingExample();
}
