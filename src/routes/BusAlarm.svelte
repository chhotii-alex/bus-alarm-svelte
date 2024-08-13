<script>
  /*
TODO:
* README
* hitting enter from nickname field fires button
* re-order transits
* collapse/expand individual transits
* page title in head
* npm run format as a git commit hook?
* use route color
* SVG icon for settings button
* meta viewport and media queries to adapt to various screens (esp. iPhone)
* see to-do's in code
* Don't save direction name as attribute of transit; fetch anew on load
* different icons for different types of alerts
* DEMO mode
* allow playing uploaded .mp3
* pay attention to alert.attributes.active_period
* refactor: clean code recommendations
*/

  import { onMount } from "svelte";
  import TransitPrediction from "./TransitPrediction.svelte";
  import AddTransitWidget from "./AddTransitWidget.svelte";

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

  function addTransit(transit) {
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

{#each transits as transit (transit) }
  <TransitPrediction
    {transit}
    removeFromParent={removeTransit}
    save={saveAll}
  />
{/each}

<details>
  <summary> Route, Direction, and Stop Picker </summary>
  <AddTransitWidget {addTransit} />
</details>
