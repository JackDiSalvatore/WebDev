/** @type {import('./$types').PageLoad} */
export function load() {
	return {
		"pets": [
			{ type: 'Cat', name: 'Bob' },
			{ type: 'Dog', name: 'Alice' }
		]
	}
}