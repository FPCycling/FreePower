import type { TrainerMetrics } from '../types/trainer';

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

interface RPMMetrics {
    lastTime: number;
    lastRev: number;
    lastRpm: number;
}

// See https://www.bluetooth.com/wp-content/uploads/Sitecore-Media-Library/Gatt/Xml/Characteristics/org.bluetooth.characteristic.cycling_power_measurement.xml
// https://stackoverflow.com/questions/54427537/understanding-ble-characteristic-values-for-cycle-power-measurement-0x2a63
export function parseTrainer(value): TrainerMetrics {
    const dataView = value.buffer ? (value as DataView) : new DataView(value);

    // TODO: Use flags to support more devices
    // const flags = dataView.getInt16(0, true); // 00 52  --  0000 0000 0011 0100
    const power = dataView.getInt16(2, true);

    return { power, cadence: parseCadence(dataView), speed: parseSpeed(dataView) };
}

const crankRpm: RPMMetrics = {
    lastRev: 0,
    lastTime: 0,
    lastRpm: 0,
};

function parseCadence(dataView: DataView) {
    const currentCrankRev = dataView.getUint16(12, true);
    const currentCrankTime = dataView.getUint16(14, true);

    if (crankRpm.lastTime) {
        const time = currentCrankTime - crankRpm.lastTime;
        const revs = currentCrankRev - crankRpm.lastRev;

        if (time) {
            crankRpm.lastRpm = (1024 * 60 * revs) / time;
        }
    }

    crankRpm.lastRev = currentCrankRev;
    crankRpm.lastTime = currentCrankTime;

    return Math.round(crankRpm.lastRpm);
}

const wheelRpm: RPMMetrics = {
    lastRev: 0,
    lastTime: 0,
    lastRpm: 0,
};

function parseSpeed(dataView: DataView) {
    const currentWheelRev = dataView.getUint32(6, true);
    const currentWheelTime = dataView.getUint16(10, true);

    if (wheelRpm.lastTime) {
        const time = currentWheelTime - wheelRpm.lastTime;
        const revs = currentWheelRev - wheelRpm.lastRev;

        if (time) {
            wheelRpm.lastRpm = (2048 * 60 * revs) / time;
        }
    }

    wheelRpm.lastRev = currentWheelRev;
    wheelRpm.lastTime = currentWheelTime;

    return Math.round((wheelRpm.lastRpm * 60 * 2.105) / 1000);
}
