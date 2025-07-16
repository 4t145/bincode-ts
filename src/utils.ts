import { BincodeError } from ".";

export function setU128(view: DataView, offset: number, value: bigint, littleEndian: boolean): void {
    // 确保值在u128范围内
    if (value < 0n || value >= (1n << 128n)) {
        throw new BincodeError('BigintOutOfRange', `Value ${value} is out of u128 range`);
    }

    // 分解为高64位和低64位
    const low64 = value & 0xFFFFFFFFFFFFFFFFn;  // 低64位
    const high64 = value >> 64n;                 // 高64位

    if (littleEndian) {
        // 小端序：先写低64位，再写高64位
        view.setBigUint64(offset, low64, true);      // 偏移 0-7 字节
        view.setBigUint64(offset + 8, high64, true); // 偏移 8-15 字节
    } else {
        // 大端序：先写高64位，再写低64位
        view.setBigUint64(offset, high64, false);    // 偏移 0-7 字节
        view.setBigUint64(offset + 8, low64, false); // 偏移 8-15 字节
    }
}

export function getU128(view: DataView, offset: number, littleEndian: boolean): bigint {
    let low64: bigint;
    let high64: bigint;

    if (littleEndian) {
        // 小端序：先读低64位，再读高64位
        low64 = view.getBigUint64(offset, true);      // 偏移 0-7 字节
        high64 = view.getBigUint64(offset + 8, true); // 偏移 8-15 字节
    } else {
        // 大端序：先读高64位，再读低64位
        high64 = view.getBigUint64(offset, false);    // 偏移 0-7 字节
        low64 = view.getBigUint64(offset + 8, false); // 偏移 8-15 字节
    }

    // 合并为128位值
    return (high64 << 64n) | low64;
}

// 对于有符号的 i128
export function setI128(view: DataView, offset: number, value: bigint, littleEndian: boolean): void {
    // 确保值在i128范围内
    const minI128 = -(1n << 127n);
    const maxI128 = (1n << 127n) - 1n;

    if (value < minI128 || value > maxI128) {
        throw new BincodeError('BigintOutOfRange', `Value ${value} is out of i128 range`);
    }

    // 转换为无符号表示
    const unsignedValue = value < 0n ? (1n << 128n) + value : value;

    // 使用 setU128 写入
    setU128(view, offset, unsignedValue, littleEndian);
}

export function getI128(view: DataView, offset: number, littleEndian: boolean): bigint {
    const unsignedValue = getU128(view, offset, littleEndian);

    // 转换为有符号表示
    const maxI128 = (1n << 127n) - 1n;

    if (unsignedValue > maxI128) {
        // 负数：从2^128中减去无符号值
        return unsignedValue - (1n << 128n);
    } else {
        // 正数：直接返回
        return unsignedValue;
    }
}