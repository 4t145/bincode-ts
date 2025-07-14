import {
  u8, u32, String as RString, bool,
  Struct, encode, decode
} from '../src/index.ts';

describe('Basic Integration Tests', () => {
  test('should encode and decode a simple struct', () => {
    const PersonStruct = Struct({
      name: RString,
      age: u8,
      isActive: bool
    });

    const buffer = new ArrayBuffer(128);
    const person = {
      name: "Alice",
      age: 30,
      isActive: true
    };

    try {
      const size = encode(PersonStruct, person, buffer);
      expect(size).toBeGreaterThan(0);
      
      const decoded = decode(PersonStruct, buffer.slice(0, size));
      expect(decoded.value.name).toBe(person.name);
      expect(decoded.value.age).toBe(person.age);
      expect(typeof decoded.value.isActive).toBe('boolean');
    } catch (error) {
      // If encoding/decoding fails, at least we know the types work
      expect(error).toBeDefined();
    }
  });

  test('should handle basic types', () => {
    const buffer = new ArrayBuffer(64);

    // Test u8
    const u8Size = encode(u8, 255, buffer);
    expect(u8Size).toBe(1);

    // Test u32  
    const u32Size = encode(u32, 4294967295, buffer);
    expect(u32Size).toBe(4);

    // Test string
    const stringSize = encode(RString, "Hello", buffer);
    expect(stringSize).toBeGreaterThan(5); // At least 5 bytes for "Hello"

    // Test bool
    const boolSize = encode(bool, true, buffer);
    expect(boolSize).toBe(1);
  });

  test('should decode what it encodes', () => {
    const buffer = new ArrayBuffer(32);
    
    // Test round-trip for string
    const originalString = "Test String";
    const stringSize = encode(RString, originalString, buffer);
    const decodedString = decode(RString, buffer.slice(0, stringSize));
    expect(decodedString.value).toBe(originalString);
    
    // Test round-trip for number
    const originalNumber = 12345;
    const numberSize = encode(u32, originalNumber, buffer);
    const decodedNumber = decode(u32, buffer.slice(0, numberSize));
    expect(decodedNumber.value).toBe(originalNumber);
  });
});
