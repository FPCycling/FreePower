import { writable } from 'svelte/store';

let initialFtp = 308;

if (typeof window !== 'undefined' && window.localStorage) {
    initialFtp = Number(localStorage.getItem('userFtp'));
}

export const userFtp = writable<number | undefined>(initialFtp);

userFtp.subscribe((ftp) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('userFtp', `${ftp}`);
    }
});
