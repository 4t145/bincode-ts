/**
 * Custom Types Examples
 * 
 * This file demonstrates how to create and use custom types in bincode-ts.
 * Custom types allow you to define your own serialization logic for complex
 * data structures that aren't directly supported by the built-in types.
 */

import {
    encode,
    decode,
    CustomType,
    TYPE_KIND,
    Struct,
    Collection
} from 'bincode-ts';

// ============================================================================
// Example 1: Date Custom Type
// ============================================================================

/**
 * A custom type that serializes JavaScript Date objects as Unix timestamps.
 * This provides compatibility with Rust's DateTime types.
 */
const DateType: CustomType<Date, 'Date'> = {
    [TYPE_KIND]: 'custom' as const,
    type: 'Date',

    encode(buffer: ArrayBuffer, value: Date, offset: number, config): number {
        const view = new DataView(buffer);
        const timestamp = value.getTime();
        view.setBigUint64(offset, BigInt(timestamp), config.endian === 'little');
        return offset + 8;
    },

    decode(buffer: ArrayBuffer, offset: number, config): { value: Date, offset: number } {
        const view = new DataView(buffer);
        const timestamp = Number(view.getBigUint64(offset, config.endian === 'little'));
        return {
            value: new Date(timestamp),
            offset: offset + 8
        };
    }
};

// ============================================================================
// Example 2: UUID Custom Type
// ============================================================================

/**
 * A custom type for UUID strings, stored as 16 bytes.
 * This is more efficient than storing UUIDs as strings.
 */
