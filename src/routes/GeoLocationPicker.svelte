<script>
  import { onMount } from "svelte";

  // default to Park Street Station, Boston
  export let latitude = 42.356334;
  export let longitude = -71.062365;
  export let geeky = false;
  let errorText = "";

  let googleMap = null;

  onMount(() => {
    let initialLocation = new google.maps.LatLng(latitude, longitude);
    googleMap = new google.maps.Map(document.getElementById("map"), {
      center: initialLocation,
      zoom: 17,
    });
    googleMap.addListener("center_changed", makeMeUpdateCoordinates);
  });

  function makeMeUpdateCoordinates() {
    latitude = googleMap.center.lat().toFixed(6);
    longitude = googleMap.center.lng().toFixed(6);
  }

  function updateCoordinate(coord, direction) {
    coord = parseFloat(coord);
    if (!googleMap) return;
    let center = {
      lat: googleMap.center.lat(),
      lng: googleMap.center.lng(),
    };
    center[direction] = coord;
    if (
      googleMap.getCenter.lat != center.lat ||
      googleMap.getCenter.lng != center.lng
    ) {
      googleMap.setCenter(center);
    }
  }

  function placeQueryResultHandler(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      errorText = "";
      let location = results[0].geometry.location;
      if (location) {
        googleMap.setCenter(location);
      }
    } else {
      errorText = "some kind of error on geocoding";
    }
  }

  function geoFromAddress(address) {
    if (!address) {
      return;
    }
    if (!googleMap) {
      return;
    }
    let request = {
      query: address,
      fields: ["name", "geometry"],
    };
    let places = google.maps.places;
    if (places) {
      let service = new places.PlacesService(googleMap);
      service.findPlaceFromQuery(request, placeQueryResultHandler);
    } else {
      errorText = "no such thing as google.maps.places?";
    }
  }

  function processAddressOnEnter(key, newAddress) {
    if (key === "Enter") {
      geoFromAddress(newAddress);
    }
  }
</script>

<h1>
  {errorText}
</h1>

<div class="wrapper">
  <div id="map"></div>

  <div class="fields">
    {#if geeky}
    <span class="fieldLabel">
      Latitude:
      </span>
      <span>
      <input size="10"
        value={latitude}
        on:input={(e) => updateCoordinate(e.target.value, "lat")}
      />
      </span>
      <span class="fieldLabel" >
            Longitude:
      </span>
      <span>
      <input size="10"
        value={longitude}
        on:input={(e) => updateCoordinate(e.target.value, "lng")}
      />
      </span>
    {/if}
      <span class="fieldLabel" >Search near address:</span>
      <span>
      <input class="wide"
        on:keyup={(e) => processAddressOnEnter(e.key, e.target.value)}
	on:blur={(e => geoFromAddress(e.target.value))}
      />
      </span>
    <slot />
  </div>
</div>

<style>
  #map {
    width: 400px;
    height: 400px;
  }
  .wrapper {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 10px;
  }
  .map {
    grid-column: 1;
  }
  .fields {
    grid-column: 2;
    display: grid;
    align-items: center;
    grid-auto-rows: min-content;
    grid-template-columns: 11em 1fr;
    row-gap: 0.5em;
    column-gap: 1em;
    padding: 10% 0;
  }
  .fields :global(span.fieldLabel) {
    text-align: right;
  }
  .fields :global(button) {
    grid-column: 1 / span 2;
  }
  .fields :global(input.wide) {
    width: 90%;
  }

  @media only screen and (max-width: 800px) {
    .fields {
      grid-template-columns: 1fr 2fr;
      }
  }
  @media only screen and (max-width: 700px) {
    .fields {
      display: block;
    }
  .fields :global(span.fieldLabel) {
    display: block;
    text-align: center;
  }
  .fields :global(span) {
    display: block;
    text-align: center;
  }
  .fields :global(input) {
    margin: 0 auto;
    width: auto;
  }
  .fields :global(button) {
    display: block;
    margin: 0.5em auto;
  }
}
  @media only screen and (max-width: 600px) {
    #map {
      width: 98%;
    }
    .wrapper {
      display: block;
    }
    .fields {
      display: grid;
      grid-column: 2;
    }
  .fields :global(span.fieldLabel) {
    text-align: right;
  }
  .fields :global(span) {
    text-align: left;
  }
  }
</style>
