<script>
  import { onMount } from "svelte";
  import { mbtaFetch } from "./mbtafetch.js";
  import { googleKey } from "./googlekey.js";
  import GeoLocationPicker from "./GeoLocationPicker.svelte";
  import Picker from "./Picker.svelte";

  export let selectedRouteName = "";
  export let selectedRouteID;
  export let selectedDirection = 0;
  export let directionName = "";
  export let selectedStop = null;
  export let stopName = "";

  // defaults to showing area around Park Street Station
  let latitude = 42.356334;
  let longitude = -71.062365;

  // this is a name -> ID lookup for all the MBTA routes
  let routes = new Map();
  $: selectedRouteID = routes.get(selectedRouteName);

  let routesPromise = null;
  onMount(() => {
    routesPromise = (async function () {
      const url = "https://api-v3.mbta.com/routes";
      const response = await mbtaFetch(url);
      const data = await response.json();
      const routesData = data.data;
      for (const route of routesData) {
        let routeID = route.id;
        let routeName;
        if (route.attributes.type == 3) {
          routeName = `${route.attributes.short_name} Bus`;
        } else {
          routeName = route.attributes.long_name;
        }
        routes.set(routeName, routeID);
      }
      return routes;
    })();
  });

  let nearbyRouteSet = null;

  function shouldShowRoute(routeID, theSet) {
    if (theSet === null) {
      return true;
    } else {
      return theSet.has(routeID);
    }
  }

  let routesForStopLookup = {};

  /*
    Populates the collection of routes served by nearby stops,
    which will constrain what routes appear in the datalist
    associated with the route input.
    This will be fired whenever latitude and/or longitude change.
    Does queries for up to 100 of the closest stops.
    TODO: this implementation may be questionable, because it
    does a separate query for each stop (results for each stop
    are cached). It may be better to make one routes API query
    with multiple comma-separated stop ids instead.
    Each routes query filtered on a single stop typically takes
    26 to 30 ms.

    To avoid unneccessary queries, and to avoid using
    a stale result, this function checks the component-scope values
    of latitude and longitude again each time through the loop, and
    exits if they have again changed (though the cached results
    accumulated so far are retained and will probably be useful.)
    
  */
  async function getNearbyRoutes(lat, long) {
    let newSet = new Set();
    let stops = [];
    let url =
      "https://api-v3.mbta.com/stops?" +
      "filter[latitude]=" +
      lat +
      "&filter[longitude]=" +
      long +
      "&filter[radius]=" +
      0.04 +
      "&sort=distance" +
      "&page[limit]=100";
    const response = await mbtaFetch(url);
    const data = await response.json();
    for (let [index, stopData] of data.data.entries()) {
      let id = stopData.id;
      if (!(id in routesForStopLookup)) {
        let url = "https://api-v3.mbta.com/routes?" + `filter[stop]=${id}`;
        const response = await mbtaFetch(url);
        const routeData = await response.json();
        routesForStopLookup[id] = routeData.data.map((d) => d.id);
      }
      if (lat != latitude || long != longitude) return;
      for (let routeID of routesForStopLookup[id]) {
        newSet.add(routeID);
        if (nearbyRouteSet !== null) {
          nearbyRouteSet.add(routeID);
        }
      }
    }
    nearbyRouteSet = newSet;
  }

  $: getNearbyRoutes(latitude, longitude);

  let directionsLookup = {};

  async function getDirections(routeName) {
    let directions = [];
    let newDirectionsLookup = {};
    if (routes.has(routeName)) {
      let route = routes.get(routeName);
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
  $: directionsPromise = getDirections(selectedRouteName);
  $: directionName = directionsLookup[selectedDirection];

  let stopsLookup = {};

  async function getStops(routeName, direction, lat, long) {
    let stops = [];
    let newStopLookup = {};
    if (routeName && routes.has(routeName)) {
      let route = routes.get(routeName);
      let url =
        "https://api-v3.mbta.com/stops?" +
        "filter[latitude]=" +
        lat +
        "&filter[longitude]=" +
        long +
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
    selectedRouteName,
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

<GeoLocationPicker bind:latitude bind:longitude>
  <span class="fieldLabel"> Route: </span>
  <span>
    <input bind:value={selectedRouteName} list="routes" class="wide" />

    {#if routesPromise}
      {#await routesPromise}
        waiting for routes list...
      {:then routes}
        <datalist id="routes">
          {#each routes as routeInfo}
            {#if shouldShowRoute(routeInfo[1], nearbyRouteSet)}
              <option value={routeInfo[0]} />
            {/if}
          {/each}
        </datalist>
      {:catch error}
        <i> Failed to fetch route list: {error} </i>
      {/await}
    {/if}
  </span>

  <Picker
    promise={directionsPromise}
    bind:selection={selectedDirection}
    name="direction"
  />
  <Picker promise={stopsPromise} bind:selection={selectedStop} name="stop" />
  <slot />
</GeoLocationPicker>
