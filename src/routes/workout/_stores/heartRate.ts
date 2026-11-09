/// <reference types="../../node_modules/@types/web-bluetooth" />

import { derived, writable } from 'svelte/store';
import { parseHeartRate } from '../_bluetooth/heartRate';
import { createDeviceConnection } from '../_bluetooth/deviceConnection';
import { debugMode } from './debugMode';

const _heartRate = writable<number>(-1);

export const heartRate = derived([_heartRate, debugMode], ([$_heartRate, $_debugMode]) => {
    // Use fake data when debug mode is enabled
    if ($_debugMode.enabled) {
        return $_debugMode.fakeHeartRate;
    }
    return $_heartRate;
});

const hrDevice = createDeviceConnection('heartRate', 'heart_rate', async (service) => {
    const characteristic = await service.getCharacteristic('heart_rate_measurement');
    characteristic.addEventListener('characteristicvaluechanged', (event) => {
        _heartRate.set(parseHeartRate((event.target as any).value));
    });
    await characteristic.startNotifications();
});

export const hrConnection = derived([hrDevice.state, debugMode], ([$state, $debugMode]) =>
    $debugMode.enabled ? 'connected' : $state,
);

export const handlePairHrClick = hrDevice.pair;
export const reconnectHr = hrDevice.reconnect;
