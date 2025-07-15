use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Person {
    name: String,
    age: u8,
    is_active: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct ComplexStruct {
    id: u32,
    score: f64,
    tags: Vec<String>,
    metadata: HashMap<String, String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
enum Message {
    Text(String),
    Number(u32),
    Bool(bool),
    Data { content: String, size: u32 },
}

#[derive(Serialize, Deserialize, Debug, Clone)]
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
        test_vec_string: vec!["apple".to_string(), "banana".to_string(), "cherry".to_string()],
        
        // Structs
        test_person: Person {
            name: "Alice".to_string(),
            age: 30,
            is_active: true,
        },
        test_complex: ComplexStruct {
            id: 12345,
            score: 98.5,
            tags: vec!["rust".to_string(), "typescript".to_string(), "bincode".to_string()],
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
    
    // Create output directory
    let output_dir = Path::new("../test-data");
    fs::create_dir_all(output_dir)?;
    
    // Serialize the complete test data
    let encoded = bincode::serialize(&test_data)?;
    fs::write(output_dir.join("complete_test_data.bin"), &encoded)?;
    
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
        ("u8_max", bincode::serialize(&255u8)?),
        ("u16_max", bincode::serialize(&65535u16)?),
        ("u32_max", bincode::serialize(&4294967295u32)?),
        ("u64_max", bincode::serialize(&18446744073709551615u64)?),
        ("i8_min", bincode::serialize(&(-128i8))?),
        ("i16_min", bincode::serialize(&(-32768i16))?),
        ("i32_min", bincode::serialize(&(-2147483648i32))?),
        ("i64_min", bincode::serialize(&(-9223372036854775808i64))?),
        ("f32_pi", bincode::serialize(&3.14159f32)?),
        ("f64_e", bincode::serialize(&2.718281828459045f64)?),
        ("bool_true", bincode::serialize(&true)?),
        ("bool_false", bincode::serialize(&false)?),
        ("string_hello", bincode::serialize(&"Hello, World!".to_string())?),
        ("string_empty", bincode::serialize(&"".to_string())?),
        ("string_unicode", bincode::serialize(&"🦀 Rust + TypeScript = ❤️".to_string())?),
    ];
    
    for (name, data) in primitives {
        fs::write(output_dir.join(format!("{}.bin", name)), data)?;
    }
    
    Ok(())
}

fn generate_struct_tests(output_dir: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let person = Person {
        name: "Bob".to_string(),
        age: 25,
        is_active: false,
    };
    
    let encoded_person = bincode::serialize(&person)?;
    fs::write(output_dir.join("struct_person.bin"), encoded_person)?;
    
    let person_json = serde_json::to_string_pretty(&person)?;
    fs::write(output_dir.join("struct_person.json"), person_json)?;
    
    Ok(())
}

fn generate_enum_tests(output_dir: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let enums = vec![
        ("enum_text", Message::Text("Enum test".to_string())),
        ("enum_number", Message::Number(999)),
        ("enum_bool", Message::Bool(true)),
        ("enum_data", Message::Data {
            content: "Complex enum data".to_string(),
            size: 2048,
        }),
    ];
    
    for (name, enum_val) in enums {
        let encoded = bincode::serialize(&enum_val)?;
        fs::write(output_dir.join(format!("{}.bin", name)), encoded)?;
        
        let json = serde_json::to_string_pretty(&enum_val)?;
        fs::write(output_dir.join(format!("{}.json", name)), json)?;
    }
    
    Ok(())
}

fn generate_collection_tests(output_dir: &Path) -> Result<(), Box<dyn std::error::Error>> {
    // Arrays
    let array_u8: [u8; 3] = [1, 2, 3];
    let array_u32: [u32; 4] = [100, 200, 300, 400];
    
    fs::write(output_dir.join("array_u8_3.bin"), bincode::serialize(&array_u8)?)?;
    fs::write(output_dir.join("array_u32_4.bin"), bincode::serialize(&array_u32)?)?;
    
    // Vectors
    let vec_u32 = vec![10, 20, 30, 40, 50];
    let vec_string = vec!["first".to_string(), "second".to_string(), "third".to_string()];
    let vec_empty: Vec<u32> = vec![];
    
    fs::write(output_dir.join("vec_u32.bin"), bincode::serialize(&vec_u32)?)?;
    fs::write(output_dir.join("vec_string.bin"), bincode::serialize(&vec_string)?)?;
    fs::write(output_dir.join("vec_empty.bin"), bincode::serialize(&vec_empty)?)?;
    
    // Save JSON references
    fs::write(output_dir.join("vec_u32.json"), serde_json::to_string_pretty(&vec_u32)?)?;
    fs::write(output_dir.join("vec_string.json"), serde_json::to_string_pretty(&vec_string)?)?;
    
    // Tuples
    let tuple_simple: (u32, String) = (42, "answer".to_string());
    let tuple_complex: (String, u32, bool, f64) = ("complex".to_string(), 123, true, 3.14);
    
    fs::write(output_dir.join("tuple_simple.bin"), bincode::serialize(&tuple_simple)?)?;
    fs::write(output_dir.join("tuple_complex.bin"), bincode::serialize(&tuple_complex)?)?;
    
    // Options
    let option_some: Option<String> = Some("present".to_string());
    let option_none: Option<String> = None;
    let option_nested: Option<Option<u32>> = Some(Some(42));
    
    fs::write(output_dir.join("option_some.bin"), bincode::serialize(&option_some)?)?;
    fs::write(output_dir.join("option_none.bin"), bincode::serialize(&option_none)?)?;
    fs::write(output_dir.join("option_nested.bin"), bincode::serialize(&option_nested)?)?;
    
    Ok(())
}
