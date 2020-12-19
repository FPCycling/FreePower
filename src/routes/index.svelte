<script lang="ts">
    import { Button } from "carbon-components-svelte";
    import { FileUploader } from "carbon-components-svelte";
    import { parseMrcFile } from "../utils/parseMrcFile";
    import { writableCurrentWorkout } from "../stores/currentWorkout";
    import { goto } from "@sapper/app";

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
        goto("/workout");
    }
</script>

<FileUploader
    multiple
    on:change={handleFileChange}
    labelTitle="Upload MRC workout file"
    buttonLabel="Add workout"
    accept={['.mrc']}
    status="complete" />

{#each files as file}
    <Button on:click={() => handleFileSelected(file)}>
        Select as current workout
    </Button>
{/each}
