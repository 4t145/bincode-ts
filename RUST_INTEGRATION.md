# Rust Bincode 集成测试指南

本指南说明如何为 bincode-ts 项目设置和运行与 Rust bincode 的集成测试。

## 概述

集成测试验证 TypeScript 实现与 Rust 原生 bincode 库的二进制兼容性。这确保了两种实现产生和消费相同的二进制格式。

## 设置 Rust 环境

### 1. 安装 Rust（如果尚未安装）

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

### 2. 运行设置脚本

```bash
./setup-rust-integration.sh
```

此脚本将：
- 检查 Rust 安装
- 构建 Rust 测试数据生成器
- 生成二进制测试数据
- 创建 JSON 参考文件

## 测试数据结构

生成的测试数据包括：

### 基础类型
- `u8_max.bin` - 最大 u8 值 (255)
- `u16_max.bin` - 最大 u16 值 (65535)
- `u32_max.bin` - 最大 u32 值
- `u64_max.bin` - 最大 u64 值
- `i8_min.bin` - 最小 i8 值 (-128)
- `i16_min.bin` - 最小 i16 值
- `i32_min.bin` - 最小 i32 值
- `i64_min.bin` - 最小 i64 值
- `f32_pi.bin` - π 值作为 f32
- `f64_e.bin` - e 值作为 f64
- `bool_true.bin` / `bool_false.bin` - 布尔值
- `string_hello.bin` - "Hello, World!" 字符串
- `string_empty.bin` - 空字符串
- `string_unicode.bin` - Unicode 字符串

### 复合类型
- `struct_person.bin` - 简单结构体
- `vec_u32.bin` - u32 向量
- `vec_string.bin` - 字符串向量
- `vec_empty.bin` - 空向量
- `array_u8_3.bin` - 长度为 3 的 u8 数组
- `array_u32_4.bin` - 长度为 4 的 u32 数组
- `tuple_simple.bin` - 简单元组 (u32, String)
- `tuple_complex.bin` - 复杂元组 (String, u32, bool, f64)

### 枚举和选项
- `enum_text.bin` - 文本枚举变体
- `enum_number.bin` - 数字枚举变体
- `enum_data.bin` - 结构化数据枚举变体
- `option_some.bin` - Some(value) 选项
- `option_none.bin` - None 选项
- `option_nested.bin` - 嵌套选项

## 运行集成测试

### 运行所有集成测试
```bash
npm run test:integration
```

### 运行特定测试套件
```bash
# 只运行基础类型测试
npx jest tests/rust-integration.test.ts -t "Primitive Types"

# 只运行结构体测试
npx jest tests/rust-integration.test.ts -t "Struct Types"

# 只运行集合类型测试
npx jest tests/rust-integration.test.ts -t "Collection Types"
```

### 在观察模式下运行
```bash
npx jest tests/rust-integration.test.ts --watch
```

## 测试类别

### 1. 解码兼容性测试
验证 TypeScript 实现能够正确解码 Rust 生成的二进制数据：

```typescript
test('should decode Rust bincode for u8_max', () => {
  const binaryData = readTestData('u8_max.bin');
  const decoded = decode(u8, binaryData);
  expect(decoded.value).toBe(255);
});
```

### 2. 编码兼容性测试
验证 TypeScript 实现产生与 Rust 相同的二进制输出：

```typescript
test('should encode compatible with Rust bincode for u8_max', () => {
  const rustData = readTestData('u8_max.bin');
  const buffer = new ArrayBuffer(16);
  const size = encode(u8, 255, buffer);
  const ourData = buffer.slice(0, size);
  
  expect(new Uint8Array(ourData)).toEqual(new Uint8Array(rustData));
});
```

### 3. 往返兼容性测试
验证数据能够在两种实现之间完整往返：

```typescript
test('should round-trip complex data structures', () => {
  const data = { id: 123, name: "test", active: true };
  const buffer = new ArrayBuffer(256);
  const size = encode(PersonStruct, data, buffer);
  const decoded = decode(PersonStruct, buffer.slice(0, size));
  expect(decoded.value).toEqual(data);
});
```

### 4. 性能测试
验证大型数据结构的编码/解码性能：

```typescript
test('should handle large data structures efficiently', () => {
  // 测试 10,000 个元素的数组
  // 验证操作在 1 秒内完成
});
```

## 调试测试失败

### 检查二进制数据
如果测试失败，你可以检查生成的二进制数据：

```bash
# 查看文件大小
ls -la test-data/*.bin

# 使用 hexdump 检查二进制内容
hexdump -C test-data/u8_max.bin

# 比较两个二进制文件
diff <(hexdump -C file1.bin) <(hexdump -C file2.bin)
```

### 检查 JSON 参考数据
```bash
# 查看生成的参考数据
cat test-data/struct_person.json
cat test-data/vec_u32.json
```

### 启用详细日志
在测试中添加调试输出：

```typescript
console.log('Rust data:', new Uint8Array(rustData));
console.log('Our data:', new Uint8Array(ourData));
console.log('Decoded value:', decoded.value);
```

## 添加新测试

### 1. 修改 Rust 数据生成器
在 `rust-integration/src/main.rs` 中添加新的测试用例：

```rust
// 在 generate_test_data() 函数中添加新字段
test_new_field: NewType { ... },

// 在相应的生成函数中添加序列化逻辑
let encoded = bincode::serialize(&new_data)?;
fs::write(output_dir.join("new_test.bin"), encoded)?;
```

### 2. 添加 TypeScript 测试
在 `tests/rust-integration.test.ts` 中添加对应的测试：

```typescript
test('should decode new test case', () => {
  const testFile = 'new_test.bin';
  const NewType = Struct({ /* 定义类型 */ });
  
  const binaryData = readTestData(testFile);
  const decoded = decode(NewType, binaryData);
  
  // 验证解码结果
  expect(decoded.value).toEqual(expectedValue);
});
```

### 3. 重新生成数据
```bash
./setup-rust-integration.sh
npm run test:integration
```

## 故障排除

### 常见问题

1. **Rust 未安装**
   ```bash
   # 运行设置脚本会自动安装 Rust
   ./setup-rust-integration.sh
   ```

2. **测试数据不存在**
   ```bash
   # 重新生成测试数据
   cd rust-integration && cargo run --bin generate_test_data
   ```

3. **类型不匹配错误**
   - 确保 TypeScript 类型定义与 Rust 结构体匹配
   - 检查字段顺序和类型映射

4. **二进制格式不匹配**
   - 验证字节序（little-endian 为默认）
   - 检查字符串长度前缀格式
   - 验证枚举变体索引

### 获取帮助

如果遇到问题：

1. 检查现有测试作为参考
2. 查看 Rust bincode 文档
3. 比较二进制输出的十六进制转储
4. 在 GitHub issues 中报告问题

## 持续集成

在 CI 环境中运行集成测试：

```yaml
# .github/workflows/test.yml
- name: Install Rust
  uses: actions-rs/toolchain@v1
  with:
    toolchain: stable

- name: Setup Rust integration
  run: ./setup-rust-integration.sh

- name: Run integration tests
  run: npm run test:integration
```

这确保了每次代码更改都会验证与 Rust 的兼容性。
