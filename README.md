# bincode-ts

[![CI](https://github.com/4t145/bincode-ts/workflows/CI/badge.svg)](https://github.com/4t145/bincode-ts/actions?query=workflow%3ACI)
[![codecov](https://codecov.io/gh/4t145/bincode-ts/branch/main/graph/badge.svg)](https://codecov.io/gh/4t145/bincode-ts)
[![npm version](https://badge.fury.io/js/bincode-ts.svg)](https://badge.fury.io/js/bincode-ts)
[![npm downloads](https://img.shields.io/npm/dm/bincode-ts.svg)](https://www.npmjs.com/package/bincode-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://badgen.net/badge/Built%20With/TypeScript/blue)](https://www.typescriptlang.org/)
[![Rust Compatible](https://img.shields.io/badge/Rust%20Bincode-Compatible-orange.svg)](https://github.com/bincode-org/bincode)

A high-performance TypeScript library for type-safe binary serialization using Rust-inspired bincode format. bincode-ts provides efficient encoding and decoding of complex data structures with full TypeScript type safety and support for both fixed and variable-length encoding schemes.

## What is bincode-ts?

bincode-ts is a binary serialization library that brings Rust's type system concepts to TypeScript, offering:
- **Type Safety**: Full TypeScript support with compile-time type checking
- **High Performance**: Efficient binary serialization optimized for speed
- **Flexible Encoding**: Support for both fixed and variable-length integer encoding
- **Zero Dependencies**: Pure TypeScript implementation
- **Composable Types**: Build complex data structures from simple primitives
- **Memory Efficient**: Minimal overhead binary format

## Features

- 🎯 **Complete Type Safety**: Full TypeScript type inference and checking
- 🚀 **High Performance**: Optimized binary encoding/decoding
- 📊 **Multiple Encoding Modes**: Fixed-length and variable-length integer encoding
- 🏗️ **Composable Architecture**: Combine primitive and composite types
- 🌐 **Universal Compatibility**: Works in Node.js, browsers, and other JavaScript runtimes
- 🔧 **Custom Types**: Extensible with user-defined serialization logic
- 📦 **Zero Dependencies**: No external dependencies

## Installation

```bash
npm install bincode-ts
```

## Quick Start

```typescript
import { Struct, String, u8, u32, encode, decode } from 'bincode-ts';

// Define a struct type
const Person = Struct({
  name: String,
  age: u8,
  id: u32
});

// Create data
const person = {
  name: "Alice",
  age: 30,
  id: 12345
};

// Encode to binary format
const buffer = new ArrayBuffer(256);
const size = encode(Person, person, buffer);
const encoded = buffer.slice(0, size);

// Decode from binary format
const decoded = decode(Person, encoded);
console.log(decoded.value); // { name: "Alice", age: 30, id: 12345 }
console.log(decoded.offset); // Number of bytes read
```

## Supported Types

### Primitive Types

#### Unsigned Integers
- `u8` - 8-bit unsigned integer (0 to 255)
- `u16` - 16-bit unsigned integer (0 to 65,535)
- `u32` - 32-bit unsigned integer (0 to 4,294,967,295)
- `u64` - 64-bit unsigned integer (BigInt)

#### Signed Integers
- `i8` - 8-bit signed integer (-128 to 127)
- `i16` - 16-bit signed integer (-32,768 to 32,767)
- `i32` - 32-bit signed integer (-2,147,483,648 to 2,147,483,647)
- `i64` - 64-bit signed integer (BigInt)

#### Floating Point
- `f32` - 32-bit floating point number
- `f64` - 64-bit floating point number

#### Other Primitives
- `bool` - Boolean value
- `String` - UTF-8 encoded string with variable length
- `Unit` - Zero-sized type

### Composite Types

#### Struct
Named field containers for structured data:

```typescript
const User = Struct({
  id: u32,
  username: String,
  email: String,
  isActive: bool,
  balance: f64
});

const user = {
  id: 123,
  username: "alice",
  email: "alice@example.com",
  isActive: true,
  balance: 1000.50
};
```

#### Tuple
Ordered collections of heterogeneous types:

```typescript
const Coordinates = Tuple(f32, f32, f32); // (x, y, z)
const point: [number, number, number] = [1.0, 2.0, 3.0];

const UserInfo = Tuple(String, u8, bool);
const info: [string, number, boolean] = ["Alice", 30, true];
```

#### Array
Fixed-size collections of homogeneous types:

```typescript
const Numbers = Array(u32, 5);
const data = array(1, 2, 3, 4, 5); // Exactly 5 elements

const Matrix = Array(Array(f32, 3), 3); // 3x3 matrix
```

#### Collection
Variable-size collections:

```typescript
const NumberList = Collection(u32);
const numbers = [1, 2, 3, 4, 5]; // Any number of elements

const StringList = Collection(String);
const tags = ["typescript", "rust", "serialization"];
```

#### Enum
Tagged unions with variants:

```typescript
const Status = Enum({
  Success: _(0),
  Error: _(1, Tuple(String)),
  Pending: _(2),
  InProgress: _(3, Tuple(u8)) // Progress percentage
});

// Create enum values
const success = $('Success');
const error = $('Error', ["Network timeout"] as [string]);
const progress = $('InProgress', [75] as [number]);
```

#### Option
Represents optional values:

```typescript
const OptionalNumber = Option(u32);

// Some value
const someValue = 42;
const encodedSome = encode(OptionalNumber, someValue, buffer);

// None value
const noneValue = null;
const encodedNone = encode(OptionalNumber, noneValue, buffer);
```

#### Result
Represents success/error states:

```typescript
const StringResult = Result(String, u32);

// Success case
const okValue = $('Ok', ["Success message"] as [string]);

// Error case  
const errValue = $('Err', [404] as [number]);
```

## Encoding Configurations

bincode-ts supports different encoding configurations for optimal performance:

### Standard (Fixed-Length) Encoding

```typescript
import { BincodeConfig } from 'bincode-ts';

const config = BincodeConfig.STANDARD; // Default configuration
// - Little endian byte order
// - Fixed 8-byte length prefixes for collections and strings
// - Compatible with Rust bincode default settings
```

### Variable-Length Encoding

```typescript
const variantConfig: BincodeConfig = {
  endian: 'little',
  int_encoding: 'variant', // Variable-length encoding
  limit: undefined
};

// More efficient for smaller collections and strings
const data = ["short", "strings"];
const size = encode(Collection(String), data, buffer, 0, variantConfig);
```

Variable-length encoding uses:
- 1 byte for lengths < 251
- 3 bytes for lengths 251-65535  
- 5 bytes for lengths 65536-4294967295
- 9 bytes for larger lengths

## Complex Examples

### Nested Structures

```typescript
const Address = Struct({
  street: String,
  city: String,
  zipCode: u32
});

const Person = Struct({
  name: String,
  age: u8,
  address: Address,
  tags: Collection(String),
  scores: Array(u8, 3)
});

const person = {
  name: "John Doe",
  age: 30,
  address: {
    street: "123 Main St",
    city: "Springfield", 
    zipCode: 12345
  },
  tags: ["developer", "typescript"],
  scores: array(95, 87, 92)
};
```

### Collections of Structs

```typescript
const Employee = Struct({
  name: String,
  id: u32,
  department: String
});

const EmployeeList = Collection(Employee);

const employees = [
  { name: "Alice", id: 1001, department: "Engineering" },
  { name: "Bob", id: 1002, department: "Marketing" },
  { name: "Charlie", id: 1003, department: "Sales" }
];

const buffer = new ArrayBuffer(1024);
const size = encode(EmployeeList, employees, buffer);
const decoded = decode(EmployeeList, buffer.slice(0, size));
```

### Custom Types

```typescript
import { CustomTypeClass, BincodeConfig } from 'bincode-ts';

// Custom Date type that serializes as Unix timestamp
class DateType extends CustomTypeClass<Date, 'Date'> {
  readonly type = 'Date';

  encode(buffer: ArrayBuffer, value: Date, offset: number, config: BincodeConfig): number {
    const view = new DataView(buffer);
    const timestamp = BigInt(value.getTime());
    view.setBigUint64(offset, timestamp, config.endian === 'little');
    return offset + 8;
  }

  decode(buffer: ArrayBuffer, offset: number, config: BincodeConfig): { value: Date, offset: number } {
    const view = new DataView(buffer);
    const timestamp = view.getBigUint64(offset, config.endian === 'little');
    return {
      value: new Date(Number(timestamp)),
      offset: offset + 8
    };
  }
}

const dateType = new DateType();

// Usage
const now = new Date();
const buffer = new ArrayBuffer(16);
const size = encode(dateType, now, buffer);
const { value: decoded } = decode(dateType, buffer);
```

## Error Handling

Bincode-TS provides comprehensive error handling with specific error types:

```typescript
import { BincodeError } from 'bincode-ts';

try {
  const result = decode(SomeType, buffer);
  console.log(result.value);
} catch (error) {
  if (error instanceof BincodeError) {
    switch (error.bincodeErrorKind) {
      case 'OverflowLimit':
        console.error('Buffer overflow:', error.message);
        break;
      case 'InvalidVariant':
        console.error('Invalid enum variant:', error.message);
        break;
      case 'InvalidType':
        console.error('Type validation failed:', error.message);
        break;
      // Handle other error types...
    }
  }
}
```

## API Reference

### Core Functions

#### `encode<T>(type: T, value: Value<T>, buffer: ArrayBuffer, offset?: number, config?: BincodeConfig): number`

Encodes a value into binary format.

**Parameters:**
- `type`: The type definition
- `value`: The value to encode (must match the type)
- `buffer`: Target ArrayBuffer
- `offset`: Starting position (default: 0)
- `config`: Encoding configuration (default: BincodeConfig.STANDARD)

**Returns:** Number of bytes written

#### `decode<T>(type: T, buffer: ArrayBuffer, offset?: number, config?: BincodeConfig): { value: Value<T>, offset: number }`

Decodes a value from binary format.

**Parameters:**
- `type`: The type definition
- `buffer`: Source ArrayBuffer containing binary data
- `offset`: Starting position (default: 0)  
- `config`: Decoding configuration (default: BincodeConfig.STANDARD)

**Returns:** Object with decoded value and final offset

### Utility Functions

#### `array<T, N>(...elements: T[]): T[] & { readonly length: N }`

Creates a fixed-length array for use with Array types:

```typescript
const fixedArray = array(1, 2, 3, 4, 5); // length is exactly 5
const ArrayType = Array(u32, 5);
```

#### `$<K, V>(variant: K, value?: V): EnumVariantValue<K, V>`

Creates enum variant values:

```typescript
const success = $('Success');
const error = $('Error', ["Something went wrong"]);
```

## Performance Considerations

### Buffer Sizing

Pre-allocate appropriately sized buffers to avoid reallocations:

```typescript
// For collections, estimate: 8 bytes (length) + (element_count * element_size)
const estimatedSize = 8 + (1000 * 4); // 1000 u32 values
const buffer = new ArrayBuffer(estimatedSize);
```

### Variable vs Fixed Encoding

- Use **variable encoding** for small collections and short strings
- Use **fixed encoding** for consistent performance and larger datasets

### Memory Usage

```typescript
// Efficient: reuse buffers
const buffer = new ArrayBuffer(4096);
let offset = 0;

offset = encode(Type1, value1, buffer, offset);
offset = encode(Type2, value2, buffer, offset);
offset = encode(Type3, value3, buffer, offset);

// Get the used portion
const used = buffer.slice(0, offset);
```

## Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --testNamePattern="Primitive Types"
npm test -- --testNamePattern="Composite Types"
npm test -- --testNamePattern="Error Handling"

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Lint code
npm run lint

# Type checking
npm run type-check
```

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass (`npm test`)
2. Code follows linting rules (`npm run lint`) 
3. TypeScript compiles without errors (`npm run build`)
4. Add tests for new features
5. Update documentation as needed

## License

MIT License - see the [LICENSE](./LICENSE) file for details.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and breaking changes.
