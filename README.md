# Bincode-TS

A TypeScript implementation of Rust's bincode binary serialization format. This library provides type-safe binary serialization and deserialization that is fully compatible with Rust's bincode, enabling seamless data exchange between TypeScript/JavaScript and Rust applications.

## What is Bincode?

Bincode is a compact binary encoding format originally developed for Rust. It's designed to be:
- **Efficient**: Minimal overhead and fast serialization/deserialization
- **Deterministic**: Same input always produces the same binary output
- **Simple**: Straightforward binary format without self-describing metadata

This TypeScript implementation allows you to work with bincode-encoded data in JavaScript environments while maintaining full compatibility with Rust applications.

## Features

- 🦀 **100% Bincode Compatible**: Identical binary format to Rust's bincode library
- 🎯 **Type Safety**: Complete TypeScript support with compile-time type checking
- 🚀 **High Performance**: Efficient binary serialization optimized for speed
- 🌐 **Universal**: Works in Node.js, browsers, Deno, and other JavaScript runtimes
- 📦 **Zero Dependencies**: Pure TypeScript implementation with no external dependencies
- 🏗️ **Composable**: Build complex data structures from simple primitives
- 🔄 **Bidirectional**: Perfect interoperability with Rust bincode data

## Installation

```bash
npm install bincode-ts
```

## Quick Start

```typescript
import { Struct, String, u8, encode, decode } from 'bincode-ts';

// Define a struct type (identical to Rust struct definition)
const Person = Struct({
  name: String,
  age: u8
});

// Create data
const person = {
  name: "Alice",
  age: 30
};

// Encode to bincode binary format
const buffer = new ArrayBuffer(256);
const size = encode(Person, person, buffer);
const encoded = buffer.slice(0, size);

// Decode from bincode binary format
const decoded = decode(Person, encoded);
console.log(decoded.value); // { name: "Alice", age: 30 }
```

## Rust Interoperability

This library produces and consumes the exact same binary format as Rust's bincode, making it perfect for:

- **Microservices**: Communication between TypeScript and Rust services
- **WebAssembly**: Data exchange with Rust WASM modules  
- **Database Storage**: Reading/writing bincode data stored by Rust applications
- **Network Protocols**: Binary protocols shared between different language implementations
- **File Formats**: Processing files created by Rust applications using bincode

### Cross-Language Example

**Rust application:**
```rust
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
struct Person {
    name: String,
    age: u8,
}

let person = Person {
    name: "Alice".to_string(),
    age: 30,
};

// Serialize with Rust bincode
let rust_encoded = bincode::serialize(&person).unwrap();
```

**TypeScript application:**
```typescript
import { Struct, String, u8, decode } from 'bincode-ts';

const Person = Struct({
  name: String,
  age: u8
});

// Decode the exact same binary data produced by Rust
const decoded = decode(Person, rust_encoded);
console.log(decoded.value); // { name: "Alice", age: 30 }
```

The binary data is 100% compatible between both implementations!

## Supported Types

### Primitive Types
- **Unsigned Integers**: `u8`, `u16`, `u32`, `u64`
- **Signed Integers**: `i8`, `i16`, `i32`, `i64`
- **Floating Point**: `f32`, `f64`
- **Boolean**: `bool`
- **String**: `String` (UTF-8 encoded)
- **Unit**: `Unit` (zero-sized type)

### Composite Types
- **Struct**: Named field containers `Struct({ field: Type })`
- **Tuple**: Ordered type containers `Tuple(Type1, Type2, ...)`
- **Array**: Fixed-size collections `Array(Type, length)`
- **Collection**: Variable-size collections `Collection(Type)`
- **Enum**: Tagged unions with variants

### Utility Types
- **Option**: `Option(T)` - represents `Some(T)` or `None`
- **Result**: `Result(T, E)` - represents `Ok(T)` or `Err(E)`

### Custom Types
- **Custom**: `CustomType<T, Name>` - user-defined serialization logic for complex types
- Perfect for dates, UUIDs, colors, versioned data, and domain-specific types
- Full control over binary format while maintaining Rust compatibility

## Examples

Check out the [`examples/`](./examples/) directory for comprehensive examples:

