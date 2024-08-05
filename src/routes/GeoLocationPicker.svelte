<script>
  import { onMount } from "svelte";

  // default to Park Street Station
  export let latitude = 42.356334;
  export let longitude = -71.062365;
  let errorText = "";

  let googleMap = null;

  onMount(() => {
    var boston = new google.maps.LatLng(latitude, longitude);
    googleMap = new google.maps.Map(document.getElementById("map"), {
      center: boston,
      zoom: 17,
    });
    googleMap.addListener("center_changed", makeMeUpdateCoordinates);
  });

  function makeMeUpdateCoordinates() {
    latitude = googleMap.center.lat();
    longitude = googleMap.center.lng();
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

Google API stuff here
<div id="map"></div>

Latitude:<input
  value={latitude}
  on:input={(e) => updateCoordinate(e.target.value, "lat")}
/>
<br />
Longitude:
<input
  value={longitude}
  on:input={(e) => updateCoordinate(e.target.value, "lng")}
/>
<br />

Search near address:
<input on:keyup={(e) => processAddressOnEnter(e.key, e.target.value)} />

<style>
  #map {
    width: 400px;
    height: 400px;
  }
</style>
