# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Notes

**File Structure**

```bash
- src: all source code
| - lib: library files and components
| - routes: application "pages"
  | - about: About page route

# File explaination
1. +page.js : pre-render functions before page loads
2. +page.server.js : server side version of above ^
3. +page.svelte : the actually application "page"
4. +error.svelte : optional error page

5. +layout.svelte : a "layout" that applies to multiple pages (i.e. a navigation bar)
6. +layout.js : pre-render functions before page loads. (Data returned from a layout's load function is also available to all its child pages)
6. +layout.server.js : server side version of above

7. +server.js : defines a REST API endpoint

```

From: https://kit.svelte.dev/docs/load

> Server load functions are convenient when you need to access data directly from a database or filesystem, or need to use private environment variables.

> Universal load functions are useful when you need to fetch data from an external API and don't need private credentials, since SvelteKit can get the data directly from the API rather than going via your server. They are also useful when you need to return something that can't be serialized, such as a Svelte component constructor.
