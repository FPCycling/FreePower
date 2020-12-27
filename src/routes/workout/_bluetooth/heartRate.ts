export function parseHeartRate(value) {
    const dataView = value.buffer ? (value as DataView) : new DataView(value);

    let flags = dataView.getUint8(0);
    let rate16Bits = flags & 0x1;

    if (rate16Bits) {
        return dataView.getUint16(1, true);
    } else {
        return dataView.getUint8(1);
    }
}
