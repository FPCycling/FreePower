/// <reference types="../../node_modules/@types/web-bluetooth" />

import { get, writable, type Readable } from 'svelte/store';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected';

export interface DeviceConnection {
    state: Readable<ConnectionState>;
    /** Opens the browser chooser. Needs a user gesture. */
    pair: () => Promise<void>;
    /** Connects to the last paired device without the chooser. Returns false when the browser cannot. */
    reconnect: () => Promise<boolean>;
}

const ADVERTISEMENT_WAIT_MS = 5000;

/**
 * Pairs a Bluetooth device and remembers it so later visits can reconnect without the chooser.
 * Reconnecting needs `navigator.bluetooth.getDevices()`, which Chrome still ships behind
 * chrome://flags/#enable-web-bluetooth-new-permissions-backend.
 */
export function createDeviceConnection(
    kind: string,
    service: BluetoothServiceUUID,
    setup: (service: BluetoothRemoteGATTService) => Promise<void>,
): DeviceConnection {
    const state = writable<ConnectionState>('disconnected');
    const storageKey = `bluetoothDevice:${kind}`;

    async function connect(device: BluetoothDevice) {
        state.set('connecting');
        try {
            device.ongattserverdisconnected = () => state.set('disconnected');
            const server = await device.gatt!.connect();
            await setup(await server.getPrimaryService(service));
            localStorage.setItem(storageKey, device.id);
            state.set('connected');
        } catch (error) {
            state.set('disconnected');
            throw error;
        }
    }

    async function pair() {
        try {
            await connect(await navigator.bluetooth.requestDevice({ filters: [{ services: [service] }] }));
        } catch (error) {
            console.error(error);
        }
    }

    async function reconnect() {
        const id = localStorage.getItem(storageKey);
        if (!id || get(state) !== 'disconnected' || typeof navigator.bluetooth?.getDevices !== 'function') {
            return false;
        }

        const device = (await navigator.bluetooth.getDevices()).find((d) => d.id === id);
        if (!device) return false;

        try {
            state.set('connecting');
            await waitForAdvertisement(device);
            await connect(device);
            return true;
        } catch (error) {
            console.warn(`Could not reconnect ${kind}`, error);
            return false;
        }
    }

    return { state: { subscribe: state.subscribe }, pair, reconnect };
}

// Chrome may not connect to a remembered device until it has seen it advertise.
// Connect anyway after a short wait, since some platforms never fire the event.
async function waitForAdvertisement(device: BluetoothDevice) {
    if (typeof device.watchAdvertisements !== 'function') return;

    const abort = new AbortController();
    try {
        await Promise.race([
            new Promise<void>((resolve) => {
                device.onadvertisementreceived = () => resolve();
            }),
            device
                .watchAdvertisements({ signal: abort.signal })
                .then(() => new Promise<void>((resolve) => setTimeout(resolve, ADVERTISEMENT_WAIT_MS))),
        ]);
    } catch {
        // Watching failed: try to connect directly.
    } finally {
        abort.abort();
        device.onadvertisementreceived = null as any;
    }
}
