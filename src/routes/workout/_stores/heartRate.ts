/// <reference types="../../node_modules/@types/web-bluetooth" />

import { derived, writable } from 'svelte/store';
import { parseHeartRate } from '../_bluetooth/heartRate';
import { debugMode } from './debugMode';

const _heartRate = writable<number>(-1);

export const heartRate = derived([_heartRate, debugMode], ([$_heartRate, $_debugMode]) => {
    // Use fake data when debug mode is enabled
    if ($_debugMode.enabled) {
        return $_debugMode.fakeHeartRate;
    }
    return $_heartRate;
});

const _hrConnected = writable(false);

export const hrConnected = derived(
    [_hrConnected, debugMode],
    ([$connected, $debugMode]) => $connected || $debugMode.enabled,
);

export function handlePairHrClick() {
    navigator.bluetooth
        .requestDevice({ filters: [{ services: ['heart_rate'] }] })
        .then((device) => {
            device.addEventListener('gattserverdisconnected', () => _hrConnected.set(false));
            return device.gatt?.connect();
        })
        .then((server) => {
            return server?.getPrimaryService('heart_rate');
        })
        .then((service) => {
            return service?.getCharacteristic('heart_rate_measurement');
        })
        .then((characteristic) => {
            characteristic?.addEventListener('characteristicvaluechanged', (event) => {
                _heartRate.set(parseHeartRate((event.target as any).value));
            });

            return characteristic?.startNotifications();
        })
        .then((characteristic) => _hrConnected.set(characteristic !== undefined))
        .catch((error) => {
            console.error(error);
        });
}
