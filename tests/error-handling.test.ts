import {
  u8, u16, u32, String as RString,
  Struct, Collection, encode, decode
} from '../src/index';

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
});
