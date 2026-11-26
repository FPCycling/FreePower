<script lang="ts">
    import { onDestroy, untrack } from 'svelte';
    import Button from '../design/buttons/Button.svelte';
    import ExternalLink from '../design/links/ExternalLink.svelte';
    import { stravaTokens, ridewithgpsTokens, intervalsIcuApiKey } from '../../stores/userSettings';
    import type { WorkoutDataPoint } from '../../routes/workout/_stores/workoutRecording';
    import { generateFitFile, calculateWorkoutStats } from '../../utils/fitFileGenerator';
    import { uploadWorkout, type PlatformUploadResult, type UploadPlatform } from '../../utils/upload/uploadService';
    import { downloadRideFit, updateRide } from '../../utils/rides/rideActions';
    import { canResume } from '../../utils/rides/rideRules';
    import type { StoredRide } from '../../utils/rides/types';
    import { formatTime } from '../../utils/time';

    interface Props {
        ride: StoredRide;
        points: WorkoutDataPoint[];
        justFinished?: boolean;
        onResume?: () => void;
        onClose: () => void;
    }

    let { justFinished = false, onResume, onClose, ...request }: Props = $props();
    // The layout makes a new dialog for each ride, so the dialog reads the ride once and edits a copy.
    const { ride, points } = untrack(() => request);

    const PLATFORMS: { id: UploadPlatform; label: string }[] = [
        { id: 'intervalsicu', label: 'Intervals.icu' },
        { id: 'strava', label: 'Strava' },
        { id: 'ridewithgps', label: 'RideWithGPS' },
    ];
    const platformLabels = Object.fromEntries(PLATFORMS.map((p) => [p.id, p.label])) as Record<UploadPlatform, string>;

    const startTime = new Date(ride.startTime);
    const stats = points.length > 0 ? calculateWorkoutStats(points) : null;

    // Form state
    let workoutName = $state(ride.name);
    let description = $state(ride.description);
    let activityType = $state(ride.activityType);
    let uploads = $state<StoredRide['uploads']>({ ...ride.uploads });

    let connected = $derived<Record<UploadPlatform, boolean>>({
        intervalsicu: !!$intervalsIcuApiKey,
        strava: !!$stravaTokens,
        ridewithgps: !!$ridewithgpsTokens,
    });

    // A platform that has the ride starts unchecked, so a second upload is a deliberate choice.
    let selected = $state<Record<UploadPlatform, boolean>>({
        intervalsicu: !!$intervalsIcuApiKey && !ride.uploads.intervalsicu?.ok,
        strava: !!$stravaTokens && !ride.uploads.strava?.ok,
        ridewithgps: !!$ridewithgpsTokens && !ride.uploads.ridewithgps?.ok,
    });

    let connectedPlatforms = $derived(PLATFORMS.filter((p) => connected[p.id]));
    let hasSelection = $derived(connectedPlatforms.some((p) => selected[p.id]));

    // Upload state
    let isUploading = $state(false);
    let uploadResults: PlatformUploadResult[] = $state([]);
    let uploadError = $state('');
    let uploadSuccess = $state(false);
    let closeTimer: ReturnType<typeof setTimeout> | undefined;

    onDestroy(() => clearTimeout(closeTimer));

    function details(): Pick<StoredRide, 'name' | 'description' | 'activityType'> {
        return { name: workoutName, description, activityType };
    }

    async function handleSaveAndUpload() {
        if (!points.length) {
            uploadError = 'No workout data available';
            return;
        }

        isUploading = true;
        uploadError = '';
        uploadResults = [];

        try {
            const fitBlob = generateFitFile(points, startTime);

            const result = await uploadWorkout(
                fitBlob,
                {
                    name: workoutName,
                    description: description || undefined,
                    activityType,
                    trainer: true,
                },
                {
                    ...(selected.intervalsicu && $intervalsIcuApiKey
                        ? { intervalsicu: { apiKey: $intervalsIcuApiKey } }
                        : {}),
                    ...(selected.strava && $stravaTokens
                        ? { strava: { tokens: $stravaTokens, onTokenRefresh: (tokens) => stravaTokens.set(tokens) } }
                        : {}),
                    ...(selected.ridewithgps && $ridewithgpsTokens
                        ? {
                              ridewithgps: {
                                  tokens: $ridewithgpsTokens,
                                  onTokenRefresh: (tokens) => ridewithgpsTokens.set(tokens),
                              },
                          }
                        : {}),
                },
            );

            const at = Date.now();
            for (const r of result.results) {
                uploads[r.platform] = {
                    ok: r.success,
                    at,
                    activityId: r.activityId,
                    activityUrl: r.activityUrl,
                    error: r.error,
                };
                // Only the failed platforms stay checked for the retry.
                if (r.success) selected[r.platform] = false;
            }

            await updateRide(ride.id, {
                ...details(),
                uploads: $state.snapshot(uploads),
                ...(result.results.some((r) => r.success) ? { lastUploadAt: at } : {}),
            });

            uploadResults = result.results;
            uploadSuccess = result.allSuccessful;

            if (uploadSuccess) {
                closeTimer = setTimeout(onClose, 2000);
            } else {
                const failures = result.results.filter((r) => !r.success);
                uploadError = failures.map((f) => `${platformLabels[f.platform]}: ${f.error}`).join(', ');
            }
        } catch (error) {
            uploadError = error instanceof Error ? error.message : 'Upload failed';
            uploadSuccess = false;
        } finally {
            isUploading = false;
        }
    }

    function saveDetails() {
        if (workoutName !== ride.name || description !== ride.description || activityType !== ride.activityType) {
            void updateRide(ride.id, details());
        }
    }

    function handleClose() {
        if (isUploading) return;
        saveDetails();
        onClose();
    }

    function handleResume() {
        saveDetails();
        onResume?.();
    }

    function formatDistance(meters: number): string {
        return (meters / 1000).toFixed(2);
    }

    async function exportFitFile() {
        if (!points.length) {
            alert('No workout data to export');
            return;
        }

        try {
            await downloadRideFit(ride, points);
        } catch (error) {
            console.error('Error generating FIT file:', error);
            alert('Error generating FIT file. Check console for details.');
        }
    }
