use bincode::config::standard;
use bincode::{Decode, Encode};
use serde::Serialize;
use std::collections::HashMap;
use std::fs;
use std::path::Path;
#[derive(Encode, Decode, Serialize, Debug, Clone)]
struct Person {
    name: String,
    age: u8,
    is_active: bool,
}

#[derive(Encode, Decode, Serialize, Debug, Clone)]
struct ComplexStruct {
    id: u32,
    score: f64,
    tags: Vec<String>,
    metadata: HashMap<String, String>,
}

#[derive(Encode, Decode, Serialize, Debug, Clone)]
enum Message {
    Text(String),
    Number(u32),
    Bool(bool),
    Data { content: String, size: u32 },
}

#[derive(Encode, Decode, Serialize, Debug, Clone)]
struct TestData {
    // Primitives
    test_u8: u8,
    test_u16: u16,
    test_u32: u32,
    test_u64: u64,
    test_i8: i8,
    test_i16: i16,
    test_i32: i32,
    test_i64: i64,
    test_f32: f32,
    test_f64: f64,
    test_bool: bool,
    test_string: String,

    // Collections
    test_vec_u32: Vec<u32>,
    test_vec_string: Vec<String>,

    // Structs
    test_person: Person,
    test_complex: ComplexStruct,

    // Enums
    test_enum_text: Message,
    test_enum_number: Message,
    test_enum_data: Message,

    // Tuples
    test_tuple: (String, u32, bool),

    // Arrays
    test_array: [u8; 5],

    // Options
    test_option_some: Option<String>,
    test_option_none: Option<String>,
}

fn generate_test_data() -> TestData {
    let mut metadata = HashMap::new();
    metadata.insert("key1".to_string(), "value1".to_string());
    metadata.insert("key2".to_string(), "value2".to_string());

    TestData {
        // Primitives
        test_u8: 255,
        test_u16: 65535,
        test_u32: 4294967295,
        test_u64: 18446744073709551615,
        test_i8: -128,
        test_i16: -32768,
        test_i32: -2147483648,
        test_i64: -9223372036854775808,
        test_f32: 3.14159,
        test_f64: 2.718281828459045,
        test_bool: true,
        test_string: "Hello, Bincode!".to_string(),

        // Collections
        test_vec_u32: vec![1, 2, 3, 4, 5],
        test_vec_string: vec![
            "apple".to_string(),
            "banana".to_string(),
            "cherry".to_string(),
        ],

        // Structs
        test_person: Person {
            name: "Alice".to_string(),
            age: 30,
            is_active: true,
        },
        test_complex: ComplexStruct {
            id: 12345,
            score: 98.5,
            tags: vec![
                "rust".to_string(),
                "typescript".to_string(),
                "bincode".to_string(),
            ],
            metadata,
        },

        // Enums
        test_enum_text: Message::Text("Hello from enum".to_string()),
        test_enum_number: Message::Number(42),
        test_enum_data: Message::Data {
            content: "Structured data".to_string(),
            size: 1024,
        },

        // Tuples
        test_tuple: ("tuple_test".to_string(), 123, false),

        // Arrays
        test_array: [1, 2, 3, 4, 5],

        // Options
        test_option_some: Some("Some value".to_string()),
        test_option_none: None,
    }
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("Generating bincode test data...");

    let test_data = generate_test_data();
    const MANIFEST_DIR: &str = env!("CARGO_MANIFEST_DIR");
    // Create output directory
    let output_dir = &Path::new(MANIFEST_DIR).join("data");
    fs::create_dir_all(output_dir)?;

    // Serialize the complete test data
    let encoded = bincode::encode_to_vec(&test_data, standard())?;
    fs::write(output_dir.join("complete_test_data.bincode"), &encoded)?;

    // Also save as JSON for reference
    let json = serde_json::to_string_pretty(&test_data)?;
    fs::write(output_dir.join("complete_test_data.json"), &json)?;

    // Generate individual test cases
    generate_primitive_tests(output_dir)?;
    generate_struct_tests(output_dir)?;
    generate_enum_tests(output_dir)?;
    generate_collection_tests(output_dir)?;

    println!("Test data generated successfully!");
    println!("Files written to: {}", output_dir.display());

    Ok(())
}

