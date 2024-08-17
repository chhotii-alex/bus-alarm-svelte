# bus-alarm-svelte

Welcome to the Bus Alarm, a handy tool for helping you keep track of when your Boston-area MBTA bus, trolly, or other mode of transport is expected to be at your nearest stop. Keeping an eye on these predictions is especially helpful if you need to catch an infrequently-running bus. Don't you just hate standing by the side of the road, in the weather, waiting at the bus stop for half an hour or more? Keep a close eye on those predictions, and you can spend up to the last reasonable moment in your warm, dry home or office before scampering to the bus stop (or T stop, or ferry dock...) just in time!

## Some technical notes

This is port (in progress) of my Bus Alarm project (https://github.com/chhotii-alex/bus-alarm), from Vue to Svelte. I don't
intend to maintain the Vue version. The Svelte code is much better.
Bus Alarm a SPA for conveniently keeping an eye on the MBTA's predictions, as reported by thier API, of when your bus (or train, or trolley, or boat...) arrives.

This code demonstrates use of the Svelte framework, use of fetch to consume a RESTful API, the programmatic use of the Google Maps and Places APIs, use of local storage (instead of cookies), creating sounds using AudioContext, and other snazzy JavaScript things.

Note: You MUST get your own API keys from the MBTA and from Google to get this code to work. Google "MBTA API key" and "Google maps API key" to find out how. The code will be sad without files named `googlekey.js` and `mbtakey.js` which I have not committed to the repo, for obvious reasons. Fortunately, these API keys are free, at least to get started. (Google will charge you eventually if you have a large number of hits, but I'm managing to stay on the free
tier.)

Copyright 2024 Alex Morgan

## Developing (adapted from SvelteKit boilerplate)

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

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment. This SPA is entirely client-side, so a static adapter will do.
