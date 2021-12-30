import type { Writable, Readable } from 'svelte/store';

export type Theme = 'light' | 'dark';

export interface ThemeContext {
    theme: Writable<Theme>;
    dark: Readable<boolean>;
    light: Readable<boolean>;
}
