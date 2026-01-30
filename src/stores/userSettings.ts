import { writable } from 'svelte/store';

let initialFtp = 200;

if (typeof window !== 'undefined' && window.localStorage) {
    const storedFtp = localStorage.getItem('userFtp');
    if (storedFtp) {
        initialFtp = Number(storedFtp);
    } else {
        localStorage.setItem('userFtp', '200');
    }
}

export const userFtp = writable<number | undefined>(initialFtp);

userFtp.subscribe((ftp) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('userFtp', `${ftp}`);
    }
});

export const difficulty = writable<number | undefined>(1);
