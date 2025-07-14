import {
  u8, u32, String as RString, bool, f32,
  Struct, Tuple, Collection, Option, Result,
  encode, decode, _, $
} from './index';

// Example 1: Basic usage with primitives
function exampleBasicTypes() {
  console.log('=== Basic Types Example ===');
  
  const buffer = new ArrayBuffer(256);
  
  // Encode and decode a string
  const text = "Hello, RType!";
  const textSize = encode(RString, text, buffer);
  const decodedText = decode(RString, buffer.slice(0, textSize));
  console.log(`Original: "${text}", Decoded: "${decodedText.value}"`);
  
  // Encode and decode a number
  const number = 42;
  const numberSize = encode(u32, number, buffer);
  const decodedNumber = decode(u32, buffer.slice(0, numberSize));
  console.log(`Original: ${number}, Decoded: ${decodedNumber.value}`);
}

// Example 2: Struct usage
function exampleStruct() {
  console.log('\n=== Struct Example ===');
  
  const PersonStruct = Struct({
    name: RString,
    age: u8,
    height: f32,
    isStudent: bool
  });
  
  const buffer = new ArrayBuffer(256);
  const person = {
    name: "Alice Johnson",
    age: 25,
    height: 5.6,
    isStudent: true
  };
  
  console.log('Original person:', person);
  
  const size = encode(PersonStruct, person, buffer);
  const encoded = buffer.slice(0, size);
  
  console.log(`Encoded size: ${size} bytes`);
  
  const decoded = decode(PersonStruct, encoded);
  console.log('Decoded person:', decoded.value);
}

// Example 3: Complex nested structures
function exampleNestedStructures() {
  console.log('\n=== Nested Structures Example ===');
  
  const AddressStruct = Struct({
    street: RString,
    city: RString,
    zipCode: u32
  });
  
  const UserStruct = Struct({
    id: u32,
    profile: Struct({
      firstName: RString,
      lastName: RString,
      age: u8
    }),
    address: AddressStruct,
    tags: Collection(RString),
    scores: Collection(u32)
  });
  
  const buffer = new ArrayBuffer(512);
  const user = {
    id: 12345,
    profile: {
      firstName: "John",
      lastName: "Doe",
      age: 30
    },
    address: {
      street: "123 Main St",
      city: "Springfield",
      zipCode: 12345
    },
    tags: ["developer", "typescript", "rust"],
    scores: [95, 87, 92, 88, 94]
  };
  
  console.log('Original user:', JSON.stringify(user, null, 2));
  
  const size = encode(UserStruct, user, buffer);
  console.log(`Encoded size: ${size} bytes`);
  
  const decoded = decode(UserStruct, buffer.slice(0, size));
  console.log('Decoded user:', JSON.stringify(decoded.value, null, 2));
}

// Example 4: Tuples
function exampleTuples() {
  console.log('\n=== Tuples Example ===');
  
  const CoordinateTuple = Tuple(f32, f32, f32); // x, y, z coordinates
  const buffer = new ArrayBuffer(128);
  
  const coordinate: [number, number, number] = [10.5, 20.3, 15.7];
  
  console.log('Original coordinate:', coordinate);
  
  const size = encode(CoordinateTuple, coordinate, buffer);
  const decoded = decode(CoordinateTuple, buffer.slice(0, size));
  
  console.log('Decoded coordinate:', decoded.value);
}

// Example 5: Collections
function exampleCollections() {
  console.log('\n=== Collections Example ===');
  
  const NumberList = Collection(u32);
  const StringList = Collection(RString);
  
  const buffer = new ArrayBuffer(512);
  
  // Number collection
  const numbers = [1, 2, 3, 5, 8, 13, 21, 34, 55];
  console.log('Original numbers:', numbers);
  
  let size = encode(NumberList, numbers, buffer);
  let decoded = decode(NumberList, buffer.slice(0, size));
  console.log('Decoded numbers:', decoded.value);
  
  // String collection
  const languages = ["TypeScript", "Rust", "Python", "JavaScript", "Go"];
  console.log('Original languages:', languages);
  
  size = encode(StringList, languages, buffer);
  const decodedStrings = decode(StringList, buffer.slice(0, size));
  console.log('Decoded languages:', decodedStrings.value);
}

// Example 6: Option and Result types
function exampleEnums() {
  console.log('\n=== Enums (Option/Result) Example ===');
  
  const NumberOption = Option(u32);
  const StringResult = Result(RString, u32);
  
  const buffer = new ArrayBuffer(256);
  
  // Option examples
  const someValue = $('Some' as const, 42);
  const noneValue = $('None' as const, {});
  
  console.log('Some value:', someValue);
  let size = encode(NumberOption, someValue, buffer);
  let decoded = decode(NumberOption, buffer.slice(0, size));
  console.log('Decoded Some:', decoded.value);
  
  console.log('None value:', noneValue);
  size = encode(NumberOption, noneValue, buffer);
  decoded = decode(NumberOption, buffer.slice(0, size));
  console.log('Decoded None:', decoded.value);
  
  // Result examples
  const okValue = $('Ok' as const, "Success!");
  const errValue = $('Err' as const, 404);
  
  console.log('Ok value:', okValue);
  size = encode(StringResult, okValue, buffer);
  const decodedOk = decode(StringResult, buffer.slice(0, size));
  console.log('Decoded Ok:', decodedOk.value);
  
  console.log('Err value:', errValue);
  size = encode(StringResult, errValue, buffer);
  const decodedErr = decode(StringResult, buffer.slice(0, size));
  console.log('Decoded Err:', decodedErr.value);
}

// Run all examples
function runExamples() {
  try {
    exampleBasicTypes();
    exampleStruct();
    exampleNestedStructures();
    exampleTuples();
    exampleCollections();
    exampleEnums();
    
    console.log('\n=== All Examples Completed Successfully! ===');
  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Export for use in other files
export {
  exampleBasicTypes,
  exampleStruct,
  exampleNestedStructures,
  exampleTuples,
  exampleCollections,
  exampleEnums,
  runExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples();
}
