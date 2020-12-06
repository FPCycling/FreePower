import type { Writable } from 'svelte/store';

export type ThemeContext = {
    updateVar: (varName: string, value: any) => void;
    dark: Writable<boolean>;
    light: Writable<boolean>;
    carbon_theme: Writable<string>;
};
