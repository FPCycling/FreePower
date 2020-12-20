/// <reference types="../../node_modules/@types/web-bluetooth" />

import { derived, writable } from 'svelte/store';
import { parseHeartRate } from '../utils/bluetooth';

const _heartRate = writable<number>(-1);

export const heartRate = derived([_heartRate], ([$_heartRate]) => {
    return $_heartRate;
});

export function handlePairHrClick() {
    navigator.bluetooth
        .requestDevice({ filters: [{ services: ['heart_rate'] }] })
        .then((device) => device.gatt.connect())
        .then((server) => {
            return server.getPrimaryService('heart_rate');
        })
        .then((service) => {
            return service.getCharacteristic('heart_rate_measurement');
        })
        .then((characteristic) => {
            characteristic.addEventListener('characteristicvaluechanged', (event) => {
                _heartRate.set(parseHeartRate((event.target as any).value));
            });

            characteristic.startNotifications();
        })
        .catch((error) => {
            console.error(error);
        });
}
