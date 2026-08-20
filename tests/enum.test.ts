import {
    u8, u32, String,
    Tuple, Enum, Option, Result, Struct, Collection,
    encode, decode, _, $,
    Value,
} from '../src/index';

describe('Enum Tests', () => {
    test('Simple enum variants', () => {
        const Status = Enum({
            Success: _(0),
            Error: _(1, Tuple(String)),
            Pending: _(2)
        });
        const buffer = new ArrayBuffer(64);

        // Test Success variant
        const successValue: Value<typeof Status> = $('Success');
        const successSize = encode(Status, successValue, buffer);
        const decodedSuccess = decode(Status, buffer.slice(0, successSize));
        expect(decodedSuccess.value).toEqual(successValue);

        // Test Error variant
        const errorValue = $('Error' as const, ["Something went wrong"] as [string]);
        const errorSize = encode(Status, errorValue, buffer);
        const decodedError = decode(Status, buffer.slice(0, errorSize));
        expect(decodedError.value).toEqual(errorValue);

        // Test Pending variant
        const pendingValue = $('Pending' as const);
        const pendingSize = encode(Status, pendingValue, buffer);
        const decodedPending = decode(Status, buffer.slice(0, pendingSize));
        expect(decodedPending.value).toEqual(pendingValue);
    });

    test('Option type - Some variant', () => {
        const NumberOption = Option(u32);
        const buffer = new ArrayBuffer(32);

        // Test Some variant
        const someValue: Value<typeof NumberOption> = 42;
        const someSize = encode(NumberOption, someValue, buffer);
        const decodedSome = decode(NumberOption, buffer.slice(0, someSize));
        expect(decodedSome.value).toEqual(someValue);
    });

    test('Option type - None variant', () => {
        const NumberOption = Option(u32);
        const buffer = new ArrayBuffer(32);

        // Test None variant
        const noneSize = encode(NumberOption, null, buffer);
        const decodedNone = decode(NumberOption, buffer.slice(0, noneSize));
        expect(decodedNone.value).toEqual(null);
    });

    // Regression: the option decode case used to read the discriminant byte at
    // `view.getUint8(offset)` instead of `view.getUint8(0)`. Since the view is
    // already created at byteOffset=offset (see decode setup), passing `offset`
    // again read at buffer position `offset + offset` — out of bounds for any
    // option nested deep enough that the residual view shorter than the offset.
    // Top-level Option tests above use offset=0 so the bug was invisible.
    test('Option as a struct field (non-zero offset)', () => {
        const WithOpt = Struct({
            pad_a: u32,
            pad_b: u32,
            opt: Option(u8),
        });
        const buffer = new ArrayBuffer(32);
        const value: Value<typeof WithOpt> = { pad_a: 100, pad_b: 200, opt: 99 };
        const size = encode(WithOpt, value, buffer);
        const decoded = decode(WithOpt, buffer.slice(0, size));
        expect(decoded.value).toEqual(value);
    });

    test('Option as a struct field — None at non-zero offset', () => {
        const WithOpt = Struct({
            pad: u32,
            opt: Option(u32),
        });
        const buffer = new ArrayBuffer(32);
        const value: Value<typeof WithOpt> = { pad: 50, opt: null };
        const size = encode(WithOpt, value, buffer);
        const decoded = decode(WithOpt, buffer.slice(0, size));
        expect(decoded.value).toEqual(value);
    });

    test('Option as collection element (non-zero offset on every element after first)', () => {
        const OptList = Collection(Option(u32));
        const buffer = new ArrayBuffer(64);
        const value: Value<typeof OptList> = [10, null, 20, null, 30];
        const size = encode(OptList, value, buffer);
        const decoded = decode(OptList, buffer.slice(0, size));
        expect(decoded.value).toEqual(value);
    });

    test('Option of nested struct as struct field', () => {
        // `Value<typeof Outer>` triggers TS2589 (conditional-type recursion
        // depth) on nested `Option<Struct>`. The roundtrip helper takes
        // `unknown` to bypass the inference path while still exercising the
        // encode/decode at runtime, which is the point of this regression.
        const roundtrip = <T>(t: T, v: unknown, buf: ArrayBuffer): unknown => {
            const size = encode(t, v as Parameters<typeof encode<T>>[1], buf);
            return decode(t, buf.slice(0, size)).value;
        };

        const Inner = Struct({ a: u32, b: u32 });
        const Outer = Struct({
            pad: u32,
            inner: Option(Inner),
        });
        const buffer = new ArrayBuffer(64);

        const someValue = { pad: 1, inner: { a: 10, b: 20 } };
        const noneValue = { pad: 1, inner: null };

        expect(roundtrip(Outer, someValue, buffer)).toEqual(someValue);
        expect(roundtrip(Outer, noneValue, buffer)).toEqual(noneValue);
    });

    test('Result type - Ok variant', () => {
        const StringResult = Result(String, u32);
        const buffer = new ArrayBuffer(64);

        // Test Ok variant
        const okValue = $('Ok' as const, ["Success!"] as [string]);
        const okSize = encode(StringResult, okValue, buffer);
        const decodedOk = decode(StringResult, buffer.slice(0, okSize));
        expect(decodedOk.value).toEqual(okValue);
    });

    test('Result type - Err variant', () => {
        const StringResult = Result(String, u32);
        const buffer = new ArrayBuffer(64);

        // Test Err variant
        const errValue = $('Err' as const, [404] as [number]);
        const errSize = encode(StringResult, errValue, buffer);
        const decodedErr = decode(StringResult, buffer.slice(0, errSize));
        expect(decodedErr.value).toEqual(errValue);
    });

    test('Complex enum with different data types', () => {
        const MessageEnum = Enum({
            Text: _(0, Tuple(String)),
            Number: _(1, Tuple(u32)),
            List: _(2, Tuple(u8, u8, u8)),
            Empty: _(3)
        });

        const buffer = new ArrayBuffer(128);

        // Test Text variant
        const textValue = $('Text' as const, ["Hello World"] as [string]);
        const textSize = encode(MessageEnum, textValue, buffer);
        const decodedText = decode(MessageEnum, buffer.slice(0, textSize));
        expect(decodedText.value).toEqual(textValue);

        // Test Number variant
        const numberValue = $('Number' as const, [12345] as [number]);
        const numberSize = encode(MessageEnum, numberValue, buffer);
        const decodedNumber = decode(MessageEnum, buffer.slice(0, numberSize));
        expect(decodedNumber.value).toEqual(numberValue);

        // Test List variant
        const listValue = $('List' as const, [1, 2, 3] as [number, number, number]);
        const listSize = encode(MessageEnum, listValue, buffer);
        const decodedList = decode(MessageEnum, buffer.slice(0, listSize));
        expect(decodedList.value).toEqual(listValue);

        // Test Empty variant
        const emptyValue = $('Empty' as const);
        const emptySize = encode(MessageEnum, emptyValue, buffer);
        const decodedEmpty = decode(MessageEnum, buffer.slice(0, emptySize));
        expect(decodedEmpty.value).toEqual(emptyValue);
    });
});