fn generate_primitive_tests(output_dir: &Path) -> Result<(), Box<dyn std::error::Error>> {
    // Individual primitive values
    let primitives = vec![
        ("u8_max", bincode::encode_to_vec(&255u8, standard())?),
        ("u16_max", bincode::encode_to_vec(&65535u16, standard())?),
        (
            "u32_max",
            bincode::encode_to_vec(&4294967295u32, standard())?,
        ),
        (
            "u64_max",
            bincode::encode_to_vec(&18446744073709551615u64, standard())?,
        ),
        ("i8_min", bincode::encode_to_vec(&(-128i8), standard())?),
        ("i16_min", bincode::encode_to_vec(&(-32768i16), standard())?),
        (
            "i32_min",
            bincode::encode_to_vec(&(-2147483648i32), standard())?,
        ),
        (
            "i64_min",
            bincode::encode_to_vec(&(-9223372036854775808i64), standard())?,
        ),
        ("f32_pi", bincode::encode_to_vec(&3.14159f32, standard())?),
        (
            "f64_e",
            bincode::encode_to_vec(&2.718281828459045f64, standard())?,
        ),
        ("bool_true", bincode::encode_to_vec(&true, standard())?),
        ("bool_false", bincode::encode_to_vec(&false, standard())?),
        (
            "string_hello",
            bincode::encode_to_vec(&"Hello, World!".to_string(), standard())?,
        ),
        (
            "string_empty",
            bincode::encode_to_vec(&"".to_string(), standard())?,
        ),
        (
            "string_unicode",
            bincode::encode_to_vec(&"🦀 Rust + TypeScript = ❤️".to_string(), standard())?,
        ),
    ];

    for (name, data) in primitives {
        fs::write(output_dir.join(format!("{}.bincode", name)), data)?;
    }

    Ok(())
}

fn generate_struct_tests(output_dir: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let person = Person {
        name: "Bob".to_string(),
        age: 25,
        is_active: false,
    };

    let encoded_person = bincode::encode_to_vec(&person, standard())?;
    fs::write(output_dir.join("struct_person.bincode"), encoded_person)?;

    let person_json = serde_json::to_string_pretty(&person)?;
    fs::write(output_dir.join("struct_person.json"), person_json)?;

    Ok(())
}

fn generate_enum_tests(output_dir: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let enums = vec![
        ("enum_text", Message::Text("Enum test".to_string())),
        ("enum_number", Message::Number(999)),
        ("enum_bool", Message::Bool(true)),
        (
            "enum_data",
            Message::Data {
                content: "Complex enum data".to_string(),
                size: 2048,
            },
        ),
    ];

    for (name, enum_val) in enums {
        let encoded = bincode::encode_to_vec(&enum_val, standard())?;
        fs::write(output_dir.join(format!("{}.bincode", name)), encoded)?;

        let json = serde_json::to_string_pretty(&enum_val)?;
        fs::write(output_dir.join(format!("{}.json", name)), json)?;
    }

    Ok(())
}

fn generate_collection_tests(output_dir: &Path) -> Result<(), Box<dyn std::error::Error>> {
    // Arrays
    let array_u8: [u8; 3] = [1, 2, 3];
    let array_u32: [u32; 4] = [100, 200, 300, 400];

    fs::write(
        output_dir.join("array_u8_3.bincode"),
        bincode::encode_to_vec(&array_u8, standard())?,
    )?;
    fs::write(
        output_dir.join("array_u32_4.bincode"),
        bincode::encode_to_vec(&array_u32, standard())?,
    )?;

    // Vectors
    let vec_u32 = vec![10, 20, 30, 40, 50];
    let vec_string = vec![
        "first".to_string(),
        "second".to_string(),
        "third".to_string(),
    ];
    let vec_empty: Vec<u32> = vec![];

    fs::write(
        output_dir.join("vec_u32.bincode"),
        bincode::encode_to_vec(&vec_u32, standard())?,
    )?;
    fs::write(
        output_dir.join("vec_string.bincode"),
        bincode::encode_to_vec(&vec_string, standard())?,
    )?;
    fs::write(
        output_dir.join("vec_empty.bincode"),
        bincode::encode_to_vec(&vec_empty, standard())?,
    )?;

    // Save JSON references
    fs::write(
        output_dir.join("vec_u32.json"),
        serde_json::to_string_pretty(&vec_u32)?,
    )?;
    fs::write(
        output_dir.join("vec_string.json"),
        serde_json::to_string_pretty(&vec_string)?,
    )?;

    // Tuples
    let tuple_simple: (u32, String) = (42, "answer".to_string());
    let tuple_complex: (String, u32, bool, f64) = ("complex".to_string(), 123, true, 3.14);

    fs::write(
        output_dir.join("tuple_simple.bincode"),
        bincode::encode_to_vec(&tuple_simple, standard())?,
    )?;
    fs::write(
        output_dir.join("tuple_complex.bincode"),
        bincode::encode_to_vec(&tuple_complex, standard())?,
    )?;

    // Options
    let option_some: Option<String> = Some("present".to_string());
    let option_none: Option<String> = None;
    let option_nested: Option<Option<u32>> = Some(Some(42));

    fs::write(
        output_dir.join("option_some.bincode"),
        bincode::encode_to_vec(&option_some, standard())?,
    )?;
    fs::write(
        output_dir.join("option_none.bincode"),
        bincode::encode_to_vec(&option_none, standard())?,
    )?;
    fs::write(
        output_dir.join("option_nested.bincode"),
        bincode::encode_to_vec(&option_nested, standard())?,
    )?;

    Ok(())
}
