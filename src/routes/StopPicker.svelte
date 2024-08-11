<script>
  import { onMount } from "svelte";
  import { mbtaFetch } from "./mbtafetch.js";
  import { googleKey } from "./googlekey.js";
  import GeoLocationPicker from "./GeoLocationPicker.svelte";

  export let selectedRoute = "";
  export let selectedDirection = 0;
  export let directionName = "";
  export let selectedStop = null;
  export let stopName = "";

  // defaults to showing area around Park Street Station
  let latitude = 42.356334;
  let longitude = -71.062365;

  let routeIDs = [];

  let routesPromise = null;
  onMount(() => {
    routesPromise = (async function () {
      const url = "https://api-v3.mbta.com/routes";
      const response = await mbtaFetch(url);
      const data = await response.json();
      const routes = data.data;
      routeIDs = [];
      for (const route of routes) {
        routeIDs.push(route.id);
      }
      return routeIDs;
    })();
  });

  let directionsLookup = {};

  async function getDirections(route) {
    let directions = [];
    let newDirectionsLookup = {};
    if (routeIDs.includes(route)) {
      let url = "https://api-v3.mbta.com/routes/" + route;
      const response = await mbtaFetch(url);
      const data = await response.json();
      const attributes = data.data.attributes;
      const directionCount = attributes.direction_names.length;
      for (let i = 0; i < directionCount; ++i) {
        const name = attributes.direction_names[i];
        const dest = attributes.direction_destinations[i];
        const item = {
          name: `${name} to ${dest}`,
          id: i,
          label: `direction_${i}`,
        };
        directions.push(item);
        newDirectionsLookup[i] = item.name;
      }
    }
    directionsLookup = newDirectionsLookup;
    return directions;
  }
  $: directionsPromise = getDirections(selectedRoute);
  $: directionName = directionsLookup[selectedDirection];

  let stopsLookup = {};

  async function getStops(route, direction, lat, long) {
    let stops = [];
    let newStopLookup = {};
    if (route) {
      let url =
        "https://api-v3.mbta.com/stops?" +
        "filter[latitude]=" +
        latitude +
        "&filter[longitude]=" +
        longitude +
        "&filter[radius]=" +
        0.04 +
        "&filter[route]=" +
        route +
        "&filter[direction_id]=" +
        direction +
        "&sort=distance";
      const response = await mbtaFetch(url);
      const data = await response.json();
      let stopCount = data.data.length;
      if (stopCount > 3) stopCount = 3;
      for (let i = 0; i < stopCount; ++i) {
        let stopData = data.data[i];
        let stopLabel = "stop_" + stopData.id;
        let newStop = {
          name: stopData.attributes.name,
          id: stopData.id,
          label: stopLabel,
        };
        stops.push(newStop);
        newStopLookup[newStop.id] = newStop.name;
      }
    }
    stopsLookup = newStopLookup;
    return stops;
  }
  $: stopsPromise = getStops(
    selectedRoute,
    selectedDirection,
    latitude,
    longitude,
  );
  $: stopName = stopsLookup[selectedStop];
</script>

<svelte:head>
  <script
    defer
    async
    src="https://maps.googleapis.com/maps/api/js?loading=async&key={googleKey}&libraries=places"
  ></script>
</svelte:head>

<GeoLocationPicker bind:latitude bind:longitude />

<br />
Route: <input bind:value={selectedRoute} list="routes" />

{#if routesPromise}
  {#await routesPromise}
    waiting for routes list...
  {:then routes}
    <datalist id="routes">
      {#each routes as routeID}
        <option value={routeID} />
      {/each}
    </datalist>
  {:catch error}
    <i> Failed to fetch route list: {error} </i>
  {/await}
{/if}

{#await directionsPromise}
  waiting for directions options...
{:then directions}
  <div>
    {#each directions as dir}
      <input
        type="radio"
        id={dir.label}
        value={dir.id}
        bind:group={selectedDirection}
      />
      <label for={dir.label}> {dir.name} </label>
    {/each}
  </div>
{:catch error}
  <i> Failed to fetch directions: {error} </i>
{/await}

<span>
  {#await stopsPromise}
    waiting for stops...
  {:then stops}
    {#each stops as stop}
      <input
        type="radio"
        id={stop.id}
        value={stop.id}
        bind:group={selectedStop}
      />
      <label for={stop.id}> {stop.name} </label>
    {/each}
  {:catch error}
    <i>Failed to fetch stops: {error} </i>
  {/await}
</span>
