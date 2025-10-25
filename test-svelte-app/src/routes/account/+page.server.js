// NOTE: `load` will run after an `action` completes

/** @type {import('./$types').PageServerLoad} */
export function load(event) {
	console.log('locals (load):', event.locals);

	return {
		user: event.locals.user
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	logout: async (event) => {
		console.log("Logging user out...");
		event.cookies.delete('sessionid', { path: '/' });
		event.locals.user = null;
	}
};