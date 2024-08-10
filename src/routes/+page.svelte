<script>
  /*
TODO:
* cope with temporary network glitch
* refactor: short functions
* refactor: good variable names
* refactor: atomic components
* re-order transits
* collapse/expand individual transits
* page title in head
* npm run format as a git commit hook?
* SVG icon for settings button
* meta viewport and media queries to adapt to various screens (esp. iPhone)
* see to-do's in code
* different icons for different types of alerts
* DEMO mode
* allow playing uploaded .mp3
* pay attention to alert.attributes.active_period
*/

  import { onMount } from "svelte";
  import StopPicker from "./StopPicker.svelte";
  import TransitPrediction from "./TransitPrediction.svelte";

  const isBrowser = typeof window !== "undefined";

  function transitsFromStorage() {
    if (isBrowser) {
      if (localStorage.getItem("transits")) {
        let s = localStorage.getItem("transits");
        let storedTransits = JSON.parse(s);
        if (storedTransits instanceof Array) {
          for (let transit of storedTransits) {
            if (!transit.nickname) {
              transit.nickname = `${transit.route} from ${transit.stop}`;
            }
          }
          return storedTransits;
        }
      }
    }
    return [];
  }

  function saveAll() {
    if (isBrowser) {
      let s = JSON.stringify(transits);
      localStorage.setItem("transits", s);
    }
  }

  let transits = [];

  onMount(() => {
    transits = transitsFromStorage();
  });

  let selectedRoute = "";
  let selectedDirection = 0;
  let directionName = "";
  let selectedStop = null;
  let stopName = "";
  let nickname = "";

  function addStop() {
    let newNickname = nickname || `${selectedRoute} ${directionName}`;
    let transit = {
      route: selectedRoute,
      direction: selectedDirection,
      directionName: directionName,
      stop: selectedStop,
      stopName: stopName,
      nickname: newNickname,
      ignoreImmediateBusses: true,
      immediateThreshold: 1,
      greenMinutes: 30,
      yellowMinutes: 15,
      redMinutes: 5,
      ignoreEarlyBusses: false,
      earlyTime: "8:30",
      beepRepeatInterval: 5,
      minBeepTime: "7:00",
      maxBeepTime: "10:00",
    };
    transits.push(transit);
    transits = transits;
    saveAll();
  }

  function removeTransit(transit) {
    let index = transits.indexOf(transit);
    if (index < 0) return;
    transits.splice(index, 1);
    transits = transits;
    saveAll();
  }
</script>

<details>
  <summary> Current Time </summary>
  Here is where the time will go
</details>
<details>
  <summary> User Manual </summary>
  Instructions for using Bus Alarm here
</details>

{#each transits as transit}
  <TransitPrediction {transit} removeFromParent={removeTransit}
      save={saveAll}/>
{/each}

<details>
  <summary> Route, Direction, and Stop Picker </summary>
  <StopPicker
    bind:selectedRoute
    bind:selectedDirection
    bind:directionName
    bind:selectedStop
    bind:stopName
  />
</details>

{#if selectedRoute && selectedStop}
  <input bind:value={nickname} />
  <button on:click={addStop}> Add Stop to Watch List </button>
{/if}

{selectedRoute}
{selectedDirection}
{selectedStop}
