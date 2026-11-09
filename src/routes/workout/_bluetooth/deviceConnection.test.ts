import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { createDeviceConnection } from './deviceConnection';

function fakeDevice(id: string) {
    const service = {} as BluetoothRemoteGATTService;
    return {
        id,
        ongattserverdisconnected: null as null | (() => void),
        gatt: { connect: vi.fn(async () => ({ getPrimaryService: vi.fn(async () => service) })) },
    };
}

function stubBrowser(bluetooth: Partial<Bluetooth>) {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
    });
    vi.stubGlobal('navigator', { bluetooth });
    return storage;
}

describe('createDeviceConnection', () => {
    const setup = vi.fn(async () => {});

    beforeEach(() => setup.mockClear());
    afterEach(() => vi.unstubAllGlobals());

    it('remembers the paired device', async () => {
        const device = fakeDevice('trainer-1');
        const storage = stubBrowser({ requestDevice: vi.fn(async () => device) as any });
        const connection = createDeviceConnection('trainer', 'cycling_power', setup);

        await connection.pair();

        expect(storage.get('bluetoothDevice:trainer')).toBe('trainer-1');
        expect(get(connection.state)).toBe('connected');
        expect(setup).toHaveBeenCalledOnce();
    });

    it('reconnects to the remembered device without the chooser', async () => {
        const other = fakeDevice('hr-1');
        const device = fakeDevice('trainer-1');
        const requestDevice = vi.fn();
        const storage = stubBrowser({ requestDevice, getDevices: vi.fn(async () => [other, device]) as any });
        storage.set('bluetoothDevice:trainer', 'trainer-1');
        const connection = createDeviceConnection('trainer', 'cycling_power', setup);

        expect(await connection.reconnect()).toBe(true);

        expect(device.gatt.connect).toHaveBeenCalledOnce();
        expect(other.gatt.connect).not.toHaveBeenCalled();
        expect(requestDevice).not.toHaveBeenCalled();
        expect(get(connection.state)).toBe('connected');
    });

    it('does nothing when the browser has no getDevices()', async () => {
        const storage = stubBrowser({ requestDevice: vi.fn() });
        storage.set('bluetoothDevice:trainer', 'trainer-1');
        const connection = createDeviceConnection('trainer', 'cycling_power', setup);

        expect(await connection.reconnect()).toBe(false);
        expect(get(connection.state)).toBe('disconnected');
    });

    it('goes back to disconnected when the device is out of range', async () => {
        const device = fakeDevice('trainer-1');
        device.gatt.connect.mockRejectedValueOnce(new Error('NetworkError'));
        const storage = stubBrowser({ getDevices: vi.fn(async () => [device]) as any });
        storage.set('bluetoothDevice:trainer', 'trainer-1');
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const connection = createDeviceConnection('trainer', 'cycling_power', setup);

        expect(await connection.reconnect()).toBe(false);
        expect(get(connection.state)).toBe('disconnected');
    });

    it('marks the device disconnected when the connection drops', async () => {
        const device = fakeDevice('trainer-1');
        stubBrowser({ requestDevice: vi.fn(async () => device) as any });
        const connection = createDeviceConnection('trainer', 'cycling_power', setup);
        await connection.pair();

        device.ongattserverdisconnected?.();

        expect(get(connection.state)).toBe('disconnected');
    });
});
