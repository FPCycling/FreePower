<script lang="ts">
    import Button from '../../../components/design/buttons/Button.svelte';
    import { stravaTokens } from '../../../stores/userSettings';
    import { getRecordingData, getStartTime } from '../_stores/workoutRecording';
    import { generateFitFile, calculateWorkoutStats, downloadFitFile } from '../../../utils/fitFileGenerator';
    import { uploadWorkout, type PlatformUploadResult } from '../../../utils/upload/uploadService';
    import { formatTime } from '../../../utils/time';

    interface Props {
        onClose: () => void;
    }

    let { onClose }: Props = $props();

    // Get workout data
    const dataPoints = getRecordingData();
    const startTime = getStartTime();
    const stats = dataPoints.length > 0 ? calculateWorkoutStats(dataPoints) : null;

    // Form state
    let workoutName = $state(`Indoor Ride - ${new Date().toLocaleDateString()}`);
    let description = $state('');
    let uploadToStrava = $state(!!$stravaTokens);
    let activityType: 'VirtualRide' | 'Ride' = $state('VirtualRide');

    // Upload state
    let isUploading = $state(false);
    let uploadResults: PlatformUploadResult[] = $state([]);
    let uploadError = $state('');
    let uploadSuccess = $state(false);

    async function handleSaveAndUpload() {
        if (!startTime || !dataPoints.length) {
            uploadError = 'No workout data available';
            return;
        }

        isUploading = true;
        uploadError = '';
        uploadResults = [];

        try {
            // Generate FIT file
            const fitBlob = generateFitFile(dataPoints, startTime);

            // Prepare platforms for upload
            const platforms: any = {};

            if (uploadToStrava && $stravaTokens) {
                platforms.strava = {
                    tokens: $stravaTokens,
                    onTokenRefresh: (tokens: any) => {
                        stravaTokens.set(tokens);
                    },
                };
            }

            // Upload to selected platforms
            if (Object.keys(platforms).length > 0) {
                const result = await uploadWorkout(
                    fitBlob,
                    {
                        name: workoutName,
                        description: description || undefined,
                        activityType,
                        trainer: true,
                    },
                    platforms,
                );

                uploadResults = result.results;
                uploadSuccess = result.allSuccessful;

                if (!result.allSuccessful) {
                    const failures = result.results.filter((r) => !r.success);
                    uploadError = failures.map((f) => `${f.platform}: ${f.error}`).join(', ');
                }
            } else {
                // No platforms selected, just close
                uploadSuccess = true;
            }

            if (uploadSuccess) {
                setTimeout(() => {
                    onClose();
                }, 2000);
            }
        } catch (error) {
            uploadError = error instanceof Error ? error.message : 'Upload failed';
            uploadSuccess = false;
        } finally {
            isUploading = false;
        }
    }

    function handleClose() {
        if (!isUploading) {
            onClose();
        }
    }

    // Format duration helper
    function formatDuration(seconds: number): string {
        return formatTime(seconds);
    }

    // Format distance
    function formatDistance(meters: number): string {
        return (meters / 1000).toFixed(2);
    }

    // Export FIT file
    function exportFitFile() {
        if (!startTime || !dataPoints.length) {
            alert('No workout data to export');
            return;
        }

        try {
            const fitBlob = generateFitFile(dataPoints, startTime);
            downloadFitFile(fitBlob, startTime);
        } catch (error) {
            console.error('Error generating FIT file:', error);
            alert('Error generating FIT file. Check console for details.');
        }
    }
</script>

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
        class="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
    >
        <h2 class="text-2xl font-bold mb-4">Workout Complete! 🎉</h2>

        {#if stats}
            <!-- Workout Summary -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="text-center p-3 bg-gray-100 dark:bg-neutral-700 rounded">
                    <div class="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                    <div class="text-xl font-bold">{formatDuration(stats.totalDuration)}</div>
                </div>
                <div class="text-center p-3 bg-gray-100 dark:bg-neutral-700 rounded">
                    <div class="text-sm text-gray-600 dark:text-gray-400">Avg Power</div>
                    <div class="text-xl font-bold">{Math.round(stats.avgPower)}W</div>
                </div>
                <div class="text-center p-3 bg-gray-100 dark:bg-neutral-700 rounded">
                    <div class="text-sm text-gray-600 dark:text-gray-400">Max Power</div>
                    <div class="text-xl font-bold">{Math.round(stats.maxPower)}W</div>
                </div>
                <div class="text-center p-3 bg-gray-100 dark:bg-neutral-700 rounded">
                    <div class="text-sm text-gray-600 dark:text-gray-400">Distance</div>
                    <div class="text-xl font-bold">{formatDistance(stats.totalDistance)} km</div>
                </div>
            </div>

            {#if stats.avgHeartRate > 0}
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center p-3 bg-gray-100 dark:bg-neutral-700 rounded">
                        <div class="text-sm text-gray-600 dark:text-gray-400">Avg HR</div>
                        <div class="text-xl font-bold">{Math.round(stats.avgHeartRate)} bpm</div>
                    </div>
                    <div class="text-center p-3 bg-gray-100 dark:bg-neutral-700 rounded">
                        <div class="text-sm text-gray-600 dark:text-gray-400">Max HR</div>
                        <div class="text-xl font-bold">{Math.round(stats.maxHeartRate)} bpm</div>
                    </div>
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
                        class="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700"
                    />
                </div>

                <div>
                    <label for="description" class="block text-sm font-medium mb-1"> Description (optional) </label>
                    <textarea
                        id="description"
                        bind:value={description}
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700"
                    ></textarea>
                </div>

                <div>
                    <label for="activityType" class="block text-sm font-medium mb-1"> Activity Type </label>
                    <select
                        id="activityType"
                        bind:value={activityType}
                        class="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700"
                    >
                        <option value="VirtualRide">Virtual Ride</option>
                        <option value="Ride">Ride</option>
                    </select>
                </div>

                <!-- Upload destinations -->
                <div class="border-t border-gray-200 dark:border-neutral-700 pt-4">
                    <div class="text-sm font-medium mb-2">Upload to:</div>

                    {#if $stravaTokens}
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" bind:checked={uploadToStrava} class="w-4 h-4" />
                            <svg class="w-5 h-5 text-[#fc4c02]" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"
                                />
                            </svg>
                            <span>Strava</span>
                        </label>
                    {:else}
                        <div class="text-sm text-gray-500">
                            No upload services connected. Connect Strava in the user menu to upload workouts.
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Error display -->
            {#if uploadError}
                <div class="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
                    {uploadError}
                </div>
            {/if}

            <!-- Action buttons -->
            <div class="flex justify-end gap-3">
                <Button onclick={exportFitFile} class="bg-gray-200 dark:bg-neutral-700">Export .FIT File</Button>
                <Button onclick={handleClose} class="bg-gray-200 dark:bg-neutral-700">Close</Button>
                <Button onclick={handleSaveAndUpload}>
                    {uploadToStrava ? 'Save & Upload' : 'Close'}
                </Button>
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

                {#if uploadResults.length > 0}
                    <div class="mt-4 space-y-2">
                        {#each uploadResults as result}
                            {#if result.success && result.activityUrl}
                                <a
                                    href={result.activityUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-blue-600 hover:underline block"
                                >
                                    View on {result.platform === 'strava' ? 'Strava' : 'RideWithGPS'}
                                </a>
                            {/if}
                        {/each}
                    </div>
                {/if}

                <p class="text-sm text-gray-600 dark:text-gray-400 mt-4">Closing in a moment...</p>
            </div>
        {/if}
    </div>
</div>