const UUIDType: CustomType<string, 'UUID'> = {
    [TYPE_KIND]: 'custom' as const,
    type: 'UUID',

    encode(buffer: ArrayBuffer, value: string, offset: number, _config): number {
        // Remove hyphens and convert hex string to bytes
        const hex = value.replace(/-/g, '');
        if (hex.length !== 32) {
            throw new Error('Invalid UUID format');
        }

        const bytes = new Uint8Array(buffer, offset, 16);
        for (let i = 0; i < 16; i++) {
            bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        return offset + 16;
    },

    decode(buffer: ArrayBuffer, offset: number, _config): { value: string, offset: number } {
        const bytes = new Uint8Array(buffer, offset, 16);
        const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
        const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
        return {
            value: uuid,
            offset: offset + 16
        };
    }
};

// ============================================================================
// Example 3: Complex Number Custom Type
// ============================================================================

/**
 * A custom type for complex numbers with real and imaginary parts.
 * Useful for mathematical computations or 2D coordinates.
 */
interface Complex {
    real: number;
    imaginary: number;
}

const ComplexType: CustomType<Complex, 'Complex'> = {
    [TYPE_KIND]: 'custom' as const,
    type: 'Complex',

    encode(buffer: ArrayBuffer, value: Complex, offset: number, config): number {
        const view = new DataView(buffer);
        view.setFloat64(offset, value.real, config.endian === 'little');
        view.setFloat64(offset + 8, value.imaginary, config.endian === 'little');
        return offset + 16;
    },

    decode(buffer: ArrayBuffer, offset: number, config): { value: Complex, offset: number } {
        const view = new DataView(buffer);
        const real = view.getFloat64(offset, config.endian === 'little');
        const imaginary = view.getFloat64(offset + 8, config.endian === 'little');
        return {
            value: { real, imaginary },
            offset: offset + 16
        };
    }
};

// ============================================================================
// Example 4: Color Custom Type (RGB)
// ============================================================================

/**
 * A custom type for RGB colors, stored as 3 bytes.
 * More compact than storing as separate fields.
 */
interface Color {
    r: number; // 0-255
    g: number; // 0-255
    b: number; // 0-255
}

const ColorType: CustomType<Color, 'Color'> = {
    [TYPE_KIND]: 'custom' as const,
    type: 'Color',

    encode(buffer: ArrayBuffer, value: Color, offset: number, _config): number {
        const bytes = new Uint8Array(buffer, offset, 3);
        bytes[0] = Math.min(255, Math.max(0, Math.round(value.r)));
        bytes[1] = Math.min(255, Math.max(0, Math.round(value.g)));
        bytes[2] = Math.min(255, Math.max(0, Math.round(value.b)));
        return offset + 3;
    },

    decode(buffer: ArrayBuffer, offset: number, _config): { value: Color, offset: number } {
        const bytes = new Uint8Array(buffer, offset, 3);
        return {
            value: {
                r: bytes[0],
                g: bytes[1],
                b: bytes[2]
            },
            offset: offset + 3
        };
    }
};

// ============================================================================
// Example 5: Versioned Data Custom Type
// ============================================================================

/**
 * A custom type that includes versioning for backwards compatibility.
 * This pattern is useful for evolving data formats.
 */
interface VersionedUser {
    version: number;
    name: string;
    email?: string; // Added in version 2
    age?: number;   // Added in version 3
}

const VersionedUserType: CustomType<VersionedUser, 'VersionedUser'> = {
    [TYPE_KIND]: 'custom' as const,
    type: 'VersionedUser',

    encode(buffer: ArrayBuffer, value: VersionedUser, offset: number, config): number {
        const view = new DataView(buffer);
        const encoder = new TextEncoder();

        // Write version
        view.setUint8(offset, value.version);
        offset += 1;

        // Write name
        const nameBytes = encoder.encode(value.name);
        view.setUint32(offset, nameBytes.length, config.endian === 'little');
        offset += 4;
        new Uint8Array(buffer).set(nameBytes, offset);
        offset += nameBytes.length;

        // Write optional fields based on version
        if (value.version >= 2 && value.email) {
            const emailBytes = encoder.encode(value.email);
            view.setUint32(offset, emailBytes.length, config.endian === 'little');
            offset += 4;
            new Uint8Array(buffer).set(emailBytes, offset);
            offset += emailBytes.length;
        } else if (value.version >= 2) {
            view.setUint32(offset, 0, config.endian === 'little'); // Empty email
            offset += 4;
        }

        if (value.version >= 3 && value.age !== undefined) {
            view.setUint8(offset, 1); // Has age
            view.setUint8(offset + 1, value.age);
            offset += 2;
        } else if (value.version >= 3) {
            view.setUint8(offset, 0); // No age
            offset += 1;
        }

        return offset;
    },

    decode(buffer: ArrayBuffer, offset: number, config): { value: VersionedUser, offset: number } {
        const view = new DataView(buffer);
        const decoder = new TextDecoder();

        // Read version
        const version = view.getUint8(offset);
        offset += 1;

        // Read name
        const nameLength = view.getUint32(offset, config.endian === 'little');
        offset += 4;
        const name = decoder.decode(new Uint8Array(buffer, offset, nameLength));
        offset += nameLength;

        const user: VersionedUser = { version, name };

        // Read optional fields based on version
        if (version >= 2) {
            const emailLength = view.getUint32(offset, config.endian === 'little');
            offset += 4;
            if (emailLength > 0) {
                user.email = decoder.decode(new Uint8Array(buffer, offset, emailLength));
                offset += emailLength;
            }
        }

        if (version >= 3) {
            const hasAge = view.getUint8(offset);
            offset += 1;
            if (hasAge) {
                user.age = view.getUint8(offset);
                offset += 1;
            }
        }

        return { value: user, offset };
    }
};

// ============================================================================
// Usage Examples
// ============================================================================

function runCustomTypeExamples() {
    console.log('=== Custom Types Examples ===\n');

    // Example 1: Date Type
    console.log('1. Date Custom Type:');
    const now = new Date();
    console.log('Original date:', now.toISOString());

    let buffer = new ArrayBuffer(256);
    let size = encode(DateType, now, buffer);
    let { value: decodedDate } = decode(DateType, buffer.slice(0, size));
    console.log('Decoded date:', decodedDate.toISOString());
    console.log('Encoded size:', size, 'bytes\n');

    // Example 2: UUID Type
    console.log('2. UUID Custom Type:');
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    console.log('Original UUID:', uuid);

    buffer = new ArrayBuffer(256);
    size = encode(UUIDType, uuid, buffer);
    let { value: decodedUuid } = decode(UUIDType, buffer.slice(0, size));
    console.log('Decoded UUID:', decodedUuid);
    console.log('Encoded size:', size, 'bytes\n');

    // Example 3: Complex Number Type
    console.log('3. Complex Number Custom Type:');
    const complex = { real: 3.14159, imaginary: -2.71828 };
    console.log('Original complex:', complex);

    buffer = new ArrayBuffer(256);
    size = encode(ComplexType, complex, buffer);
    let { value: decodedComplex } = decode(ComplexType, buffer.slice(0, size));
    console.log('Decoded complex:', decodedComplex);
    console.log('Encoded size:', size, 'bytes\n');

    // Example 4: Color Type
    console.log('4. Color Custom Type:');
    const color = { r: 255, g: 128, b: 0 }; // Orange
    console.log('Original color:', color);

    buffer = new ArrayBuffer(256);
    size = encode(ColorType, color, buffer);
    let { value: decodedColor } = decode(ColorType, buffer.slice(0, size));
    console.log('Decoded color:', decodedColor);
    console.log('Encoded size:', size, 'bytes\n');

    // Example 5: Versioned User Type
    console.log('5. Versioned User Custom Type:');
    const users = [
        { version: 1, name: 'Alice' },
        { version: 2, name: 'Bob', email: 'bob@example.com' },
        { version: 3, name: 'Charlie', email: 'charlie@example.com', age: 30 }
    ];

    for (const user of users) {
        console.log('Original user:', user);
        buffer = new ArrayBuffer(256);
        size = encode(VersionedUserType, user, buffer);
        let { value: decodedUser } = decode(VersionedUserType, buffer.slice(0, size));
        console.log('Decoded user:', decodedUser);
        console.log('Encoded size:', size, 'bytes\n');
    }

    // Example 6: Using Custom Types in Composite Structures
    console.log('6. Custom Types in Composite Structures:');

    const EventType = Struct({
        id: UUIDType,
        timestamp: DateType,
        location: ComplexType, // Using complex as 2D coordinates
        color: ColorType
    });

    const event = {
        id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        timestamp: new Date('2023-07-14T15:30:00.000Z'),
        location: { real: 40.7128, imaginary: -74.0060 }, // NYC coordinates
        color: { r: 255, g: 0, b: 0 } // Red
    };

    console.log('Original event:', event);
    buffer = new ArrayBuffer(512);
    size = encode(EventType, event, buffer);
    let { value: decodedEvent } = decode(EventType, buffer.slice(0, size));
    console.log('Decoded event:', decodedEvent);
    console.log('Encoded size:', size, 'bytes\n');

    // Example 7: Collection of Custom Types
    console.log('7. Collection of Custom Types:');
    const DateList = Collection(DateType);
    const dates = [
        new Date('2023-01-01T00:00:00.000Z'),
        new Date('2023-06-15T12:30:00.000Z'),
        new Date('2023-12-31T23:59:59.999Z')
    ];

    console.log('Original dates:', dates.map(d => d.toISOString()));
    buffer = new ArrayBuffer(512);
    size = encode(DateList, dates, buffer);
    let { value: decodedDates } = decode(DateList, buffer.slice(0, size));
    console.log('Decoded dates:', decodedDates.map(d => d.toISOString()));
    console.log('Encoded size:', size, 'bytes\n');
}

// ============================================================================
// Binary Compatibility Demonstration
// ============================================================================

function demonstrateBinaryCompatibility() {
    console.log('=== Binary Compatibility with Rust ===\n');

    // This shows how the binary format would be compatible with Rust
    console.log('Example Rust code that would produce compatible binary data:');
    console.log(`
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

#[derive(Serialize, Deserialize)]
struct CustomEvent {
    id: [u8; 16],           // UUID as 16 bytes
    timestamp: i64,         // Unix timestamp in milliseconds
    location: (f64, f64),   // Complex number as tuple
    color: (u8, u8, u8),    // RGB color as tuple
}

let event = CustomEvent {
    id: [/* 16 bytes of UUID */],
    timestamp: 1689339000000, // July 14, 2023 15:30:00 UTC
    location: (40.7128, -74.0060),
    color: (255, 0, 0),
};

let binary_data = bincode::serialize(&event).unwrap();
  `);

    console.log('The TypeScript custom types produce the same binary format!');
}

// Run examples if this file is executed directly
if (require.main === module) {
    runCustomTypeExamples();
    demonstrateBinaryCompatibility();
}

// Export the custom types for use in other files
export {
    DateType,
    UUIDType,
    ComplexType,
    ColorType,
    VersionedUserType,
    runCustomTypeExamples,
    demonstrateBinaryCompatibility
};
