<script>
  import { onMount } from "svelte";
  import { mbtaFetch } from "./mbtafetch.js";
  import { minutesAndSeconds } from "./timeutil.js";

  export let transit;
  export let removeFromParent;

  let prediction;
  let error;
  let soonest;
  let now = new Date();
  let color = "purple"; // DNCI "#FFFFFF";
  let showingDetails = false;

  onMount(() => {
    getPrediction();
    setInterval(getPrediction, 9999);
    setInterval(tickTime, 333);
  });

  function tickTime() {
    now = new Date();
  }

  async function getPrediction() {
    const url =
      "https://api-v3.mbta.com//predictions?filter[stop]=" +
      transit.stop +
      "&filter[direction_id]=" +
      transit.direction +
      "&sort=time";
    try {
      const response = await mbtaFetch(url, prediction?.lastMod);
      if (response.status == 304) {
        // See https://www.mbta.com/developers/v3-api/best-practices Caching
        prediction.lastSuccessfulFetch = Date.now();
        return;
      }
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const data = await response.json();
      const predictions = data.data;
      let times = [];
      for (const prediction of predictions) {
        if (prediction.relationships == null) continue;
        if (prediction.relationships.route == null) continue;
        if (prediction.relationships.route.data == null) continue;
        if (prediction.relationships.route.data.id != transit.route) continue;
        if (prediction.attributes.direction_id != transit.direction) continue;
        if (prediction.attributes.departure_time == null) continue;
        let time =
          prediction.attributes.arrival_time ||
          prediction.attributes.departure_time;
        if (time) times.push(time);
      }
      prediction = {
        times: times,
        lastSuccessfulFetch: Date.now(),
        lastMod: response.headers.get("last-modified"),
      };
      error = null;
    } catch (error) {
      error = error.message;
    }
  }

  function millisFromMinutes(minutes) {
    return minutes*60*1000;
  }

  function minutesFromMillis(millis) {
    return millis / (1000*60);
  }

  function updatePredictionDisplay(now, prediction, error) {
    let soonestArrivalTime = null; // pick out first time in prediction array that's not too immediate
    if (prediction) {
      for (const time of prediction.times) {
        let anArrivalTime = Date.parse(time);
	if (transit.ignoreImmediateBusses) {
	  if ((anArrivalTime - now.getTime()) < millisFromMinutes(transit.immediateThreshold)) {
	    continue;
	  }
	}
        let fields = time.split("T");
        // TODO ignoreEarlyBusses
        soonestArrivalTime = anArrivalTime;
        break;
      }
      let shouldBeep = false;
      if (soonestArrivalTime == null) {
        soonest = "no bus"; // TODO: use actual transit type (rail, boat...)
      } else {
        let ms = soonestArrivalTime - now.getTime();
        soonest = minutesAndSeconds(ms);
	let minutes = minutesFromMillis(ms);
	if (minutes < transit.redMinutes) {
	  color = "OrangeRed";
	}
	else if (minutes < transit.yellowMinutes) {
	  color = "yellow";
	}
	else if (minutes < transit.greenMinutes) {
	  color = "Lime";
	}
	else {
	  color = "#FFFFFF";
	}
      }
    } else {
      soonest = "";
    }
  }

  $: updatePredictionDisplay(now, prediction, error);

  function showDetails() {
    showingDetails = true;
  }

  function hideDetails() {
    showingDetails = false;
  }

  function removeTransit() {
    removeFromParent(transit);
  }
</script>

<fieldset style:background-color={color} >
  <legend> {transit.nickname} </legend>
  <div class="transit">
    Next {transit.route}
    bus from {transit.stopName}
    going {transit.directionName}:
    {soonest}
  </div>
  {#if error}
    <i> Error: {error} </i>
  {/if}
  {#if showingDetails}
    <button on:click={removeTransit}>remove</button>
    <button on:click={hideDetails}> X </button>
    <p>
    Green Alert when within <input bind:value={transit.greenMinutes} /> minutes
    <input type="checkbox" id="ignorEarlyBusses"
       bind:checked={transit.ignoreEarlyBusses} />
    <label for="ignoreEarlyBusses" > Don't show any early bus</label>
    </p>
    <p>
    Yellow Alert when within <input bind:value={transit.yellowMinutes} /> minutes
    <input type="checkbox" id="beep"
       bind:checked={transit.beep} />
    <label for="beep" > Beep during Yellow Alert </label>
    </p>
    <p>
    Red Alert when within <input bind:value={transit.redMinutes} /> minutes
    <input type="checkbox" id="ignoreImmediateBusses"
       bind:checked={transit.ignoreImmediateBusses} />
    <label for="ignoreImmediateBusses" > Don't show immediate bus </label>
    coming within <input bind:value={transit.immediateThreshold} /> minutes
    </p>
  {:else}
    <button on:click={showDetails}>Show Details</button>
  {/if}
</fieldset>

<style>
.transit {
  font-size: 48px;
  font-weight: 700;
}
</style>
