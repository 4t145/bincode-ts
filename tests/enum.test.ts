import {
    u8, u32, String,
    Tuple, Enum, Option, Result,
    encode, decode, _, $,
} from '../src/index.ts';

describe('Enum Tests', () => {
    test('Simple enum variants', () => {
        const Status = Enum({
            Success: _(0),
            Error: _(1, Tuple(String)),
            Pending: _(2)
        });
        const buffer = new ArrayBuffer(64);

        // Test Success variant
        const successValue = $('Success' as const, {});
        const successSize = encode(Status, successValue, buffer);
        const decodedSuccess = decode(Status, buffer.slice(0, successSize));
        expect(decodedSuccess.value).toEqual(successValue);

        // Test Error variant
        const errorValue = $('Error' as const, "Something went wrong");
        const errorSize = encode(Status, errorValue, buffer);
        const decodedError = decode(Status, buffer.slice(0, errorSize));
        expect(decodedError.value).toEqual(errorValue);

        // Test Pending variant
        const pendingValue = $('Pending' as const, {});
        const pendingSize = encode(Status, pendingValue, buffer);
        const decodedPending = decode(Status, buffer.slice(0, pendingSize));
        expect(decodedPending.value).toEqual(pendingValue);
    });

    test('Option type - Some variant', () => {
        const NumberOption = Option(u32);
        const buffer = new ArrayBuffer(32);

        // Test Some variant
        const someValue = $('Some' as const, 42);
        const someSize = encode(NumberOption, someValue, buffer);
        const decodedSome = decode(NumberOption, buffer.slice(0, someSize));
        expect(decodedSome.value).toEqual(someValue);
    });

    test('Option type - None variant', () => {
        const NumberOption = Option(u32);
        const buffer = new ArrayBuffer(32);

        // Test None variant
        const noneValue = $('None' as const, {});
        const noneSize = encode(NumberOption, noneValue, buffer);
        const decodedNone = decode(NumberOption, buffer.slice(0, noneSize));
        expect(decodedNone.value).toEqual(noneValue);
    });

    test('Result type - Ok variant', () => {
        const StringResult = Result(String, u32);
        const buffer = new ArrayBuffer(64);

        // Test Ok variant
        const okValue = $('Ok' as const, "Success!");
        const okSize = encode(StringResult, okValue, buffer);
        const decodedOk = decode(StringResult, buffer.slice(0, okSize));
        expect(decodedOk.value).toEqual(okValue);
    });

    test('Result type - Err variant', () => {
        const StringResult = Result(String, u32);
        const buffer = new ArrayBuffer(64);

        // Test Err variant
        const errValue = $('Err' as const, 404);
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
        const textValue = $('Text' as const, "Hello World");
        const textSize = encode(MessageEnum, textValue, buffer);
        const decodedText = decode(MessageEnum, buffer.slice(0, textSize));
        expect(decodedText.value).toEqual(textValue);

        // Test Number variant
        const numberValue = $('Number' as const, 12345);
        const numberSize = encode(MessageEnum, numberValue, buffer);
        const decodedNumber = decode(MessageEnum, buffer.slice(0, numberSize));
        expect(decodedNumber.value).toEqual(numberValue);

        // Test List variant
        const listValue = $('List' as const, [1, 2, 3] as [number, number, number]);
        const listSize = encode(MessageEnum, listValue, buffer);
        const decodedList = decode(MessageEnum, buffer.slice(0, listSize));
        expect(decodedList.value).toEqual(listValue);

        // Test Empty variant
        const emptyValue = $('Empty' as const, {});
        const emptySize = encode(MessageEnum, emptyValue, buffer);
        const decodedEmpty = decode(MessageEnum, buffer.slice(0, emptySize));
        expect(decodedEmpty.value).toEqual(emptyValue);
    });
});
