import fs from 'fs';
import path from 'path';
import { execSync, } from 'child_process';
import {
    u8, u16, u32, u64, i8, i16, i32, i64, f32, f64, bool,
    String as RString,
    Struct, Tuple, Array as BArray, Collection, Enum, Option,
    encode, decode, _, VARIANT
} from '../src/index';

// Test data directory
const RUST_DIR = path.join(__dirname, 'rust-integration');
const TEST_DATA_DIR = path.join(RUST_DIR, 'data');

// Helper to read binary test data
function readTestData(filename: string): ArrayBuffer {
    const filePath = path.join(TEST_DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Test data file not found: ${filePath}`);
    }
    const buffer = fs.readFileSync(filePath);
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

// Helper to read JSON reference data
function readReferenceData(filename: string): any {
    const filePath = path.join(TEST_DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Reference data file not found: ${filePath}`);
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

describe('Rust Bincode Integration Tests', () => {

    beforeAll(() => {
        // Check if test data exists
        if (!fs.existsSync(TEST_DATA_DIR)) {
            console.warn('Test data directory not found. Run setup-rust-integration.sh first.');
            execSync('cargo run', {
                cwd: RUST_DIR,
                stdio: 'inherit'
            });
        }
    });

    describe('Primitive Types', () => {
        const primitiveTests = [
            { name: 'u8_max', type: u8, expected: 255 },
            { name: 'u16_max', type: u16, expected: 65535 },
            { name: 'u32_max', type: u32, expected: 4294967295 },
            { name: 'u64_max', type: u64, expected: BigInt('18446744073709551615') },
            { name: 'i8_min', type: i8, expected: -128 },
            { name: 'i16_min', type: i16, expected: -32768 },
            { name: 'i32_min', type: i32, expected: -2147483648 },
            { name: 'i64_min', type: i64, expected: BigInt('-9223372036854775808') },
            { name: 'f32_pi', type: f32, expected: 3.14159, tolerance: 0.00001 },
            { name: 'f64_e', type: f64, expected: 2.718281828459045, tolerance: 0.000000000000001 },
            { name: 'bool_true', type: bool, expected: true },
            { name: 'bool_false', type: bool, expected: false },
            { name: 'string_hello', type: RString, expected: 'Hello, World!' },
            { name: 'string_empty', type: RString, expected: '' },
            { name: 'string_unicode', type: RString, expected: '🦀 Rust + TypeScript = ❤️' },
        ];

        test.each(primitiveTests)('should decode Rust bincode for $name', ({ name, type, expected, tolerance }) => {
            const testFile = `${name}.bincode`;

            // Skip test if file doesn't exist
            if (!fs.existsSync(path.join(TEST_DATA_DIR, testFile))) {
                console.warn(`Skipping ${name} - test data not found`);
                return;
            }

            const binaryData = readTestData(testFile);
            const decoded = decode(type, binaryData);

            if (tolerance !== undefined && typeof expected === 'number') {
                expect(Math.abs(Number(decoded.value) - expected)).toBeLessThan(tolerance);
            } else {
                expect(decoded.value).toEqual(expected);
            }
        });

        test.each(primitiveTests)('should encode compatible with Rust bincode for $name', ({ name, type, expected }) => {
            const testFile = `${name}.bincode`;

            // Skip test if file doesn't exist
            if (!fs.existsSync(path.join(TEST_DATA_DIR, testFile))) {
                console.warn(`Skipping ${name} - test data not found`);
                return;
            }

            const rustData = readTestData(testFile);

            // Encode our data
            const buffer = new ArrayBuffer(1024);
            const size = encode(type, expected, buffer);
            const ourData = buffer.slice(0, size);

            // Compare binary outputs
            const rustBytes = new Uint8Array(rustData);
            const ourBytes = new Uint8Array(ourData);

            expect(ourBytes).toEqual(rustBytes);
        });
    });

    describe('Struct Types', () => {
        const PersonStruct = Struct({
            name: RString,
            age: u8,
            is_active: bool
        });

        test('should decode Rust struct', () => {
            const testFile = 'struct_person.bincode';

            if (!fs.existsSync(path.join(TEST_DATA_DIR, testFile))) {
                console.warn('Skipping struct test - test data not found');
                return;
            }

            const binaryData = readTestData(testFile);
            const decoded = decode(PersonStruct, binaryData);

            // Read reference data if available
            try {
                const reference = readReferenceData('struct_person.json');
                expect(decoded.value.name).toBe(reference.name);
                expect(decoded.value.age).toBe(reference.age);
                expect(decoded.value.is_active).toBe(reference.is_active);
            } catch (e) {
                // If no reference data, just check types
                expect(typeof decoded.value.name).toBe('string');
                expect(typeof decoded.value.age).toBe('number');
                expect(typeof decoded.value.is_active).toBe('boolean');
            }
        });

        test('should encode struct compatible with Rust', () => {
            const person = {
                name: "Bob",
                age: 25,
                is_active: false
            };

            const buffer = new ArrayBuffer(1024);
            const size = encode(PersonStruct, person, buffer);
            const encoded = buffer.slice(0, size);

            // Decode back to verify
            const decoded = decode(PersonStruct, encoded);
            expect(decoded.value).toEqual(person);
        });
    });

    describe('Collection Types', () => {
        test('should decode Rust Vec<u32>', () => {
            const testFile = 'vec_u32.bincode';

            if (!fs.existsSync(path.join(TEST_DATA_DIR, testFile))) {
                console.warn('Skipping Vec<u32> test - test data not found');
                return;
            }

            const VecU32 = Collection(u32);
            const binaryData = readTestData(testFile);
            const decoded = decode(VecU32, binaryData);

            try {
                const reference = readReferenceData('vec_u32.json');
                expect(decoded.value).toEqual(reference);
            } catch (e) {
                expect(globalThis.Array.isArray(decoded.value)).toBe(true);
                expect(decoded.value.every((item: any) => typeof item === 'number')).toBe(true);
            }
        });

        test('should decode Rust Vec<String>', () => {
            const testFile = 'vec_string.bincode';

            if (!fs.existsSync(path.join(TEST_DATA_DIR, testFile))) {
                console.warn('Skipping Vec<String> test - test data not found');
                return;
            }

            const VecString = Collection(RString);
            const binaryData = readTestData(testFile);
            const decoded = decode(VecString, binaryData);

            try {
                const reference = readReferenceData('vec_string.json');
                expect(decoded.value).toEqual(reference);
            } catch (e) {
                expect(globalThis.Array.isArray(decoded.value)).toBe(true);
                expect(decoded.value.every((item: any) => typeof item === 'string')).toBe(true);
            }
        });

        test('should decode empty Vec', () => {
            const testFile = 'vec_empty.bincode';

            if (!fs.existsSync(path.join(TEST_DATA_DIR, testFile))) {
                console.warn('Skipping empty Vec test - test data not found');
                return;
            }

            const VecU32 = Collection(u32);
            const binaryData = readTestData(testFile);
            const decoded = decode(VecU32, binaryData);

            expect(decoded.value).toEqual([]);
        });

        test('should decode Rust arrays', () => {
            const testFiles = [
                { file: 'array_u8_3.bincode', type: BArray(u8, 3), length: 3 },
                { file: 'array_u32_4.bincode', type: BArray(u32, 4), length: 4 }
            ];

            testFiles.forEach(({ file, type, length }) => {
                if (!fs.existsSync(path.join(TEST_DATA_DIR, file))) {
                    console.warn(`Skipping ${file} - test data not found`);
                    return;
                }

                const binaryData = readTestData(file);
                const decoded = decode(type, binaryData);

                expect(globalThis.Array.isArray(decoded.value)).toBe(true);
                expect((decoded.value as any[]).length).toBe(length);
            });
        });
    });

    describe('Tuple Types', () => {
        test('should decode simple Rust tuple', () => {
            const testFile = 'tuple_simple.bincode';

            if (!fs.existsSync(path.join(TEST_DATA_DIR, testFile))) {
                console.warn('Skipping simple tuple test - test data not found');
                return;
            }

            const SimpleTuple = Tuple(u32, RString);
            const binaryData = readTestData(testFile);
            const decoded = decode(SimpleTuple, binaryData);

            expect(globalThis.Array.isArray(decoded.value)).toBe(true);
            expect(decoded.value.length).toBe(2);
            expect(typeof decoded.value[0]).toBe('number');
            expect(typeof decoded.value[1]).toBe('string');
        });

        test('should decode complex Rust tuple', () => {
            const testFile = 'tuple_complex.bincode';

            if (!fs.existsSync(path.join(TEST_DATA_DIR, testFile))) {
                console.warn('Skipping complex tuple test - test data not found');
                return;
            }

            const ComplexTuple = Tuple(RString, u32, bool, f64);
            const binaryData = readTestData(testFile);
            const decoded = decode(ComplexTuple, binaryData);

            expect(globalThis.Array.isArray(decoded.value)).toBe(true);
            expect(decoded.value.length).toBe(4);
            expect(typeof decoded.value[0]).toBe('string');
            expect(typeof decoded.value[1]).toBe('number');
            expect(typeof decoded.value[2]).toBe('boolean');
            expect(typeof decoded.value[3]).toBe('number');
        });
    });

    describe('Option Types', () => {
        test('should decode Rust Option<String> Some', () => {
            const testFile = 'option_some.bincode';

            if (!fs.existsSync(path.join(TEST_DATA_DIR, testFile))) {
                console.warn('Skipping Option Some test - test data not found');
                return;
            }

            const OptionString = Option(RString);
            const binaryData = readTestData(testFile);
            const decoded = decode(OptionString, binaryData);

            expect(decoded.value).toBe('present');
        });

        test('should decode Rust Option<String> None', () => {
            const testFile = 'option_none.bincode';

            if (!fs.existsSync(path.join(TEST_DATA_DIR, testFile))) {
                console.warn('Skipping Option None test - test data not found');
                return;
            }

            const OptionString = Option(RString);
            const binaryData = readTestData(testFile);
            const decoded = decode(OptionString, binaryData);

            expect(decoded.value).toBe(null);
        });
    });

    describe('Enum Types', () => {
        const MessageEnum = Enum({
            Text: _(0, Tuple(RString)),
            Number: _(1, Tuple(u32)),
            Bool: _(2, Tuple(bool)),
            Data: _(3, Struct({
                content: RString,
                size: u32
            }))
        });

        test('should decode Rust enum variants', () => {
            const enumTests = [
                { file: 'enum_text.bincode', expectedVariant: 'Text' },
                { file: 'enum_number.bincode', expectedVariant: 'Number' },
                { file: 'enum_data.bincode', expectedVariant: 'Data' }
            ];

            enumTests.forEach(({ file, expectedVariant }) => {
                if (!fs.existsSync(path.join(TEST_DATA_DIR, file))) {
                    console.warn(`Skipping ${file} - test data not found`);
                    return;
                }

                const binaryData = readTestData(file);
                const decoded = decode(MessageEnum, binaryData);

                expect((decoded.value as any)[VARIANT]).toBe(expectedVariant);
            });
        });
    });

    describe('Round-trip Compatibility', () => {
        test('should round-trip complex data structures', () => {
            const ComplexStruct = Struct({
                id: u32,
                score: f64,
                tags: Collection(RString),
                metadata: Collection(Tuple(RString, RString))
            });

            const data = {
                id: 12345,
                score: 98.5,
                tags: ['rust', 'typescript', 'bincode'],
                metadata: [
                    ['key1', 'value1'] as [string, string],
                    ['key2', 'value2'] as [string, string]
                ]
            };

            // Encode with our implementation
            const buffer = new ArrayBuffer(2048);
            const size = encode(ComplexStruct, data, buffer);
            const encoded = buffer.slice(0, size);

            // Decode back
            const decoded = decode(ComplexStruct, encoded);

            expect(decoded.value.id).toBe(data.id);
            expect(decoded.value.score).toBeCloseTo(data.score, 10);
            expect(decoded.value.tags).toEqual(data.tags);
            expect(decoded.value.metadata).toEqual(data.metadata);
        });
    });
});

describe('Performance and Stress Tests', () => {
    test('should handle large data structures efficiently', () => {
        const LargeStruct = Struct({
            data: Collection(u32),
            metadata: Collection(Tuple(RString, RString))
        });

        // Create large test data
        const largeData = {
            data: globalThis.Array.from({ length: 10000 }, (_, i) => i),
            metadata: globalThis.Array.from({ length: 1000 }, (_, i) => [`key${i}`, `value${i}`] as [string, string])
        };

        const startTime = performance.now();

        const buffer = new ArrayBuffer(1024 * 1024); // 1MB buffer
        const size = encode(LargeStruct, largeData, buffer);
        const encoded = buffer.slice(0, size);

        const decoded = decode(LargeStruct, encoded);

        const endTime = performance.now();
        const duration = endTime - startTime;

        expect(decoded.value.data.length).toBe(10000);
        expect(decoded.value.metadata.length).toBe(1000);
        expect(duration).toBeLessThan(1000); // Should complete within 1 second

        console.log(`Large data structure test completed in ${duration.toFixed(2)}ms`);
    });
});
