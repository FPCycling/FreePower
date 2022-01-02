import type { TrainerMetrics } from '../_types/trainer';
const MetersPerRev = 2.105;

interface RPMMetrics {
    lastTime: number;
    lastRev: number;
    lastRpm: number;
    successiveErrors: number;
}

// See https://www.bluetooth.com/wp-content/uploads/Sitecore-Media-Library/Gatt/Xml/Characteristics/org.bluetooth.characteristic.cycling_power_measurement.xml
// https://stackoverflow.com/questions/54427537/understanding-ble-characteristic-values-for-cycle-power-measurement-0x2a63
export function parseTrainer(value: any): TrainerMetrics {
    const dataView = value.buffer ? (value as DataView) : new DataView(value);

    // TODO: Use flags to support more devices
    // const flags = dataView.getInt16(0, true); // 00 52  --  0000 0000 0011 0100
    const power = dataView.getInt16(2, true);

    return { power, cadence: parseCadence(dataView), ...parseSpeed(dataView) };
}

const crankRpm: RPMMetrics = {
    lastRev: 0,
    lastTime: 0,
    lastRpm: 0,
    successiveErrors: 0,
};

function parseCadence(dataView: DataView) {
    const currentCrankRev = dataView.getUint16(12, true);
    const currentCrankTime = dataView.getUint16(14, true);

    if (crankRpm.lastTime) {
        const time = currentCrankTime - crankRpm.lastTime;
        const revs = currentCrankRev - crankRpm.lastRev;

        if (Math.abs(time) > 0.001 && time > 0 && revs > 0) {
            crankRpm.lastRpm = (1024 * 60 * revs) / time;
            crankRpm.successiveErrors = 0;
        } else {
            crankRpm.successiveErrors += 1;
            if (crankRpm.successiveErrors > 5) {
                crankRpm.lastRpm = 0;
            }
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
    successiveErrors: 0,
};

function parseSpeed(dataView: DataView): Pick<TrainerMetrics, 'speed' | 'distance'> {
    const currentWheelRev = dataView.getUint32(6, true);
    const currentWheelTime = dataView.getUint16(10, true);

    let revs = 0;

    if (wheelRpm.lastTime) {
        const time = currentWheelTime - wheelRpm.lastTime;
        revs = currentWheelRev - wheelRpm.lastRev;

        if (Math.abs(time) > 0.001 && time > 0 && revs > 0) {
            wheelRpm.lastRpm = (2048 * 60 * revs) / time;
            wheelRpm.successiveErrors = 0;
        } else {
            wheelRpm.successiveErrors += 1;
            if (wheelRpm.successiveErrors > 5) {
                wheelRpm.lastRpm = 0;
            }
        }
    }

    wheelRpm.lastRev = currentWheelRev;
    wheelRpm.lastTime = currentWheelTime;

    return {
        speed: Math.round((wheelRpm.lastRpm * 60 * MetersPerRev) / 1000),
        distance: revs * MetersPerRev,
    };
}
