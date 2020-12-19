export function parseHeartRate(value) {
    value = value.buffer ? value : new DataView(value);

    let flags = value.getUint8(0);
    let rate16Bits = flags & 0x1;

    if (rate16Bits) {
        return value.getUint16(1, true);
    } else {
        return value.getUint8(1);
    }
}
