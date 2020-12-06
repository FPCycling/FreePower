import { getContext } from 'svelte';
import type { ThemeContext } from '../types/themes';

export function getThemeContext() {
    return getContext('Theme') as ThemeContext;
}
