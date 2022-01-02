<script lang="ts">
    import { parseMrcFile } from '../utils/parseMrcFile';
    import { writableCurrentWorkout } from './workout/_stores/currentWorkout';
    import { goto } from '$app/navigation';

    let files: string[] = [];

    function handleFileChange(event: Event) {
        const newFile = (event.target as HTMLInputElement)?.files[0];

        const reader = new FileReader();
        reader.onload = function (e) {
            files = [...files, e.target.result as string];
        };
        reader.readAsText(newFile);
    }

    async function handleFileSelected(file: string) {
        writableCurrentWorkout.set(parseMrcFile(file));
        goto('/workout');
    }
</script>

<h2 class="font-bold mb-5">Upload MRC file to begin</h2>

<input type="file" multiple on:change={handleFileChange} name="filename" />

<div class="mt-5">
    {#each files as file}
        <button class="bg-pink-300 p-2" on:click={() => handleFileSelected(file)}> Select as current workout </button>
    {/each}
</div>
