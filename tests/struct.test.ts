import {
  u8, u16, u32, String as RString, bool, f32,
  Struct, Tuple, Array, Collection,
  encode, decode,
  array,
} from '../src/index';

describe('Composite Types', () => {
  describe('Struct', () => {
    test('Simple struct encoding and decoding', () => {
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

      const size = encode(PersonStruct, person, buffer);
      const decoded = decode(PersonStruct, buffer.slice(0, size));

      expect(decoded.value.name).toBe(person.name);
      expect(decoded.value.age).toBe(person.age);
      expect(decoded.value.isActive).toBe(person.isActive);
    });

    test('Nested struct encoding and decoding', () => {
      const AddressStruct = Struct({
        street: RString,
        zipCode: u32
      });

      const PersonStruct = Struct({
        name: RString,
        address: AddressStruct
      });

      const buffer = new ArrayBuffer(256);
      const person = {
        name: "Bob",
        address: {
          street: "123 Main St",
          zipCode: 12345
        }
      };

      const size = encode(PersonStruct, person, buffer);
      const decoded = decode(PersonStruct, buffer.slice(0, size));

      expect(decoded.value.name).toBe(person.name);
      expect(decoded.value.address.street).toBe(person.address.street);
      expect(decoded.value.address.zipCode).toBe(person.address.zipCode);
    });

    test('Empty struct', () => {
      const EmptyStruct = Struct({});
      const buffer = new ArrayBuffer(16);
      const data = {};

      const size = encode(EmptyStruct, data, buffer);
      const decoded = decode(EmptyStruct, buffer.slice(0, size));

      expect(decoded.value).toEqual({});
    });
  });

  describe('Tuple', () => {
    test('Simple tuple encoding and decoding', () => {
      const MyTuple = Tuple(RString, u8, bool);
      const buffer = new ArrayBuffer(64);
      const value: [string, number, boolean] = ["test", 42, true];

      const size = encode(MyTuple, value, buffer);
      const decoded = decode(MyTuple, buffer.slice(0, size));

      expect(decoded.value).toEqual(value);
    });

    test('Single element tuple', () => {
      const SingleTuple = Tuple(u32);
      const buffer = new ArrayBuffer(16);
      const value = 42;

      const size = encode(SingleTuple, value, buffer);
      const decoded = decode(SingleTuple, buffer.slice(0, size));

      expect(decoded.value).toBe(value);
    });

    test('Nested tuple', () => {
      const InnerTuple = Tuple(u8, u8);
      const OuterTuple = Tuple(RString, InnerTuple);
      const buffer = new ArrayBuffer(64);
      const value: [string, [number, number]] = ["hello", [1, 2]];

      const size = encode(OuterTuple, value, buffer);
      const decoded = decode(OuterTuple, buffer.slice(0, size));

      expect(decoded.value).toEqual(value);
    });

    test('Large tuple', () => {
      const LargeTuple = Tuple(u8, u16, u32, RString, bool, f32);
      const buffer = new ArrayBuffer(128);
      const value: [number, number, number, string, boolean, number] = [255, 65535, 4294967295, "test", false, 3.14159];

      const size = encode(LargeTuple, value, buffer);
      const decoded = decode(LargeTuple, buffer.slice(0, size));

      expect(decoded.value[0]).toBe(value[0]);
      expect(decoded.value[1]).toBe(value[1]);
      expect(decoded.value[2]).toBe(value[2]);
      expect(decoded.value[3]).toBe(value[3]);
      expect(decoded.value[4]).toBe(value[4]);
      expect(decoded.value[5]).toBeCloseTo(value[5], 5);
    });
  });

  describe('Array', () => {
    test('Fixed size array encoding and decoding', () => {
      const NumberArray = Array(u32, 3);
      const buffer = new ArrayBuffer(64);
      const value = [1, 2, 3];

      const size = encode(NumberArray, value as any, buffer);
      const decoded = decode(NumberArray, buffer.slice(0, size));

      expect(decoded.value).toEqual(value);
    });

    test('String array', () => {
      const StringArray = Array(RString, 2);
      const buffer = new ArrayBuffer(128);
      const value = ["hello", "world"];

      const size = encode(StringArray, value as any, buffer);
      const decoded = decode(StringArray, buffer.slice(0, size));

      expect(decoded.value).toEqual(value);
    });

    test('Zero-sized array', () => {
      const ZeroArray = Array(u32, 0);
      const buffer = new ArrayBuffer(16);
      const value = array();

      const size = encode(ZeroArray, value, buffer);
      const decoded = decode(ZeroArray, buffer.slice(0, size));

      expect(decoded.value).toEqual(value);
    });

    test('Large array', () => {
      const LargeArray = Array(u8, 100);
      const buffer = new ArrayBuffer(256);
      const value = globalThis.Array.from({ length: 100 }, (_, i) => i % 256) as number[] & { readonly length: 100 };
      const size = encode(LargeArray, value, buffer);
      const decoded = decode(LargeArray, buffer.slice(0, size));

      expect(decoded.value).toEqual(value);
    });
  });

  describe('Collection', () => {
    test('Variable size collection encoding and decoding', () => {
      const NumberCollection = Collection(u32);
      const buffer = new ArrayBuffer(128);
      const value = [1, 2, 3, 4, 5];

      const size = encode(NumberCollection, value, buffer);
      const decoded = decode(NumberCollection, buffer.slice(0, size));

      expect(decoded.value).toEqual(value);
    });

    test('Empty collection', () => {
      const EmptyCollection = Collection(u32);
      const buffer = new ArrayBuffer(16);
      const value: number[] = [];

      const size = encode(EmptyCollection, value, buffer);
      const decoded = decode(EmptyCollection, buffer.slice(0, size));

      expect(decoded.value).toEqual(value);
    });

    test('String collection', () => {
      const StringCollection = Collection(RString);
      const buffer = new ArrayBuffer(256);
      const value = ["apple", "banana", "cherry", "date"];

      const size = encode(StringCollection, value, buffer);
      const decoded = decode(StringCollection, buffer.slice(0, size));

      expect(decoded.value).toEqual(value);
    });

    test('Large collection', () => {
      const LargeCollection = Collection(u16);
      const buffer = new ArrayBuffer(2048);
      const value = globalThis.Array.from({ length: 500 }, (_, i) => i);

      const size = encode(LargeCollection, value, buffer);
      const decoded = decode(LargeCollection, buffer.slice(0, size));

      expect(decoded.value).toEqual(value);
    });
  });

  describe('Complex nested structures', () => {
    test('Struct with collections', () => {
      const UserStruct = Struct({
        id: u32,
        name: RString,
        tags: Collection(RString),
        scores: Array(u8, 3)
      });

      const buffer = new ArrayBuffer(256);
      const user = {
        id: 123,
        name: "John Doe",
        tags: ["developer", "typescript", "rust"],
        scores: array(95, 87, 92)
      };

      const size = encode(UserStruct, user, buffer);
      const decoded = decode(UserStruct, buffer.slice(0, size));

      expect(decoded.value.id).toBe(user.id);
      expect(decoded.value.name).toBe(user.name);
      expect(decoded.value.tags).toEqual(user.tags);
      expect(decoded.value.scores).toEqual(user.scores);
    });

    test('Tuple with nested structs', () => {
      const PointStruct = Struct({
        x: f32,
        y: f32
      });

      const LineStruct = Tuple(PointStruct, PointStruct);
      const buffer = new ArrayBuffer(128);
      const line: [{ x: number; y: number }, { x: number; y: number }] = [
        { x: 1.0, y: 2.0 },
        { x: 3.0, y: 4.0 }
      ];

      const size = encode(LineStruct, line, buffer);
      const decoded = decode(LineStruct, buffer.slice(0, size));

      expect(decoded.value[0].x).toBeCloseTo(line[0].x, 5);
      expect(decoded.value[0].y).toBeCloseTo(line[0].y, 5);
      expect(decoded.value[1].x).toBeCloseTo(line[1].x, 5);
      expect(decoded.value[1].y).toBeCloseTo(line[1].y, 5);
    });

    test('Collection of structs', () => {
      const PersonStruct = Struct({
        name: RString,
        age: u8
      });

      const PeopleCollection = Collection(PersonStruct);
      const buffer = new ArrayBuffer(256);
      const people = [
        { name: "Alice", age: 25 },
        { name: "Bob", age: 30 },
        { name: "Charlie", age: 35 }
      ];

      const size = encode(PeopleCollection, people, buffer);
      const decoded = decode(PeopleCollection, buffer.slice(0, size));

      expect(decoded.value).toEqual(people);
    });
  });
});
