<script>
	import { applyAction, enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';

	/** @type {import('./$types').PageData} */
	export let data;

	/** @type {import('./$types').ActionData} */
	export let form;

	const login = ({ formElement, formData, action, cancel, submitter }) => {
		// `formElement` is this `<form>` element
		// `formData` is its `FormData` object that's about to be submitted
		// `action` is the URL to which the form is posted
		// calling `cancel()` will prevent the submission
		// `submitter` is the `HTMLElement` that caused the form to be submitted

		const { email, password } = Object.fromEntries(formData);
		console.log("email, password: ", email, password);

		return async ({ result, update }) => {
			// `result` is an `ActionResult` object
			// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
			console.log('result: :', result);

			switch (result.type) {
				case 'success': {
					await update({ reset: true });	// clear UI inputs
					await invalidateAll();			// clear UI inputs

					await applyAction(result);
					break;
				}
				case 'failure': {
					alert('invalid input');
					break;
				}
			}
		};
	}
</script>

<h1>User Login</h1>

<form method="POST" action="?/login">
	<label>
		Email
		<input name="email" type="email">
	</label>
	<label>
		Password
		<input name="password" type="password">
	</label>
	<!-- Goes to `login` function in /login/+page.server.js -->
	<button>Log in (server-side)</button>

	<!-- Goes to `register` function in /login/+page.server.js -->
	<button formaction="?/register">Register (server-side)</button>
	<button formaction="/login?/register">Register (server-side)</button>
</form>

<form method="POST" action="?/login" use:enhance={login}>
	<label>
		Email
		<input name="email" type="email">
	</label>
	<label>
		Password
		<input name="password" type="password">
	</label>
	<button>Log in (enhanced)</button>
</form>

<!-- Alternative to `formaction` -->
<form method="POST" action="/login?/register">
	<button>Register</button>
</form>

{#if form?.success}
	<!-- this message is ephemeral; it exists because the page was rendered in
		   response to a form submission. it will vanish if the user reloads -->
	<p>Successfully logged in! Welcome back, {data.user.name}</p>
{/if}
