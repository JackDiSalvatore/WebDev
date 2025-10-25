/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {

	// event: incoming request
	// locals: one time use variable
	// resolve: run through load function

	if (event.url.pathname.startsWith('/account')) {
		// event.locals.user = await getUser(event.cookies.get('sessionid'));
		event.locals.user = { 'name': 'Jack', 'email': 'jack@email.com' };
		return resolve(event);
	} else {
		return resolve(event);
	}
}