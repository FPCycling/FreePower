<script lang="ts">
    import { parseMrcFile } from '../utils/parseMrcFile';
    import { writableCurrentWorkout } from './workout/_stores/currentWorkout';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';

    let files = $state<string[]>([]);

    function handleFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const newFile = input?.files?.[0];

        if (!newFile) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            if (e.target?.result) {
                files = [...files, e.target.result as string];
            }
        };
        reader.readAsText(newFile);
    }

    async function handleFileSelected(file: string) {
        writableCurrentWorkout.set(parseMrcFile(file));
        goto(resolve('/workout'));
    }
</script>

<h2 class="font-bold mb-5">Upload MRC file to begin</h2>

<input type="file" multiple onchange={handleFileChange} name="filename" />

<div class="mt-5">
    {#each files as file (file)}
        <button class="bg-pink-300 p-2" onclick={() => handleFileSelected(file)}> Select as current workout </button>
    {/each}
</div>