</script>

{#snippet statTile(label: string, value: string)}
    <div class="text-center p-3 bg-neutral-200 dark:bg-neutral-700 rounded">
        <div class="text-sm text-neutral-600 dark:text-neutral-400">{label}</div>
        <div class="text-xl font-bold">{value}</div>
    </div>
{/snippet}

<!-- Overlay backdrop -->
<div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    onclick={handleClose}
    onkeydown={(e) => e.key === 'Escape' && handleClose()}
    role="button"
    tabindex="0"
>
    <!-- Modal content -->
    <div
        class="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-screen overflow-y-auto"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
    >
        <h2 class="text-2xl font-bold">{justFinished ? 'Workout Complete! 🎉' : 'Upload ride'}</h2>
        <p class="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
            {startTime.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} · Saved in your ride history
        </p>

        {#if stats}
            <!-- Workout Summary -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {@render statTile('Duration', formatTime(stats.totalDuration))}
                {@render statTile('Avg Power', `${Math.round(stats.avgPower)}W`)}
                {@render statTile('Max Power', `${Math.round(stats.maxPower)}W`)}
                {@render statTile('Distance', `${formatDistance(stats.totalDistance)} km`)}
            </div>

            {#if stats.avgHeartRate > 0}
                <div class="grid grid-cols-2 gap-4 mb-6">
                    {@render statTile('Avg HR', `${Math.round(stats.avgHeartRate)} bpm`)}
                    {@render statTile('Max HR', `${Math.round(stats.maxHeartRate)} bpm`)}
                </div>
            {/if}
        {/if}

        <!-- Upload options (only show if not uploading and no success) -->
        {#if !isUploading && !uploadSuccess}
            <div class="space-y-4 mb-6">
                <div>
                    <label for="workoutName" class="block text-sm font-medium mb-1"> Workout Name </label>
                    <input
                        id="workoutName"
                        type="text"
                        bind:value={workoutName}
                        class="w-full px-3 py-2 border border-neutral-400 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700"
                    />
                </div>

                <div>
                    <label for="description" class="block text-sm font-medium mb-1"> Description (optional) </label>
                    <textarea
                        id="description"
                        bind:value={description}
                        rows="3"
                        class="w-full px-3 py-2 border border-neutral-400 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700"
                    ></textarea>
                </div>

                <div>
                    <label for="activityType" class="block text-sm font-medium mb-1"> Activity Type </label>
                    <select
                        id="activityType"
                        bind:value={activityType}
                        class="w-full px-3 py-2 border border-neutral-400 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700"
                    >
                        <option value="VirtualRide">Virtual Ride</option>
                        <option value="Ride">Ride</option>
                    </select>
                </div>

                <!-- Upload destinations -->
                <div class="border-t border-neutral-300 dark:border-neutral-700 pt-4">
                    <div class="text-sm font-medium mb-2">Upload to:</div>

                    <div class="space-y-2">
                        {#each connectedPlatforms as platform (platform.id)}
                            {@const upload = uploads[platform.id]}
                            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" bind:checked={selected[platform.id]} class="w-4 h-4" />
                                    {#if platform.id === 'strava'}
                                        <svg class="w-5 h-5 text-[#fc4c02]" viewBox="0 0 24 24" fill="currentColor">
                                            <path
                                                d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"
                                            />
                                        </svg>
                                    {:else if platform.id === 'ridewithgps'}
                                        <svg class="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                            <path
                                                d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
                                            />
                                        </svg>
                                    {/if}
                                    <span>{platform.label}</span>
                                </label>
                                {#if upload?.ok}
                                    <span class="text-sm text-green-600">✓ Uploaded</span>
                                    {#if upload.activityUrl}
                                        <ExternalLink
                                            href={upload.activityUrl}
                                            class="text-sm text-blue-600 hover:underline">View</ExternalLink
                                        >
                                    {/if}
                                {:else if upload}
                                    <span class="text-sm text-red-600">Last upload failed</span>
                                {/if}
                            </div>
                        {/each}

                        {#if connectedPlatforms.length === 0}
                            <div class="text-sm text-neutral-600 dark:text-neutral-400">
                                No upload services connected. Connect Intervals.icu, Strava or RideWithGPS in the user
                                menu to upload workouts.
                            </div>
                        {/if}
                    </div>
                </div>
            </div>

            <!-- Error display -->
            {#if uploadError}
                <div class="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded" role="alert">
                    {uploadError}
                </div>
            {/if}

            <!-- Action buttons -->
            <div class="flex flex-wrap justify-end gap-3">
                {#if onResume && canResume({ ...ride, uploads })}
                    <Button kind="minimal" class="mr-auto" onclick={handleResume}>Resume ride</Button>
                {/if}
                <Button kind="outline" onclick={exportFitFile}>Export .FIT File</Button>
                <Button kind={hasSelection ? 'outline' : 'primary'} onclick={handleClose}>Close</Button>
                {#if hasSelection}
                    <Button onclick={handleSaveAndUpload}>Save & Upload</Button>
                {/if}
            </div>
        {/if}

        <!-- Uploading state -->
        {#if isUploading}
            <div class="text-center py-8">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p class="text-lg">Uploading workout...</p>
            </div>
        {/if}

        <!-- Success state -->
        {#if uploadSuccess && !isUploading}
            <div class="text-center py-8">
                <svg
                    class="w-16 h-16 text-green-500 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <h3 class="text-xl font-bold text-green-600 mb-2">Upload Successful!</h3>

                <div class="mt-4 space-y-2">
                    {#each uploadResults as result (result.platform)}
                        {#if result.success && result.activityUrl}
                            <ExternalLink href={result.activityUrl} class="text-blue-600 hover:underline block">
                                View on {platformLabels[result.platform]}
                            </ExternalLink>
                        {/if}
                    {/each}
                </div>

                <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-4">Closing in a moment...</p>
            </div>
        {/if}
    </div>
</div>
