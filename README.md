# RType

A TypeScript library for binary serialization and deserialization with type safety, inspired by Rust's serde and bincode.

## Features

- 🎯 **Type-safe**: Full TypeScript support with compile-time type checking
- 🚀 **Fast**: Binary serialization for optimal performance
- 🔄 **Cross-platform**: Works in Node.js, browsers, and other JavaScript environments
- 📦 **Zero dependencies**: Pure TypeScript implementation
- 🏗️ **Composable**: Build complex types from simple primitives

## Installation

```bash
npm install rtype
```

## Quick Start

```typescript
import { Struct, Tuple, String, u8, encode, decode } from 'rtype';

// Define a struct type
const Person = Struct({
  name: String,
  age: u8
});

// Create some data
const person = {
  name: "Alice",
  age: 30
};

// Encode to binary
const buffer = new ArrayBuffer(256);
const size = encode(Person, person, buffer);
const encoded = buffer.slice(0, size);

// Decode from binary
const decoded = decode(Person, encoded);
console.log(decoded.value); // { name: "Alice", age: 30 }
```

## Supported Types

### Primitive Types
- **Integers**: `u8`, `u16`, `u32`, `u64`, `i8`, `i16`, `i32`, `i64`
- **Floats**: `f32`, `f64`
- **Boolean**: `bool`
- **String**: `String`
- **Unit**: `Unit` (empty type)

### Composite Types
- **Struct**: Named field containers
- **Tuple**: Ordered type containers  
- **Array**: Fixed-size collections
- **Collection**: Variable-size collections
- **Enum**: Tagged unions with variants

### Utility Types
- **Option**: `Some(T)` or `None`
- **Result**: `Ok(T)` or `Err(E)`

## Examples

### Structs
```typescript
const User = Struct({
  id: u32,
  username: String,
  isActive: bool
});
```

### Enums
```typescript
const Status = Enum({
  Pending: _(0),
  InProgress: _(1, Tuple(u8)), // with progress percentage
  Completed: _(2, Struct({ result: String }))
});

// Usage
const status = $('InProgress', 75);
```

### Collections
```typescript
const NumberList = Collection(u32);
const data = [1, 2, 3, 4, 5];
```

## API Reference

### Encoding
```typescript
encode<T>(type: T, value: Value<T>, buffer: ArrayBuffer, offset?: number): number
```

### Decoding
```typescript
decode<T>(type: T, buffer: ArrayBuffer, offset?: number): { value: Value<T>, offset: number }
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Lint the code
npm run lint
```

## License

MIT License - see LICENSE file for details.
