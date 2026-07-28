<p>
  Este documento fue <strong style="color: orange">⚠ GENERADO POR LLM🤖 ⚠</strong>.
</p>

# bincode-ts

[![CI](https://github.com/4t145/bincode-ts/workflows/CI/badge.svg)](https://github.com/4t145/bincode-ts/actions?query=workflow%3ACI)
[![codecov](https://codecov.io/gh/4t145/bincode-ts/branch/master/graph/badge.svg)](https://codecov.io/gh/4t145/bincode-ts)
[![npm version](https://badge.fury.io/js/bincode-ts.svg)](https://badge.fury.io/js/bincode-ts)
[![npm downloads](https://img.shields.io/npm/dm/bincode-ts.svg)](https://www.npmjs.com/package/bincode-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://badgen.net/badge/Built%20With/TypeScript/blue)](https://www.typescriptlang.org/)
[![Rust Compatible](https://img.shields.io/badge/Rust%20Bincode-Compatible-orange.svg)](https://github.com/bincode-org/bincode)

Una librería de TypeScript de alto rendimiento para la serialización binaria con seguridad de tipos, utilizando el formato bincode inspirado en Rust. bincode-ts proporciona una codificación y decodificación eficiente de estructuras de datos complejas con total seguridad de tipos de TypeScript y soporte para esquemas de codificación tanto fijos como de longitud variable.

## ¿Qué es bincode-ts?

bincode-ts es una librería de serialización binaria que traslada conceptos del sistema de tipos de Rust a TypeScript, ofreciendo:
- **Seguridad de Tipos**: Soporte completo de TypeScript con comprobación de tipos en tiempo de compilación.
- **Alto Rendimiento**: Serialización binaria eficiente optimizada para la velocidad.
- **Codificación Flexible**: Soporte para codificación de enteros de longitud fija y variable.
- **Cero Dependencias**: Implementación en TypeScript puro.
- **Tipos Componibles**: Construye estructuras de datos complejas a partir de primitivos simples.
- **Eficiencia de Memoria**: Formato binario con sobrecarga mínima.

## Características

- 🎯 **Seguridad de Tipos Completa**: Inferencia y comprobación de tipos completa de TypeScript.
- 🚀 **Alto Rendimiento**: Codificación/decodificación binaria optimizada.
- 📊 **Múltiples Modos de Codificación**: Codificación de enteros de longitud fija y variable.
- 🏗️ **Arquitectura Componible**: Combina tipos primitivos y compuestos.
- 🌐 **Compatibilidad Universal**: Funciona en Node.js, navegadores y otros entornos de ejecución de JavaScript.
- 🔧 **Tipos Personalizados**: Extensible con lógica de serialización definida por el usuario.
- 📦 **Cero Dependencias**: Sin dependencias externas.

## Instalación

```bash
npm install bincode-ts
```

## Inicio Rápido

```typescript
import { Struct, String, u8, u32, encode, decode } from 'bincode-ts';

// Definir un tipo de estructura (struct)
const Person = Struct({
  name: String,
  age: u8,
  id: u32
});

// Crear datos
const person = {
  name: "Alice",
  age: 30,
  id: 12345
};

// Codificar a formato binario
const buffer = new ArrayBuffer(256);
const size = encode(Person, person, buffer);
const encoded = buffer.slice(0, size);

// Decodificar desde formato binario
const decoded = decode(Person, encoded);
console.log(decoded.value); // { name: "Alice", age: 30, id: 12345 }
console.log(decoded.offset); // Número de bytes leídos
```

## Tipos Soportados

### Tipos Primitivos

#### Enteros sin signo (Unsigned)
- `u8` - Entero sin signo de 8 bits (0 a 255)
- `u16` - Entero sin signo de 16 bits (0 a 65,535)
- `u32` - Entero sin signo de 32 bits (0 a 4,294,967,295)
- `u64` - Entero sin signo de 64 bits (BigInt)

#### Enteros con signo (Signed)
- `i8` - Entero con signo de 8 bits (-128 a 127)
- `i16` - Entero con signo de 16 bits (-32,768 a 32,767)
- `i32` - Entero con signo de 32 bits (-2,147,483,648 a 2,147,483,647)
- `i64` - Entero con signo de 64 bits (BigInt)

#### Punto Flotante
- `f32` - Número de punto flotante de 32 bits
- `f64` - Número de punto flotante de 64 bits

#### Otros Primitivos
- `bool` - Valor booleano
- `String` - Cadena codificada en UTF-8 con longitud variable
- `Unit` - Tipo de tamaño cero

### Tipos Compuestos

#### Struct
Contenedores de campos nombrados para datos estructurados:

```typescript
const User = Struct({
  id: u32,
  username: String,
  email: String,
  isActive: bool,
  balance: f64
});

const user = {
  id: 123,
  username: "alice",
  email: "alice@example.com",
  isActive: true,
  balance: 1000.50
};
```

#### Tuple
Colecciones ordenadas de tipos heterogéneos:

```typescript
const Coordinates = Tuple(f32, f32, f32); // (x, y, z)
const point: [number, number, number] = [1.0, 2.0, 3.0];

const UserInfo = Tuple(String, u8, bool);
const info: [string, number, boolean] = ["Alice", 30, true];
```

#### Array
Colecciones de tamaño fijo de tipos homogéneos:

```typescript
const Numbers = Array(u32, 5);
const data = array(1, 2, 3, 4, 5); // Exactamente 5 elementos

const Matrix = Array(Array(f32, 3), 3); // Matriz 3x3
```

#### Collection
Colecciones de tamaño variable:

```typescript
const NumberList = Collection(u32);
const numbers = [1, 2, 3, 4, 5]; // Cualquier número de elementos

const StringList = Collection(String);
const tags = ["typescript", "rust", "serialization"];
```

#### Enum
Uniones etiquetadas con variantes:

```typescript
const Status = Enum({
  Success: _(0),
  Error: _(1, Tuple(String)),
  Pending: _(2),
  InProgress: _(3, Tuple(u8)) // Porcentaje de progreso
});

// Crear valores de enum
const success = $('Success');
const error = $('Error', ["Network timeout"] as [string]);
const progress = $('InProgress', [75] as [number]);
```

#### Option
Representa valores opcionales:

```typescript
const OptionalNumber = Option(u32);

// Algún valor
const someValue = 42;
const encodedSome = encode(OptionalNumber, someValue, buffer);

// Ningún valor
const noneValue = null;
const encodedNone = encode(OptionalNumber, noneValue, buffer);
```

#### Result
Representa estados de éxito/error:

```typescript
const StringResult = Result(String, u32);

// Caso de éxito
const okValue = $('Ok', ["Success message"] as [string]);

// Caso de error  
const errValue = $('Err', [404] as [number]);
```

## Configuraciones de Codificación

bincode-ts soporta diferentes configuraciones de codificación para un rendimiento óptimo:

### Codificación Estándar (Longitud Fija)

```typescript
import { BincodeConfig } from 'bincode-ts';

const config = BincodeConfig.STANDARD; // Configuración predeterminada
// - Orden de bytes little endian
// - Prefijos de longitud fijos de 8 bytes para colecciones y cadenas
// - Compatible con los ajustes predeterminados de bincode en Rust
```

### Codificación de Longitud Variable

```typescript
const variantConfig: BincodeConfig = {
  endian: 'little',
  int_encoding: 'variant', // Codificación de longitud variable
  limit: undefined
};

// Más eficiente para colecciones y cadenas cortas
const data = ["short", "strings"];
const size = encode(Collection(String), data, buffer, 0, variantConfig);
```

La codificación de longitud variable utiliza:
- 1 byte para longitudes < 251
- 3 bytes para longitudes 251-65535  
- 5 bytes para longitudes 65536-4294967295
- 9 bytes para longitudes mayores

## Ejemplos Complejos

### Estructuras Anidadas

```typescript
const Address = Struct({
  street: String,
  city: String,
  zipCode: u32
});

const Person = Struct({
  name: String,
  age: u8,
  address: Address,
  tags: Collection(String),
  scores: Array(u8, 3)
});

const person = {
  name: "John Doe",
  age: 30,
  address: {
    street: "123 Main St",
    city: "Springfield", 
    zipCode: 12345
  },
  tags: ["developer", "typescript"],
  scores: array(95, 87, 92)
};
```

### Colecciones de Structs

```typescript
const Employee = Struct({
  name: String,
  id: u32,
  department: String
});

const EmployeeList = Collection(Employee);

const employees = [
  { name: "Alice", id: 1001, department: "Engineering" },
  { name: "Bob", id: 1002, department: "Marketing" },
  { name: "Charlie", id: 1003, department: "Sales" }
];

const buffer = new ArrayBuffer(1024);
const size = encode(EmployeeList, employees, buffer);
const decoded = decode(EmployeeList, buffer.slice(0, size));
```

### Tipos Personalizados

```typescript
import { CustomTypeClass, BincodeConfig } from 'bincode-ts';

// Tipo Date personalizado que se serializa como timestamp Unix
class DateType extends CustomTypeClass<Date, 'Date'> {
  readonly type = 'Date';

  encode(buffer: ArrayBuffer, value: Date, offset: number, config: BincodeConfig): number {
    const view = new DataView(buffer);
    const timestamp = BigInt(value.getTime());
    view.setBigUint64(offset, timestamp, config.endian === 'little');
    return offset + 8;
  }

  decode(buffer: ArrayBuffer, offset: number, config: BincodeConfig): { value: Date, offset: number } {
    const view = new DataView(buffer);
    const timestamp = view.getBigUint64(offset, config.endian === 'little');
    return {
      value: new Date(Number(timestamp)),
      offset: offset + 8
    };
  }
}

const dateType = new DateType();

// Uso
const now = new Date();
const buffer = new ArrayBuffer(16);
const size = encode(dateType, now, buffer);
const { value: decoded } = decode(dateType, buffer);
```

## Manejo de Errores

Bincode-TS proporciona un manejo de errores exhaustivo con tipos de error específicos:

```typescript
import { BincodeError } from 'bincode-ts';

try {
  const result = decode(SomeType, buffer);
  console.log(result.value);
} catch (error) {
  if (error instanceof BincodeError) {
    switch (error.bincodeErrorKind) {
      case 'OverflowLimit':
        console.error('Desbordamiento de búfer:', error.message);
        break;
      case 'InvalidVariant':
        console.error('Variante de enum inválida:', error.message);
        break;
      case 'InvalidType':
        console.error('Falló la validación de tipo:', error.message);
        break;
      // Manejar otros tipos de error...
    }
  }
}
```

## Referencia de la API

### Funciones Core

#### `encode<T>(type: T, value: Value<T>, buffer: ArrayBuffer, offset?: number, config?: BincodeConfig): number`

Codifica un valor en formato binario.

**Parámetros:**
- `type`: La definición del tipo.
- `value`: El valor a codificar (debe coincidir con el tipo).
- `buffer`: ArrayBuffer de destino.
- `offset`: Posición inicial (predeterminado: 0).
- `config`: Configuración de codificación (predeterminado: BincodeConfig.STANDARD).

**Retorna:** Número de bytes escritos.

#### `decode<T>(type: T, buffer: ArrayBuffer, offset?: number, config?: BincodeConfig): { value: Value<T>, offset: number }`

Decodifica un valor desde formato binario.

**Parámetros:**
- `type`: La definición del tipo.
- `buffer`: ArrayBuffer de origen que contiene los datos binarios.
- `offset`: Posición inicial (predeterminado: 0).  
- `config`: Configuración de decodificación (predeterminado: BincodeConfig.STANDARD).

**Retorna:** Objeto con el valor decodificado y el offset final.

### Funciones de Utilidad

#### `array<T, N>(...elements: T[]): T[] & { readonly length: N }`

Crea un array de longitud fija para usar con los tipos Array:

```typescript
const fixedArray = array(1, 2, 3, 4, 5); // la longitud es exactamente 5
const ArrayType = Array(u32, 5);
```

#### `$<K, V>(variant: K, value?: V): EnumVariantValue<K, V>`

Crea valores de variantes de enum:

```typescript
const success = $('Success');
const error = $('Error', ["Something went wrong"]);
```

## Consideraciones de Rendimiento

### Tamaño del Búfer

Pre-asigna búferes de tamaño adecuado para evitar reasignaciones:

```typescript
// Para colecciones, estimación: 8 bytes (longitud) + (cantidad_elementos * tamaño_elemento)
const estimatedSize = 8 + (1000 * 4); // 1000 valores u32
const buffer = new ArrayBuffer(estimatedSize);
```

### Codificación Variable vs Fija

- Usa **codificación variable** para colecciones pequeñas y cadenas cortas.
- Usa **codificación fija** para un rendimiento constante y conjuntos de datos más grandes.

### Uso de Memoria

```typescript
// Eficiente: reutilizar búferes
const buffer = new ArrayBuffer(4096);
let offset = 0;

offset = encode(Type1, value1, buffer, offset);
offset = encode(Type2, value2, buffer, offset);
offset = encode(Type3, value3, buffer, offset);

// Obtener la parte utilizada
const used = buffer.slice(0, offset);
```

## Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar suites de pruebas específicas
npm test -- --testNamePattern="Primitive Types"
npm test -- --testNamePattern="Composite Types"
npm test -- --testNamePattern="Error Handling"

# Ejecutar pruebas en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage
```

## Desarrollo

```bash
# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Linting del código
npm run lint

# Comprobación de tipos
npm run type-check
```

## Contribuciones

¡Las contribuciones son bienvenidas! Por favor, asegúrate de que:

1. Todas las pruebas pasen (`npm test`)
2. El código siga las reglas de linting (`npm run lint`) 
3. TypeScript compile sin errores (`npm run build`)
4. Adegues pruebas para las nuevas funcionalidades
5. Actualices la documentación según sea necesario

## Licencia

Licencia MIT - consulta el archivo [LICENSE](./LICENSE) para más detalles.

## Registro de Cambios (Changelog)

Consulta [CHANGELOG.md](./CHANGELOG.md) para el historial de versiones y cambios disruptivos.
