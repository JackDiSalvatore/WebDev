import { writable } from 'svelte/store'
import { getContext, setContext } from 'svelte'

export function setContextCounter() {
	let contextCounter = writable(0);	// create new store for reactivity
	setContext('contextCounter', contextCounter);
}

export function getContextCounter() {
	return getContext('contextCounter');
}
