/// <reference types="../../node_modules/@types/web-bluetooth" />

import { derived, writable } from 'svelte/store';
import type { TrainerMetrics } from '../_types/trainer';
import { parseTrainer } from '../_bluetooth/trainer';
import { currentWatts } from '../_stores/currentWorkout';
import { createDeviceConnection } from '../_bluetooth/deviceConnection';
import { debugMode } from './debugMode';

const _trainerMetrics = writable<TrainerMetrics>({
    cadence: -1,
    power: -1,
    speed: -1,
    distance: -1,
});

export const trainerMetrics = derived([_trainerMetrics, debugMode], ([$_trainerMetrics, $_debugMode]) => {
    // Use fake data when debug mode is enabled
    if ($_debugMode.enabled) {
        return $_debugMode.fakeTrainerMetrics;
    }
    return $_trainerMetrics;
});

const trainerDevice = createDeviceConnection('trainer', 'cycling_power', async (service) => {
    await listenToMeasurements(service);
    await listenToControl(service);
});

export const trainerConnection = derived([trainerDevice.state, debugMode], ([$state, $debugMode]) =>
    $debugMode.enabled ? 'connected' : $state,
);

export const handlePairTrainerClick = trainerDevice.pair;
export const reconnectTrainer = trainerDevice.reconnect;

let ergCharacteristic: BluetoothRemoteGATTCharacteristic;
let unsubscribeErg: (() => void) | undefined;

async function listenToMeasurements(service: BluetoothRemoteGATTService) {
    const measurement = await service.getCharacteristic('cycling_power_measurement');

    measurement.addEventListener('characteristicvaluechanged', (event: any) => {
        _trainerMetrics.set(parseTrainer(event.target.value));
    });

    await measurement.startNotifications();
}

async function listenToControl(service: BluetoothRemoteGATTService) {
    ergCharacteristic = await service.getCharacteristic('a026e005-0a7d-4ab3-97fa-f1500f9feb8b');
    await ergCharacteristic.startNotifications();

    // Replace the previous subscription so a reconnect does not send each target twice.
    unsubscribeErg?.();
    unsubscribeErg = currentWatts.subscribe((watts) => {
        if (watts !== undefined) {
            const resistance = new Uint8Array([0x42, watts & 255, watts >> 8]);
            ergCharacteristic.writeValue(resistance);
        }
    });
}
