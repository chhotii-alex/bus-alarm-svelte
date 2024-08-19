<script>
  /*
TODO:
* clock/time
* save order after reordering
* style the details/settings
* user manual text
* collapse/expand individual transits
* page title in head
* npm run format as a git commit hook?
* use route color
* SVG icon for settings button
* meta viewport and media queries to adapt to various screens (esp. iPhone)
* see to-do's in code
* enhancements: datalist only lists routes with stops near lat/long
* enhancement: see more stops when map zoom out
* Don't save direction name as attribute of transit; fetch anew on load
* different icons for different types of alerts
* DEMO mode
* README
* allow playing uploaded .mp3
* pay attention to alert.attributes.active_period
* refactor: clean code recommendations
*/

  import { onMount } from "svelte";
  import TransitPrediction from "./TransitPrediction.svelte";
  import AddTransitWidget from "./AddTransitWidget.svelte";
  import ClockWidget from "./ClockWidget.svelte";

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

  function nextID(transits) {
    let next = 1;
    for (let transit of transits) {
      if (transit.id >= next) {
        next = transit.id + 1;
      }
    }
    return next;
  }

  function addTransit(transit) {
    transit.id = nextID(transits);
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
  function swap(toID, fromID) {
    if (toID == fromID) return;
    let toIndex = transits.findIndex((t) => t.id == toID);
    let fromIndex = transits.findIndex((t) => t.id == fromID);
    if (toIndex < 0 || fromIndex < 0) return;
    let movedItem = transits.splice(fromIndex, 1)[0];
    transits.splice(toIndex, 0, movedItem);
    transits = transits;
  }
</script>

<details>
  <summary> Current Time </summary>
  <ClockWidget />
</details>
<details>
  <summary> User Manual </summary>
  Instructions for using Bus Alarm here
</details>

{#each transits as transit (transit.id)}
  <TransitPrediction
    {transit}
    removeFromParent={removeTransit}
    save={saveAll}
    {swap}
  />
{/each}

<details>
  <summary> Route, Direction, and Stop Picker </summary>
  <AddTransitWidget {addTransit} />
</details>

<style>
</style>
