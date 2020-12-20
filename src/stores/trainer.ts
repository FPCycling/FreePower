/// <reference types="../../node_modules/@types/web-bluetooth" />

import { derived, writable } from 'svelte/store';
import type { TrainerMetrics } from '../types/trainer';
import { parseTrainer } from '../utils/bluetooth';

const _trainerMetrics = writable<TrainerMetrics>({
    cadence: 0,
    power: 0,
    speed: 0,
});

export const trainerMetrics = derived([_trainerMetrics], ([$_trainerMetrics]) => {
    return $_trainerMetrics;
});

export function handlePairTrainerClick() {
    navigator.bluetooth
        .requestDevice({ filters: [{ services: ['cycling_power'] }] })
        .then((device) => device.gatt.connect())
        .then((server) => {
            return server.getPrimaryService('cycling_power');
        })
        .then((service) => {
            return service.getCharacteristic('cycling_power_measurement');
        })
        .then((characteristic) => {
            characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
                _trainerMetrics.set(parseTrainer(event.target.value));
            });

            characteristic.startNotifications();
        })
        .catch((error) => {
            console.error(error);
        });
}
