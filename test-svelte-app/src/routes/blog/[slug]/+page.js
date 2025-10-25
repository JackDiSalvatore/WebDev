import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {

	try {
		return {
			title: `Title for "${params.slug}" goes here`,
			content: `Blog post conntent for "${params.slug}" goes here.  This is my blog post.  I hope you enjoy reading it!`,
			parentData: `Parent Blog data goes here`,
			comments: [
				{
					'author': 'Jack',
					'content': 'Lorem ipsum dolar ...'
				}
			]
		};
	} catch (e) {
		error(404, 'Not found ' + e);
	}
}
