import {
    String as RString,
    Tuple, Enum,
    encode, decode, _, $
} from '../src/index';

describe('Enum Tests', () => {
    test('Simple enum variants', () => {
        const Status = Enum({
            Success: _(0),
            Error: _(1, Tuple(RString)),
            Pending: _(2)
        });

        const buffer = new ArrayBuffer(64);

        // Test Success variant
        const successValue = $('Success' as const, {});
        const successSize = encode(Status, successValue, buffer);
        const decodedSuccess = decode(Status, buffer.slice(0, successSize));
        expect(decodedSuccess.value).toEqual(successValue);
    });

    // test('Option type', () => {
    //     const NumberOption = Option(u32);
    //     const buffer = new ArrayBuffer(32);

    //     // Test None variant
    //     const noneValue = $('None' as const, {});
    //     const noneSize = encode(NumberOption, noneValue, buffer);
    //     const decodedNone = decode(NumberOption, buffer.slice(0, noneSize));
    //     expect(decodedNone.value).toEqual(noneValue);
    // });

    // test('Result type', () => {
    //     const StringResult = Result(RString, u32);
    //     const buffer = new ArrayBuffer(64);

    //     // Test Ok variant (Result wraps values in tuples)
    //     const okValue = $('Ok' as const, "Success!");
    //     const okSize = encode(StringResult, okValue, buffer);
    //     const decodedOk = decode(StringResult, buffer.slice(0, okSize));
    //     expect(decodedOk.value).toEqual(okValue);
    // });
});
