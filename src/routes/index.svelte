<script lang="ts">
    import { parseMrcFile } from '../utils/parseMrcFile';
    import { writableCurrentWorkout } from './workout/_stores/currentWorkout';
    import { goto } from '$app/navigation';

    let files: string[] = [];

    function handleFileChange(event: Event) {
        const newFile = (event.target as HTMLInputElement).files[0];

        var reader = new FileReader();
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

<input type="file" multiple on:change={handleFileChange} name="filename" />

{#each files as file}
    <button on:click={() => handleFileSelected(file)}> Select as current workout </button>
{/each}
