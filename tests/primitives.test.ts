import {
  u8, u16, u32, u64, i8, i16, i32, i64, f32, f64, bool, String as RString, Unit,
  encode, decode
} from '../src/index.ts';

describe('Primitive Types', () => {
  describe('Unsigned Integers', () => {
    test('u8 encoding and decoding', () => {
      const buffer = new ArrayBuffer(16);
      
      // Test min value
      let size = encode(u8, 0, buffer);
      expect(size).toBe(1);
      let decoded = decode(u8, buffer.slice(0, size));
      expect(decoded.value).toBe(0);
      expect(decoded.offset).toBe(1);
      
      // Test max value
      size = encode(u8, 255, buffer);
      expect(size).toBe(1);
      decoded = decode(u8, buffer.slice(0, size));
      expect(decoded.value).toBe(255);
    });

    test('u16 encoding and decoding', () => {
      const buffer = new ArrayBuffer(16);
      
      const testValues = [0, 1, 65535, 32768];
      testValues.forEach(value => {
        const size = encode(u16, value, buffer);
        expect(size).toBe(2);
        
        const decoded = decode(u16, buffer.slice(0, size));
        expect(decoded.value).toBe(value);
        expect(decoded.offset).toBe(2);
      });
    });

    test('u32 encoding and decoding', () => {
      const buffer = new ArrayBuffer(16);
      
      const testValues = [0, 1, 4294967295, 2147483648];
      testValues.forEach(value => {
        const size = encode(u32, value, buffer);
        expect(size).toBe(4);
        
        const decoded = decode(u32, buffer.slice(0, size));
        expect(decoded.value).toBe(value);
        expect(decoded.offset).toBe(4);
      });
    });

    test('u64 encoding and decoding', () => {
      const buffer = new ArrayBuffer(16);
      
      const testValues = [
        BigInt(0),
        BigInt(1),
        BigInt('18446744073709551615'),
        BigInt('9223372036854775808')
      ];
      
      testValues.forEach(value => {
        const size = encode(u64, value, buffer);
        expect(size).toBe(8);
        
        const decoded = decode(u64, buffer.slice(0, size));
        expect(decoded.value).toBe(value);
        expect(decoded.offset).toBe(8);
      });
    });
  });

  describe('Signed Integers', () => {
    test('i8 encoding and decoding', () => {
      const buffer = new ArrayBuffer(16);
      
      const testValues = [-128, -1, 0, 1, 127];
      testValues.forEach(value => {
        const size = encode(i8, value, buffer);
        expect(size).toBe(1);
        
        const decoded = decode(i8, buffer.slice(0, size));
        expect(decoded.value).toBe(value);
      });
    });

    test('i16 encoding and decoding', () => {
      const buffer = new ArrayBuffer(16);
      
      const testValues = [-32768, -1, 0, 1, 32767];
      testValues.forEach(value => {
        const size = encode(i16, value, buffer);
        expect(size).toBe(2);
        
        const decoded = decode(i16, buffer.slice(0, size));
        expect(decoded.value).toBe(value);
      });
    });

    test('i32 encoding and decoding', () => {
      const buffer = new ArrayBuffer(16);
      
      const testValues = [-2147483648, -1, 0, 1, 2147483647];
      testValues.forEach(value => {
        const size = encode(i32, value, buffer);
        expect(size).toBe(4);
        
        const decoded = decode(i32, buffer.slice(0, size));
        expect(decoded.value).toBe(value);
      });
    });

    test('i64 encoding and decoding', () => {
      const buffer = new ArrayBuffer(16);
      
      const testValues = [
        BigInt('-9223372036854775808'),
        BigInt(-1),
        BigInt(0),
        BigInt(1),
        BigInt('9223372036854775807')
      ];
      
      testValues.forEach(value => {
        const size = encode(i64, value, buffer);
        expect(size).toBe(8);
        
        const decoded = decode(i64, buffer.slice(0, size));
        expect(decoded.value).toBe(value);
      });
    });
  });

  describe('Floating Point Numbers', () => {
    test('f32 encoding and decoding', () => {
      const buffer = new ArrayBuffer(16);
      
      const testValues = [0.0, 1.0, -1.0, 3.14159, -3.14159, 1.7976931348623157e+308];
      testValues.forEach(value => {
        const size = encode(f32, value, buffer);
        expect(size).toBe(4);
        
        const decoded = decode(f32, buffer.slice(0, size));
        if (Math.abs(value) < 1e30) { // Avoid overflow for f32
          expect(decoded.value).toBeCloseTo(value, 5);
        }
      });
    });

    test('f64 encoding and decoding', () => {
      const buffer = new ArrayBuffer(16);
      
      const testValues = [0.0, 1.0, -1.0, Math.PI, -Math.PI, Number.MAX_VALUE];
      testValues.forEach(value => {
        const size = encode(f64, value, buffer);
        expect(size).toBe(8);
        
        const decoded = decode(f64, buffer.slice(0, size));
        expect(decoded.value).toBeCloseTo(value, 10);
      });
    });
  });

  describe('Other Primitives', () => {
    test('bool encoding and decoding', () => {
      const buffer = new ArrayBuffer(16);
      
      // Test true
      let size = encode(bool, true, buffer);
      expect(size).toBe(1);
      let decoded = decode(bool, buffer.slice(0, size));
      expect(typeof decoded.value).toBe('boolean');
      
      // Test false
      size = encode(bool, false, buffer);
      expect(size).toBe(1);
      decoded = decode(bool, buffer.slice(0, size));
      expect(typeof decoded.value).toBe('boolean');
    });

    test('String encoding and decoding', () => {
      const buffer = new ArrayBuffer(256);
      
      const testStrings = [
        "",
        "Hello",
        "Hello, World!",
        "こんにちは", // Japanese
        "🚀🎯📦", // Emojis
        "A".repeat(100) // Long string
      ];
      
      testStrings.forEach(str => {
        const size = encode(RString, str, buffer);
        // should be 8 bytes for length + string bytes
        let stringBytesLength = new TextEncoder().encode(str).length;
        expect(size).toBe(8 + stringBytesLength);
        
        const decoded = decode(RString, buffer.slice(0, size));
        expect(decoded.value).toBe(str);
      });
    });

    test('Unit encoding and decoding', () => {
      const buffer = new ArrayBuffer(16);
      
      const size = encode(Unit, {}, buffer);
      expect(size).toBe(0);
      
      const decoded = decode(Unit, buffer.slice(0, size));
      expect(decoded.value).toEqual({});
      expect(decoded.offset).toBe(0);
    });
  });
});
