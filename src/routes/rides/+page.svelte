<script lang="ts">
    import { resolve } from '$app/paths';
    import Button from '../../components/design/buttons/Button.svelte';
    import ExternalLink from '../../components/design/links/ExternalLink.svelte';
    import WorkoutProfile from '../../components/WorkoutProfile/WorkoutProfile.svelte';
    import { rides, type RideListItem } from '../../stores/rides';
    import { userFtp } from '../../stores/userSettings';
    import { profileSteps } from '../../utils/rides/powerProfile';
    import {
        downloadRide,
        finishRide,
        keepRideLocal,
        openRideUpload,
        removeRide,
        resumeRide,
    } from '../../utils/rides/rideActions';
    import { canResume, hasUpload, needsAttention } from '../../utils/rides/rideRules';
    import { formatTime } from '../../utils/time';
    import type { UploadPlatform } from '../../utils/upload/uploadService';

    const PLATFORM_LABELS: Record<UploadPlatform, string> = {
        intervalsicu: 'Intervals.icu',
        strava: 'Strava',
        ridewithgps: 'RideWithGPS',
    };

    const WARN = 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
    const MUTED = 'bg-neutral-300 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200';
    const GOOD = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    const BAD = 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200';

    function statusChip(ride: RideListItem): { label: string; classes: string } | null {
        if (ride.live) return { label: 'In progress', classes: GOOD };
        if (ride.status === 'recording') return { label: 'Interrupted', classes: WARN };
        if (needsAttention(ride)) return { label: 'Not uploaded', classes: WARN };
        if (!hasUpload(ride)) return { label: ride.downloadedAt ? 'Downloaded' : 'Local only', classes: MUTED };
        return null;
    }

    function uploadChips(ride: RideListItem) {
        return (Object.keys(PLATFORM_LABELS) as UploadPlatform[]).flatMap((platform) => {
            const upload = ride.uploads[platform];
            return upload ? [{ platform, label: PLATFORM_LABELS[platform], upload }] : [];
        });
    }

    function formatDate(ride: RideListItem): string {
        return new Date(ride.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    }

    async function handleDelete(ride: RideListItem) {
        const warning = hasUpload(ride) ? '' : ' It is not uploaded to a platform.';
        if (confirm(`Delete "${ride.name}"?${warning} You cannot undo this.`)) await removeRide(ride.id);
    }
</script>

<section class="mb-10">
    <h2 class="font-bold">Rides</h2>
    <p class="mt-1 mb-5 text-sm text-neutral-600 dark:text-neutral-400">
        FreePower saves each ride in this browser while you ride. An uploaded ride is deleted 90 days after its last
        upload. A ride that is not uploaded is kept.
    </p>

    {#if $rides.length === 0}
        <p class="text-neutral-600 dark:text-neutral-400">No rides yet. Your next ride shows here.</p>
    {:else}
        <ul class="space-y-2">
            {#each $rides as ride (ride.id)}
                {@const status = statusChip(ride)}
                {@const interrupted = ride.status === 'recording' && !ride.live}
                <li
                    class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-md bg-white dark:bg-neutral-900 px-5 py-4 shadow-sm"
                >
                    <div class="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
                        <div class="h-12 shrink-0 sm:w-32">
                            <WorkoutProfile steps={profileSteps(ride.powerProfile, $userFtp || 200)} />
                        </div>
                        <div class="min-w-0">
                            <div class="flex flex-wrap items-center gap-2">
                                <h3 class="truncate font-bold">{ride.name}</h3>
                                {#if status}
                                    <span class="rounded-sm px-2 py-0.5 text-xs font-medium {status.classes}"
                                        >{status.label}</span
                                    >
                                {/if}
                                {#each uploadChips(ride) as chip (chip.platform)}
                                    {#if chip.upload.ok && chip.upload.activityUrl}
                                        <ExternalLink
                                            class="rounded-sm px-2 py-0.5 text-xs font-medium hover:underline {GOOD}"
                                            href={chip.upload.activityUrl}>✓ {chip.label}</ExternalLink
                                        >
                                    {:else if chip.upload.ok}
                                        <span class="rounded-sm px-2 py-0.5 text-xs font-medium {GOOD}"
                                            >✓ {chip.label}</span
                                        >
                                    {:else}
                                        <span
                                            class="rounded-sm px-2 py-0.5 text-xs font-medium {BAD}"
                                            title={chip.upload.error}>✕ {chip.label} failed</span
                                        >
                                    {/if}
                                {/each}
                            </div>
                            <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                                {formatDate(ride)} · {formatTime(ride.elapsedSeconds)} · {Math.round(
                                    ride.stats.avgPower,
                                )} W avg · {(ride.stats.totalDistance / 1000).toFixed(1)} km
                            </p>
                        </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                        {#if ride.live}
                            <a
                                class="rounded-sm px-5 py-2.5 text-sm font-medium text-pink-300 ring-1 ring-inset ring-pink-300 hover:bg-neutral-300 dark:hover:bg-neutral-800"
                                href={resolve('/workout')}>Open</a
                            >
                        {:else}
                            {#if interrupted}
                                {#if canResume(ride)}
                                    <Button onclick={() => resumeRide(ride.id)}>Resume</Button>
                                {/if}
                                <Button kind="outline" onclick={() => finishRide(ride.id)}>Finish and save</Button>
                            {:else}
                                <Button
                                    kind={needsAttention(ride) ? 'primary' : 'outline'}
                                    onclick={() => openRideUpload(ride.id)}>Upload</Button
                                >
                                {#if canResume(ride)}
                                    <Button kind="minimal" onclick={() => resumeRide(ride.id)}>Resume</Button>
                                {/if}
                            {/if}
                            <Button kind="minimal" onclick={() => downloadRide(ride.id)}>Download .fit</Button>
                            {#if needsAttention(ride) && !interrupted}
                                <Button kind="minimal" onclick={() => keepRideLocal(ride.id)}>Keep local</Button>
                            {/if}
                            <Button kind="minimal" onclick={() => handleDelete(ride)}>Delete</Button>
                        {/if}
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
</section>
