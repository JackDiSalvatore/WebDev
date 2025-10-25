/** @type {import('./$types').PageLoad} */
export const load = async ({ fetch }) => {

	const res = await fetch('https://pokeapi.co/api/v2/pokemon/pikachu', {
		'method': 'get',
		'headers': {
		  'accept': 'application.json',
		  'content-type': 'application/json'
		},
		'cache': 'default'
	  }
	)

	const pokemon = await res.json();

	return pokemon;
}
