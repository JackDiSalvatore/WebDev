import { fail, redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies }) {
	// const user = await db.getUserFromSession(cookies.get('sessionid'));
	return {
		'user': {
			'name': 'Jack D'
		}
	 };
};

/** @type {import('./$types').Actions} */
export const actions = {
	login: async ({ cookies, request, url }) => {
		// TODO log the user in
		console.log('Logging user in');
		const { email, password } = Object.fromEntries(await request.formData());

		if (email != '' && password != ''){
			return { success: true };
		}
		else {
			return fail(400, { email, missing: true })
		}
	},
	register: async (event) => {
		// TODO register the user
		console.log('Registering user');
		redirect(303, '/');
	}
};
