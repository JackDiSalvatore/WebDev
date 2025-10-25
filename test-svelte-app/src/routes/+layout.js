/** @type {import('./$types').LayoutLoad} */
export function load() {
	return {
		navOptions: [
			{ title: 'Home', link: '/' },
			{ title: 'About', link: '/about' },
			{ title: 'Blog', link: '/blog/hello-world' },
			{ title: 'Settings', link: '/settings' },
			{ title: 'Login', link: '/login' },
			{ title: 'Account', link: '/account' },
			{ title: 'Counter', link: '/counter' },
			{ title: 'Pokemon', link: '/pokemon'},
			{ title: 'Context Example', link: '/context-example'},
			{ title: 'Slot Forwarding', link: '/slot-forwarding' },
			{ title: 'List', link: '/list' },
			{ title: 'Input', link: '/input' }
		]
	}
}