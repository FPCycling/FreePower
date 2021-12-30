import { getContext } from 'svelte';
import type { ThemeContext } from '../types/themes';

export function getThemeContext(): ThemeContext {
    return getContext('Theme') as ThemeContext;
}
