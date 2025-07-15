import {
  u8, u16, u32, String as RString,
  Struct, Collection, encode, decode,
  BincodeConfig,
} from '../src/index';
const U8_MAX = 251n;
const U16_MAX = 1n << 16n;
const U32_MAX = 1n << 32n;
const U64_MAX = 1n << 64n;
function expectedVariantLengthBytes(length: number): number {
  if (length < U8_MAX) return 1;
  if (length < U16_MAX) return 3;
  if (length < U32_MAX) return 5;
  if (length < U64_MAX) return 9;
  return 16;
}
describe('Error Handling and Edge Cases', () => {
  describe('Buffer Overflow Protection', () => {
    test('should handle insufficient buffer space gracefully', () => {
      const LargeStruct = Struct({
        data: Collection(u32)
      });

      const smallBuffer = new ArrayBuffer(8); // Very small buffer
      const largeData = {
        data: Array.from({ length: 1000 }, (_, i) => i)
      };

      // This should either throw an error or handle gracefully
      expect(() => {
        encode(LargeStruct, largeData, smallBuffer);
      }).toThrow();
    });

    test('should decode partial data correctly', () => {
      const SimpleStruct = Struct({
        name: RString,
        value: u32
      });

      const buffer = new ArrayBuffer(64);
      const data = {
        name: "test",
        value: 42
      };

      const size = encode(SimpleStruct, data, buffer);

      // Test decoding with exact size
      const decoded = decode(SimpleStruct, buffer.slice(0, size));
      expect(decoded.value).toEqual(data);

      // Test decoding with larger buffer (should work)
      const decodedLarge = decode(SimpleStruct, buffer.slice(0, size + 10));
      expect(decodedLarge.value).toEqual(data);
    });
  });

  describe('Type Validation', () => {
    test('should handle empty strings', () => {
      const buffer = new ArrayBuffer(32);
      const emptyString = "";

      const size = encode(RString, emptyString, buffer);
      const decoded = decode(RString, buffer.slice(0, size));

      expect(decoded.value).toBe(emptyString);
      expect(size).toBe(8); // Just the length prefix
    });

    test('should handle maximum values', () => {
      const buffer = new ArrayBuffer(32);

      // Test u8 max
      const maxU8 = 255;
      let size = encode(u8, maxU8, buffer);
      let decoded = decode(u8, buffer.slice(0, size));
      expect(decoded.value).toBe(maxU8);

      // Test u16 max
      const maxU16 = 65535;
      size = encode(u16, maxU16, buffer);
      decoded = decode(u16, buffer.slice(0, size));
      expect(decoded.value).toBe(maxU16);

      // Test u32 max
      const maxU32 = 4294967295;
      size = encode(u32, maxU32, buffer);
      decoded = decode(u32, buffer.slice(0, size));
      expect(decoded.value).toBe(maxU32);
    });

    test('should handle unicode strings', () => {
      const buffer = new ArrayBuffer(128);
      const unicodeStrings = [
        "Hello 世界", // Mixed ASCII and Chinese
        "🚀🎯📦", // Emojis
        "Ñiño español", // Spanish with accents
        "Русский текст", // Cyrillic
        "🔥💯✨" // More emojis
      ];

      unicodeStrings.forEach(str => {
        const size = encode(RString, str, buffer);
        const decoded = decode(RString, buffer.slice(0, size));
        expect(decoded.value).toBe(str);
      });
    });
  });

  describe('Complex Nested Structures', () => {
    test('should handle deeply nested structures', () => {
      const InnerStruct = Struct({
        id: u32,
        name: RString
      });

      const MiddleStruct = Struct({
        inner: InnerStruct,
        count: u16
      });

      const OuterStruct = Struct({
        middle: MiddleStruct,
        items: Collection(u8)
      });

      const buffer = new ArrayBuffer(256);
      const complexData = {
        middle: {
          inner: {
            id: 12345,
            name: "nested item"
          },
          count: 100
        },
        items: [1, 2, 3, 4, 5, 10, 20, 30]
      };

      const size = encode(OuterStruct, complexData, buffer);
      const decoded = decode(OuterStruct, buffer.slice(0, size));

      expect(decoded.value.middle.inner.id).toBe(complexData.middle.inner.id);
      expect(decoded.value.middle.inner.name).toBe(complexData.middle.inner.name);
      expect(decoded.value.middle.count).toBe(complexData.middle.count);
      expect(decoded.value.items).toEqual(complexData.items);
    });

    test('should handle collections of structs', () => {
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
        { name: "Diana", age: 28 },
        { name: "Eve", age: 32 }
      ];

      const size = encode(PeopleCollection, people, buffer);
      const decoded = decode(PeopleCollection, buffer.slice(0, size));

      expect(decoded.value).toEqual(people);
      expect(decoded.value.length).toBe(people.length);
    });

    test('should handle empty collections in nested structures', () => {
      const DataStruct = Struct({
        metadata: RString,
        values: Collection(u32),
        tags: Collection(RString)
      });

      const buffer = new ArrayBuffer(128);
      const data = {
        metadata: "test data",
        values: [], // Empty number collection
        tags: [] // Empty string collection
      };

      const size = encode(DataStruct, data, buffer);
      const decoded = decode(DataStruct, buffer.slice(0, size));

      expect(decoded.value.metadata).toBe(data.metadata);
      expect(decoded.value.values).toEqual([]);
      expect(decoded.value.tags).toEqual([]);
    });
  });

  describe('Performance and Size Tests', () => {
    test('should efficiently encode large datasets', () => {
      const DataCollection = Collection(u32);
      const buffer = new ArrayBuffer(10000);

      // Create a large dataset
      const largeData = Array.from({ length: 1000 }, (_, i) => i * 2);

      const startTime = performance.now();
      const size = encode(DataCollection, largeData, buffer);
      const encodeTime = performance.now() - startTime;

      const decodeStartTime = performance.now();
      const decoded = decode(DataCollection, buffer.slice(0, size));
      const decodeTime = performance.now() - decodeStartTime;

      expect(decoded.value).toEqual(largeData);
      expect(encodeTime).toBeLessThan(100); // Should be fast
      expect(decodeTime).toBeLessThan(100); // Should be fast

      // Size should be reasonable (8 bytes for length + 4 bytes per u32)
      expect(size).toBe(8 + (largeData.length * 4));
    });

    test('should handle various string lengths efficiently', () => {
      const buffer = new ArrayBuffer(1024);
      const testStrings = [
        "",
        "a",
        "short",
        "a medium length string for testing",
        "a".repeat(100),
        "a".repeat(200)
      ];

      testStrings.forEach(str => {
        const size = encode(RString, str, buffer);
        const decoded = decode(RString, buffer.slice(0, size));

        expect(decoded.value).toBe(str);
        expect(size).toBe(8 + str.length); // 8 bytes length + string bytes
      });
    });
  });

  describe('Variable Length Encoding and Length Limits', () => {
    const variantConfig: BincodeConfig = { ...BincodeConfig.STANDARD, int_encoding: 'variant' };

    test('should handle variable length collections with variant encoding', () => {
      const VarCollection = Collection(u8);
      const buffer = new ArrayBuffer(2048);

      // Test different collection sizes around critical boundaries
      const testSizes = [0, 1, 5, 10, 100, 250, 251, 252, 300, 1000];

      testSizes.forEach(size => {
        const data = Array.from({ length: size }, (_, i) => i % 256);
        const encodedSize = encode(VarCollection, data, buffer, 0, variantConfig);
        const decoded = decode(VarCollection, buffer.slice(0, encodedSize), 0, variantConfig);

        expect(decoded.value).toEqual(data);
        expect(decoded.value.length).toBe(size);
        
        const expectedLengthBytes = expectedVariantLengthBytes(size);
        expect(encodedSize).toBe(expectedLengthBytes + size);
      });
    });

    test('should handle variable length strings with variant length encoding', () => {
      const buffer = new ArrayBuffer(2048);

      const testCases = [
        { str: "", expectedBytes: 0 },
        { str: "a", expectedBytes: 1 },
        { str: "hello", expectedBytes: 5 },
        { str: "世界", expectedBytes: 6 },
        { str: "🚀", expectedBytes: 4 },
        { str: "a".repeat(100), expectedBytes: 100 },
        { str: "a".repeat(250), expectedBytes: 250 }, // Just under 251 boundary
        { str: "a".repeat(251), expectedBytes: 251 }, // Exactly at 251 boundary
        { str: "a".repeat(252), expectedBytes: 252 }, // Just over 251 boundary
        { str: "a".repeat(300), expectedBytes: 300 }
      ];

      testCases.forEach(({ str, expectedBytes }) => {
        const size = encode(RString, str, buffer, 0, variantConfig);
        const decoded = decode(RString, buffer.slice(0, size), 0, variantConfig);

        expect(decoded.value).toBe(str);
        expect(size).toBe(expectedVariantLengthBytes(expectedBytes) + expectedBytes);
      });
    });

    test('should efficiently encode large collections with variant encoding', () => {
      const LimitedCollection = Collection(u32);
      const buffer = new ArrayBuffer(100000);

      // Test with sizes around critical variant encoding boundaries
      const testSizes = [250, 251, 252, 1000, 65535, 65536, 65537];
      
      testSizes.forEach(size => {
        const largeData = Array.from({ length: size }, (_, i) => i);
        const encodedSize = encode(LimitedCollection, largeData, buffer, 0, variantConfig);
        const decoded = decode(LimitedCollection, buffer.slice(0, encodedSize), 0, variantConfig);

        expect(decoded.value).toEqual(largeData);
        expect(encodedSize).toBe(expectedVariantLengthBytes(size) + (size * 4));
      });
    });

    test('should handle nested variable length structures with variant encoding', () => {
      const VarStruct = Struct({
        name: RString,
        data: Collection(u16),
        metadata: Collection(RString)
      });

      const buffer = new ArrayBuffer(2048);

      const testData = {
        name: "variable structure",
        data: [1, 2, 3, 4, 5, 100, 200, 300],
        metadata: ["tag1", "tag2", "a much longer metadata string", "🏷️"]
      };

      const size = encode(VarStruct, testData, buffer, 0, variantConfig);
      const decoded = decode(VarStruct, buffer.slice(0, size), 0, variantConfig);

      expect(decoded.value.name).toBe(testData.name);
      expect(decoded.value.data).toEqual(testData.data);
      expect(decoded.value.metadata).toEqual(testData.metadata);
    });

    test('should handle progressive size increases with variant encoding', () => {
      const ProgressiveCollection = Collection(u8);
      const buffer = new ArrayBuffer(70000);

      // Test encoding sizes that cross variant encoding boundaries at 251 and 65536
      const sizes = [1, 10, 249, 250, 251, 252, 1000, 65534, 65535, 65536, 65537];

      sizes.forEach(targetSize => {
        const data = Array.from({ length: targetSize }, (_, i) => i % 256);
        const encodedSize = encode(ProgressiveCollection, data, buffer, 0, variantConfig);
        const decoded = decode(ProgressiveCollection, buffer.slice(0, encodedSize), 0, variantConfig);

        expect(decoded.value).toEqual(data);
        expect(decoded.value.length).toBe(targetSize);

        expect(encodedSize).toBe(expectedVariantLengthBytes(targetSize) + targetSize);
      });
    });

    test('should validate variant length prefix consistency', () => {
      const TestCollection = Collection(u32);
      const buffer = new ArrayBuffer(70000);

      const testSizes = [0, 1, 5, 50, 249, 250, 251, 252, 1000, 65535, 65536];

      testSizes.forEach(size => {
        const data = Array.from({ length: size }, (_, i) => i * 10);
        const encodedSize = encode(TestCollection, data, buffer, 0, variantConfig);

        expect(encodedSize).toBe(expectedVariantLengthBytes(size) + (size * 4));

        const decoded = decode(TestCollection, buffer.slice(0, encodedSize), 0, variantConfig);
        expect(decoded.value.length).toBe(size);
      });
    });

    test('should handle extremely small and large string lengths with variant encoding', () => {
      const buffer = new ArrayBuffer(70000);

      // Test boundary cases for variant encoding at critical points
      const testCases = [
        { str: "" },                         // Empty string
        { str: "x" },                        // Single character
        { str: "x".repeat(249) },            // Just under 251
        { str: "x".repeat(250) },            // Just under 251
        { str: "x".repeat(251) },            // Exactly 251 (switches to 3-byte)
        { str: "x".repeat(252) },            // Just over 251
        { str: "x".repeat(1000) },           // Larger string (3-byte length)
        { str: "x".repeat(65535) },          // Just under 65536
        { str: "x".repeat(65536) }           // Exactly 65536 (switches to 5-byte)
      ];

      testCases.forEach(({ str }) => {
        const size = encode(RString, str, buffer, 0, variantConfig);
        const decoded = decode(RString, buffer.slice(0, size), 0, variantConfig);

        expect(decoded.value).toBe(str);
        expect(decoded.value.length).toBe(str.length);
        expect(size).toBe(expectedVariantLengthBytes(str.length) + str.length);
      });
    });

    test('should handle mixed variable length data efficiently with variant encoding', () => {
      const MixedStruct = Struct({
        shortString: RString,
        mediumString: RString,
        longString: RString,
        smallArray: Collection(u8),
        mediumArray: Collection(u32),
        largeArray: Collection(u16)
      });

      const buffer = new ArrayBuffer(150000);

      const mixedData = {
        shortString: "hi",                          // 1-byte length
        mediumString: "x".repeat(300),              // 3-byte length (>251)
        longString: "x".repeat(70000),              // 5-byte length (>65536)
        smallArray: [1, 2, 3],                      // 1-byte length
        mediumArray: Array.from({ length: 300 }, (_, i) => i),     // 3-byte length
        largeArray: Array.from({ length: 70000 }, (_, i) => i % 65536) // 5-byte length
      };

      const size = encode(MixedStruct, mixedData, buffer, 0, variantConfig);
      const decoded = decode(MixedStruct, buffer.slice(0, size), 0, variantConfig);

      expect(decoded.value.shortString).toBe(mixedData.shortString);
      expect(decoded.value.mediumString).toBe(mixedData.mediumString);
      expect(decoded.value.longString).toBe(mixedData.longString);
      expect(decoded.value.smallArray).toEqual(mixedData.smallArray);
      expect(decoded.value.mediumArray).toEqual(mixedData.mediumArray);
      expect(decoded.value.largeArray).toEqual(mixedData.largeArray);

      // Verify total size with correct variant encoding lengths
      const expectedSize =
        expectedVariantLengthBytes(mixedData.shortString.length) + mixedData.shortString.length +
        expectedVariantLengthBytes(mixedData.mediumString.length) + mixedData.mediumString.length +
        expectedVariantLengthBytes(mixedData.longString.length) + mixedData.longString.length +
        expectedVariantLengthBytes(mixedData.smallArray.length) + mixedData.smallArray.length +
        expectedVariantLengthBytes(mixedData.mediumArray.length) + (mixedData.mediumArray.length * 4) +
        expectedVariantLengthBytes(mixedData.largeArray.length) + (mixedData.largeArray.length * 2);

      expect(size).toBe(expectedSize);
    });

    test('should compare fixed vs variant encoding efficiency', () => {
      const TestCollection = Collection(u8);
      const buffer = new ArrayBuffer(70000);
      const fixedConfig = BincodeConfig.STANDARD;

      const testSizes = [10, 100, 250, 251, 252, 1000, 65535, 65536];

      testSizes.forEach(size => {
        const data = Array.from({ length: size }, (_, i) => i % 256);

        const variantSize = encode(TestCollection, data, buffer, 0, variantConfig);
        const fixedSize = encode(TestCollection, data, buffer, 0, fixedConfig);

        // Variant encoding should be more efficient for most sizes
        if (size < 251) {
          expect(variantSize).toBeLessThan(fixedSize);
          expect(variantSize).toBe(1 + size); // 1-byte length prefix
        } else if (size < 65536) {
          expect(variantSize).toBeLessThan(fixedSize);
          expect(variantSize).toBe(3 + size); // 3-byte length prefix
        } else {
          expect(variantSize).toBeLessThan(fixedSize);
          expect(variantSize).toBe(5 + size); // 5-byte length prefix
        }

        expect(fixedSize).toBe(8 + size); // Always 8-byte length prefix
      });
    });

    test('should handle boundary values precisely', () => {
      const TestCollection = Collection(u8);
      const buffer = new ArrayBuffer(70000);

      // Test exact boundary values
      const boundaryTests = [
        { size: 250, expectedLengthBytes: 1 },
        { size: 251, expectedLengthBytes: 3 },
        { size: 65535, expectedLengthBytes: 3 },
        { size: 65536, expectedLengthBytes: 5 }
      ];

      boundaryTests.forEach(({ size, expectedLengthBytes }) => {
        const data = Array.from({ length: size }, (_, i) => i % 256);
        const encodedSize = encode(TestCollection, data, buffer, 0, variantConfig);
        const decoded = decode(TestCollection, buffer.slice(0, encodedSize), 0, variantConfig);

        expect(decoded.value).toEqual(data);
        expect(encodedSize).toBe(expectedLengthBytes + size);
        expect(expectedVariantLengthBytes(size)).toBe(expectedLengthBytes);
      });
    });
  });
});
