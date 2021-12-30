export function parseHeartRate(value: any) {
    const dataView = value.buffer ? (value as DataView) : new DataView(value);

    const flags = dataView.getUint8(0);
    const rate16Bits = flags & 0x1;

    if (rate16Bits) {
        return dataView.getUint16(1, true);
    } else {
        return dataView.getUint8(1);
    }
}
