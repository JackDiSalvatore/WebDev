import { writable } from 'svelte/store';

export const counter = writable(0);

export const increase = () => {
	counter.update(c => c + 1);
}

export const decrease = () => {
	counter.update(c => c - 1);
}
