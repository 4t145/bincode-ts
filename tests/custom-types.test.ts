import { encode, decode, CustomType, u32, String, Struct, Collection, TYPE_KIND } from '../src/index';

describe('Custom Types', () => {
    // Example: Date custom type that serializes to timestamp
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
    // Example: UUID custom type (stored as 16 bytes)
    const UUIDType: CustomType<string, 'UUID'> = {
        [TYPE_KIND]: 'custom' as const,
        type: 'UUID',
        encode(buffer: ArrayBuffer, value: string, offset: number, _config): number {
            // Remove hyphens and convert to bytes
            const hex = value.replace(/-/g, '');
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

    // Example: Complex Number custom type
    const ComplexType: CustomType<{ real: number, imaginary: number }, 'Complex'> = {
        [TYPE_KIND]: 'custom' as const,
        type: 'Complex',
        encode(buffer: ArrayBuffer, value: { real: number, imaginary: number }, offset: number, config): number {
            const view = new DataView(buffer);
            view.setFloat64(offset, value.real, config.endian === 'little');
            view.setFloat64(offset + 8, value.imaginary, config.endian === 'little');
            return offset + 16;
        },
        decode(buffer: ArrayBuffer, offset: number, config): { value: { real: number, imaginary: number }, offset: number } {
            const view = new DataView(buffer);
            const real = view.getFloat64(offset, config.endian === 'little');
            const imaginary = view.getFloat64(offset + 8, config.endian === 'little');
            return {
                value: { real, imaginary },
                offset: offset + 16
            };
        }
    };

    describe('Date Custom Type', () => {
        it('should encode and decode Date objects correctly', () => {
            const date = new Date('2023-12-25T10:30:00.000Z');
            const buffer = new ArrayBuffer(16);

            const encodedSize = encode(DateType, date, buffer);
            expect(encodedSize).toBe(8);

            const { value: decoded, offset } = decode(DateType, buffer);
            expect(decoded).toEqual(date);
            expect(offset).toBe(8);
        });

        it('should handle different dates correctly', () => {
            const dates = [
                new Date(0), // Unix epoch
                new Date('1970-01-01T00:00:00.000Z'),
                new Date('2038-01-19T03:14:07.000Z'), // Year 2038 problem
                new Date('2023-07-14T12:00:00.000Z')
            ];

            for (const date of dates) {
                const buffer = new ArrayBuffer(16);
                encode(DateType, date, buffer);
                const { value: decoded } = decode(DateType, buffer);
                expect(decoded.getTime()).toBe(date.getTime());
            }
        });
    });

    describe('UUID Custom Type', () => {
        it('should encode and decode UUID strings correctly', () => {
            const uuid = '550e8400-e29b-41d4-a716-446655440000';
            const buffer = new ArrayBuffer(32);

            const encodedSize = encode(UUIDType, uuid, buffer);
            expect(encodedSize).toBe(16);

            const { value: decoded, offset } = decode(UUIDType, buffer);
            expect(decoded).toBe(uuid);
            expect(offset).toBe(16);
        });

        it('should handle different UUID formats', () => {
            const uuids = [
                '00000000-0000-0000-0000-000000000000',
                'ffffffff-ffff-ffff-ffff-ffffffffffff',
                '123e4567-e89b-12d3-a456-426614174000',
                '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
            ];

            for (const uuid of uuids) {
                const buffer = new ArrayBuffer(32);
                encode(UUIDType, uuid, buffer);
                const { value: decoded } = decode(UUIDType, buffer);
                expect(decoded.toLowerCase()).toBe(uuid.toLowerCase());
            }
        });
    });

    describe('Complex Number Custom Type', () => {
        it('should encode and decode complex numbers correctly', () => {
            const complex = { real: 3.14, imaginary: -2.71 };
            const buffer = new ArrayBuffer(32);

            const encodedSize = encode(ComplexType, complex, buffer);
            expect(encodedSize).toBe(16);

            const { value: decoded, offset } = decode(ComplexType, buffer);
            expect(decoded.real).toBeCloseTo(complex.real);
            expect(decoded.imaginary).toBeCloseTo(complex.imaginary);
            expect(offset).toBe(16);
        });

        it('should handle edge cases', () => {
            const testCases = [
                { real: 0, imaginary: 0 },
                { real: Infinity, imaginary: -Infinity },
                { real: 1e-10, imaginary: 1e10 },
                { real: -123.456, imaginary: 789.012 }
            ];

            for (const complex of testCases) {
                const buffer = new ArrayBuffer(32);
                encode(ComplexType, complex, buffer);
                const { value: decoded } = decode(ComplexType, buffer);
                expect(decoded.real).toBeCloseTo(complex.real);
                expect(decoded.imaginary).toBeCloseTo(complex.imaginary);
            }
        });
    });

    describe('Custom Types in Composite Structures', () => {
        it('should work within structs', () => {
            const PersonWithBirthdate = Struct({
                name: String,
                age: u32,
                birthdate: DateType
            });

            const person = {
                name: "Alice",
                age: 30,
                birthdate: new Date('1993-07-14T00:00:00.000Z')
            };

            const buffer = new ArrayBuffer(256);
            encode(PersonWithBirthdate, person, buffer);
            const { value: decoded } = decode(PersonWithBirthdate, buffer);

            expect(decoded.name).toBe(person.name);
            expect(decoded.age).toBe(person.age);
            expect(decoded.birthdate).toEqual(person.birthdate);
        });

        it('should work within collections', () => {
            const DateList = Collection(DateType);
            const dates = [
                new Date('2023-01-01T00:00:00.000Z'),
                new Date('2023-06-15T12:30:00.000Z'),
                new Date('2023-12-31T23:59:59.999Z')
            ];

            const buffer = new ArrayBuffer(512);
            encode(DateList, dates, buffer);
            const { value: decoded } = decode(DateList, buffer);

            expect(decoded).toHaveLength(dates.length);
            decoded.forEach((decodedDate, index) => {
                expect(decodedDate).toEqual(dates[index]);
            });
        });

        it('should handle nested custom types', () => {
            const EventType = Struct({
                id: UUIDType,
                timestamp: DateType,
                location: ComplexType // Using complex as 2D coordinates
            });

            const event = {
                id: '550e8400-e29b-41d4-a716-446655440000',
                timestamp: new Date('2023-07-14T15:30:00.000Z'),
                location: { real: 40.7128, imaginary: -74.0060 } // NYC coordinates
            };

            const buffer = new ArrayBuffer(512);
            encode(EventType, event, buffer);
            const { value: decoded } = decode(EventType, buffer);

            expect(decoded.id).toBe(event.id);
            expect(decoded.timestamp).toEqual(event.timestamp);
            expect(decoded.location.real).toBeCloseTo(event.location.real);
            expect(decoded.location.imaginary).toBeCloseTo(event.location.imaginary);
        });
    });

    describe('Error Handling', () => {
        it('should handle buffer overflow gracefully', () => {
            const date = new Date();
            const tooSmallBuffer = new ArrayBuffer(4); // Need 8 bytes for Date

            expect(() => encode(DateType, date, tooSmallBuffer)).toThrow();
            // Buffer overflow should throw an error
        });

        it('should handle malformed data', () => {
            const buffer = new ArrayBuffer(16);
            const view = new DataView(buffer);

            // Write invalid timestamp (NaN when converted to number)
            view.setBigUint64(0, BigInt('0xFFFFFFFFFFFFFFFF'), true);

            const { value: decoded } = decode(DateType, buffer);
            // Date should handle invalid timestamps
            expect(decoded).toBeInstanceOf(Date);
        });
    });

    describe('Configuration Compatibility', () => {
        it('should respect endianness configuration', () => {
            const complex = { real: 1.23, imaginary: 4.56 };
            const buffer = new ArrayBuffer(32);

            // Test little endian
            encode(ComplexType, complex, buffer, 0, { endian: 'little', int_encoding: 'fixed' });
            const { value: littleDecoded } = decode(ComplexType, buffer, 0, { endian: 'little', int_encoding: 'fixed' });

            // Test big endian
            const bigEndianBuffer = new ArrayBuffer(32);
            encode(ComplexType, complex, bigEndianBuffer, 0, { endian: 'big', int_encoding: 'fixed' });
            const { value: bigDecoded } = decode(ComplexType, bigEndianBuffer, 0, { endian: 'big', int_encoding: 'fixed' });

            expect(littleDecoded).toEqual(complex);
            expect(bigDecoded).toEqual(complex);

            // The binary data should be different due to endianness
            const littleBytes = new Uint8Array(buffer, 0, 16);
            const bigBytes = new Uint8Array(bigEndianBuffer, 0, 16);
            expect(littleBytes).not.toEqual(bigBytes);
        });
    });
});