### Basic Types
```typescript
import { u32, String, bool, encode, decode } from 'bincode-ts';

const data = 42;
const buffer = new ArrayBuffer(8);
const size = encode(u32, data, buffer);
const result = decode(u32, buffer.slice(0, size));
```

### Structs
```typescript
const User = Struct({
  id: u32,
  username: String,
  isActive: bool,
  score: f64
});

const user = {
  id: 123,
  username: "alice",
  isActive: true,
  score: 95.5
};
```

### Enums with Variants
```typescript
const Message = Enum({
  Text: _(0, String),
  Image: _(1, Struct({ url: String, width: u32, height: u32 })),
  Video: _(2, Struct({ url: String, duration: u32 }))
});

const message = $('Image', { url: "photo.jpg", width: 800, height: 600 });
```

### Collections
```typescript
const Numbers = Collection(u32);
const data = [1, 2, 3, 4, 5];

const Users = Collection(Struct({
  name: String,
  age: u8
}));
```

### Custom Types
```typescript
import { CustomType, TYPE_KIND } from 'bincode-ts';

// Date type that serializes as Unix timestamp
const DateType: CustomType<Date, 'Date'> = {
  [TYPE_KIND]: 'custom',
  type: 'Date',
  encode(buffer, value, offset, config) {
    const view = new DataView(buffer);
    view.setBigUint64(offset, BigInt(value.getTime()), config.endian === 'little');
    return offset + 8;
  },
  decode(buffer, offset, config) {
    const view = new DataView(buffer);
    const timestamp = Number(view.getBigUint64(offset, config.endian === 'little'));
    return { value: new Date(timestamp), offset: offset + 8 };
  }
};

// Usage
const now = new Date();
const buffer = new ArrayBuffer(16);
const size = encode(DateType, now, buffer);
const { value: decoded } = decode(DateType, buffer);
```

### Running Examples
```bash
# Run all examples
npm run examples

# Run specific examples
npm run examples:basic       # Basic type encoding/decoding
npm run examples:structs     # Struct examples
npm run examples:tuples      # Tuple examples  
npm run examples:collections # Collection examples
npm run examples:enums       # Enum examples
npm run examples:complex     # Complex nested structures
npm run examples:custom      # Custom type examples
```

## API Reference

### Core Functions

#### `encode<T>(type: T, value: Value<T>, buffer: ArrayBuffer, offset?: number): number`
Encodes a value into bincode binary format.
- **type**: The type definition
- **value**: The value to encode
- **buffer**: Target ArrayBuffer
- **offset**: Starting position (default: 0)
- **Returns**: Number of bytes written

#### `decode<T>(type: T, buffer: ArrayBuffer, offset?: number): { value: Value<T>, offset: number }`
Decodes a value from bincode binary format.
- **type**: The type definition
- **buffer**: Source ArrayBuffer
- **offset**: Starting position (default: 0)
- **Returns**: Object with decoded value and final offset

### Type Definitions

All type constructors follow the same pattern as Rust's type system:

```typescript
// Primitives
u8, u16, u32, u64, i8, i16, i32, i64, f32, f64, bool, String, Unit

// Composites
Struct({ field1: Type1, field2: Type2 })
Tuple(Type1, Type2, Type3)
Array(ElementType, length)
Collection(ElementType)
Enum({ Variant1: _(0), Variant2: _(1, DataType) })
Option(InnerType)
Result(OkType, ErrType)
```

## Development & Testing

```bash
# Install dependencies
npm install

# Build the TypeScript library
npm run build

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Lint the code
npm run lint

# Type check
npm run type-check
```

## Debugging

For debugging bincode encoding/decoding, check out the [`DEBUG.md`](./DEBUG.md) guide which includes:
- Setting up VS Code debugging for tests
- Inspecting binary data
- UTF-8 string length calculations
- Common troubleshooting tips

## Contributing

Contributions are welcome! Please ensure:
1. All tests pass (`npm test`)
2. Code follows the linting rules (`npm run lint`)
3. TypeScript compiles without errors (`npm run build`)
4. New features include appropriate tests

## License

MIT License - see the [LICENSE](./LICENSE) file for details.

## Related Projects

- [bincode (Rust)](https://github.com/bincode-org/bincode) - The original Rust implementation
- [serde (Rust)](https://serde.rs/) - Rust serialization framework that bincode uses
