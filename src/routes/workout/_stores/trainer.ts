/// <reference types="../../node_modules/@types/web-bluetooth" />

import { derived, writable } from 'svelte/store';
import type { TrainerMetrics } from '../_types/trainer';
import { parseTrainer } from '../_bluetooth/trainer';
import { currentWatts } from '../_stores/currentWorkout';

const _trainerMetrics = writable<TrainerMetrics>({
    cadence: -1,
    power: -1,
    speed: -1,
    distance: -1,
});

export const trainerMetrics = derived([_trainerMetrics], ([$_trainerMetrics]) => {
    return $_trainerMetrics;
});

let ergCharacteristic: BluetoothRemoteGATTCharacteristic;

export function handlePairPowerControl() {}

export async function handlePairTrainerClick() {
    const service = await navigator.bluetooth
        .requestDevice({ filters: [{ services: ['cycling_power'] }] })
        .then((device) => device.gatt.connect())
        .then((server) => server.getPrimaryService('cycling_power'));

    await listenToMeasurements(service);
    await listenToControl(service);
}

async function listenToMeasurements(service: BluetoothRemoteGATTService) {
    const measurement = await service.getCharacteristic('cycling_power_measurement');

    measurement.addEventListener('characteristicvaluechanged', (event: any) => {
        _trainerMetrics.set(parseTrainer(event.target.value));
    });

    measurement.startNotifications();
}

async function listenToControl(service: BluetoothRemoteGATTService) {
    ergCharacteristic = await service.getCharacteristic('a026e005-0a7d-4ab3-97fa-f1500f9feb8b');
    await ergCharacteristic.startNotifications();

    currentWatts.subscribe((watts) => {
        const resistance = new Uint8Array([0x42, watts & 255, watts >> 8]);
        ergCharacteristic.writeValue(resistance);
    });
}
