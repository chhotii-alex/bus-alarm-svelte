<script>
  import { onMount } from "svelte";
  import { mbtaFetch } from "./mbtafetch.js";
  import {
    minutesAndSeconds,
    timeStringToMinutes,
    justTimePart,
    minutesFromNow,
    minutesFromMillis,
    millisFromMinutes,
    minutesFromMidnight,
  } from "./timeutil.js";
  import AlertsDisplay from "./AlertsDisplay.svelte";
  import TransitSettings from "./TransitSettings.svelte";

  export let transit;
  export let removeFromParent;
  export let save;

  let prediction;
  let alerts = [];
  let errorText;
  let soonest;
  let now = new Date();
  let color = "#FFFFFF";
  let showingDetails = false;
  let shouldDoBeep = false; // whether we should beep when bus approaching
  let beepsOn = false; // ON when we both want beeps, and a bus is approaching
  let beepTimerID = null;
  let myAudioContext = null;
  let audioOffsetTime = null;

  onMount(() => {
    getPrediction();
    getAlerts();
    setInterval(getPrediction, 9999);
    setInterval(getAlerts, 5 * 60 * 1000);
    setInterval(tickTime, 333);
    setBeepInterval(transit.beepRepeatInterval);
  });

  function setBeepInterval(repeatInterval) {
    if (beepTimerID) {
      clearInterval(beepTimerID);
      beepTimerID = null;
    }
    let interval = parseInt(repeatInterval);
    if (!(typeof interval == "number") || interval < 1) {
      interval = 1;
    }
    beepTimerID = setInterval(maybeBeep, interval * 1000);
  }

  $: setBeepInterval(transit.beepRepeatInterval);
  $: if (shouldDoBeep) makeAudioContext();

  function makeAudioContext() {
    if (!myAudioContext) {
      let AudioContext = window.AudioContext || window.webkitAudioContext; // find the class
      myAudioContext = new AudioContext();
    }
  }

  function tickTime() {
    now = new Date();
  }

  function maybeBeep() {
    if (!beepsOn) return;
    // TODO configurable
    let vol = 100;
    let freq = 220;
    let duration = 300;

    let startTime = myAudioContext.currentTime;
    if (audioOffsetTime && audioOffsetTime > startTime) {
      startTime = audioOffsetTime + 0.02;
    }
    let endTime = startTime + duration * 0.001;
    audioOffsetTime = endTime;
    let beep = myAudioContext.createOscillator();
    beep.frequency.value = freq;
    beep.type = "sine";
    let u = myAudioContext.createGain();
    u.connect(myAudioContext.destination);
    u.gain.setValueAtTime(0, startTime);
    u.gain.linearRampToValueAtTime(vol * 0.01, startTime + 0.05);
    u.gain.linearRampToValueAtTime(0, endTime);
    beep.connect(u);
    beep.start(startTime);
    beep.stop(endTime);
  }

  async function getAlerts() {
    let route = transit.route;
    let url = `https://api-v3.mbta.com//alerts?filter[route]=${route}`;
    try {
      const response = await mbtaFetch(url);
      if (!response.ok) {
        throw new Error(`Response status for alerts: ${response.status}`);
      }
      const data = await response.json();
      alerts = data.data;
    } catch (err) {
      errorText = err.message;
    }
  }

  function urlForPredictions(transit) {
    return (
      "https://api-v3.mbta.com//predictions?filter[stop]=" +
      transit.stop +
      "&filter[direction_id]=" +
      transit.direction +
      "&sort=time"
    );
  }

  function clearPredictionError() {
    prediction.lastSuccessfulFetch = Date.now();
    errorText = null;
  }

  function isUsaablePrediction(prediction) {
    if (prediction.relationships == null) return false;
    if (prediction.relationships.route == null) return false;
    if (prediction.relationships.route.data == null) return false;
    if (prediction.relationships.route.data.id != transit.route) return false;
    if (prediction.attributes.direction_id != transit.direction) return false;
    if (prediction.attributes.departure_time == null) return false;
    return true;
  }

  async function getPrediction() {
    const url = urlForPredictions(transit);
    try {
      const response = await mbtaFetch(url, prediction?.lastMod);
      if (response.status == 304) {
        // See https://www.mbta.com/developers/v3-api/best-practices Caching
        clearPredictionError();
        return;
      }
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const data = await response.json();
      const predictions = data.data;
      let times = [];
      for (const prediction of predictions) {
        if (!isUsaablePrediction(prediction)) continue;
        let time =
          prediction.attributes.arrival_time ||
          prediction.attributes.departure_time;
        if (time) times.push(time);
      }
      prediction = {
        times: times,
        lastMod: response.headers.get("last-modified"),
      };
      clearPredictionError();
    } catch (err) {
      errorText = err.message;
      if (prediction?.lastSuccessfulFetch) {
        let whenStr = new Date(prediction.lastSuccessfulFetch).toLocaleString();
        errorText += ` Last successful fetch: ${whenStr}`;
      }
    }
  }

  function getSoonestValidArrival(prediction) {
    let soonestArrivalTime = null; // pick out first time in prediction array that's not too immediate
    for (const time of prediction.times) {
      let anArrivalTime = Date.parse(time);
      if (transit.ignoreImmediateBusses) {
        if (
          anArrivalTime - now.getTime() <
          millisFromMinutes(transit.immediateThreshold)
        ) {
          continue;
        }
      }
      if (transit.ignoreEarlyBusses && transit.tooEarlyTime) {
        let tooEarlyTimeInMin = timeStringToMinutes(transit.tooEarlyTime);
        let transitTime = minutesFromMidnight(time);
        if (transitTime < tooEarlyTimeInMin) {
          continue; // we are not interested in any bus that comes THAT early
        }
      }
      soonestArrivalTime = anArrivalTime;
      break;
    }
    return soonestArrivalTime;
  }

  function updatePredictionDisplay(now, prediction, _) {
    let shouldBeepNow = false;
    if (prediction) {
      let soonestArrivalTime = getSoonestValidArrival(prediction);
      if (soonestArrivalTime == null) {
        soonest = "no bus"; // TODO: use actual transit type (rail, boat...)
        color = "grey";
      } else {
        let ms = soonestArrivalTime - now.getTime();
        soonest = minutesAndSeconds(ms);
        let minutes = minutesFromMillis(ms);
        if (minutes < transit.redMinutes) {
          color = "OrangeRed";
        } else if (minutes < transit.yellowMinutes) {
          color = "yellow";
          if (shouldDoBeep) {
            let nowMinutes = now.getHours() * 60 + now.getMinutes();
            if (
              nowMinutes >= timeStringToMinutes(transit.minBeepTime) &&
              nowMinutes <= timeStringToMinutes(transit.maxBeepTime)
            ) {
              shouldBeepNow = true;
            }
          }
        } else if (minutes < transit.greenMinutes) {
          color = "Lime";
        } else {
          color = "#FFFFFF";
        }
      }
    } else {
      soonest = "";
    }
    beepsOn = shouldBeepNow;
  }

  $: updatePredictionDisplay(now, prediction, errorText);

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

<fieldset style:background-color={color}>
  <legend> {transit.nickname} </legend>
  <div class="transit">
    Next {transit.route}
    bus from {transit.stopName}
    going {transit.directionName}:
    {soonest}
  </div>
  {#if errorText}
    <i> Error: {errorText} </i>
  {/if}
  <AlertsDisplay {alerts} />
  {#if showingDetails}
    All predicted times:
    <ul>
      {#each prediction.times as time}
        <li>
          {justTimePart(time)} ( in {minutesFromNow(time, now)} minutes )
        </li>
      {/each}
    </ul>
    <button on:click={removeTransit}>remove</button>
    <button on:click={hideDetails}> X </button>
    <TransitSettings bind:transit {save} bind:shouldDoBeep />
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
