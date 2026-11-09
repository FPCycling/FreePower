<script lang="ts">
    import FtpInput from '../UserMenu/components/FtpInput.svelte';
    import RiderWeightInput from '../UserMenu/components/RiderWeightInput.svelte';
    import IntervalsIcuApiKey from '../UserMenu/components/IntervalsIcuApiKey.svelte';
    import Button from '../design/buttons/Button.svelte';
    import { welcomeDismissed } from '../../stores/userSettings';
    import { STARTER_WORKOUTS } from '../../utils/starterWorkouts';
    import { startPlannedWorkout } from '../../utils/startPlannedWorkout';

    const hasBluetooth = typeof navigator !== 'undefined' && 'bluetooth' in navigator;
    const rampTest = STARTER_WORKOUTS[0]!.workout;
</script>

<section
    class="mb-10 grid gap-6 md:grid-cols-2 rounded-md bg-white dark:bg-neutral-900 p-5 sm:p-6 shadow-sm"
    aria-labelledby="welcome-title"
>
    <div class="space-y-4">
        <div>
            <h2 id="welcome-title" class="text-xl font-bold">Welcome to FreePower</h2>
            <p class="mt-1 text-neutral-600 dark:text-neutral-400">
                Ride structured workouts on your smart trainer, right in the browser. FreePower sets the trainer
                resistance for you, so you only need to pedal.
            </p>
        </div>

        <div>
            <h3 class="font-bold text-sm uppercase text-neutral-500">You need</h3>
            <ul class="mt-1 list-disc pl-5 text-sm space-y-0.5">
                <li>A Bluetooth smart trainer. A heart rate strap is optional.</li>
                <li>Chrome or Edge on a computer or Android phone.</li>
            </ul>
        </div>

        <div>
            <h3 class="font-bold text-sm uppercase text-neutral-500">Get a workout</h3>
            <ol class="mt-1 list-decimal pl-5 text-sm space-y-0.5">
                <li>Pick a starter workout below.</li>
                <li>Connect Intervals.icu to ride the workouts on your calendar.</li>
                <li>Load an .mrc file.</li>
            </ol>
        </div>

        {#if !hasBluetooth}
            <p
                class="rounded-sm bg-red-100 dark:bg-red-950 px-3 py-2 text-sm text-red-700 dark:text-red-300"
                role="alert"
            >
                This browser cannot connect to Bluetooth devices. Use Chrome or Edge on a computer or Android phone. On
                an iPhone, use the Bluefy browser.
            </p>
        {/if}
    </div>

    <div class="space-y-4">
        <h3 class="font-bold">Set up</h3>
        <div>
            <FtpInput />
            <p class="mt-1 text-xs text-neutral-500">
                Every workout target is a percentage of your FTP. Not sure?
                <button type="button" class="text-pink-300 underline" onclick={() => startPlannedWorkout(rampTest)}
                    >Ride the FTP ramp test</button
                >.
            </p>
        </div>
        <div>
            <RiderWeightInput />
            <p class="mt-1 text-xs text-neutral-500">Used to estimate your speed and distance.</p>
        </div>
        <div>
            <IntervalsIcuApiKey />
            <p class="mt-1 text-xs text-neutral-500">
                Optional. In Intervals.icu, open
                <a
                    class="text-pink-300 underline"
                    href="https://intervals.icu/settings"
                    target="_blank"
                    rel="noreferrer">Settings</a
                >, then Developer Settings, and copy the API key.
            </p>
        </div>
        <div class="flex justify-end">
            <Button onclick={() => welcomeDismissed.set(true)}>Done</Button>
        </div>
    </div>
</section>
