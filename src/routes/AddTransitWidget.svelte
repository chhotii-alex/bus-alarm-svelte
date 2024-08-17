<script>
  import StopPicker from "./StopPicker.svelte";

  export let addTransit;

  let selectedRouteName = "";
  let selectedRouteID;
  let selectedDirection = 0;
  let directionName = "";
  let selectedStop = null;
  let stopName = "";
  let nickname = "";

  function addStop() {
    let newNickname = nickname || `${selectedRouteName} ${directionName}`;
    let transit = {
      routeName: selectedRouteName,
      route: selectedRouteID,
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
      tooEarlyTime: "08:30",
      beepRepeatInterval: 5,
      minBeepTime: "07:00",
      maxBeepTime: "10:00",
    };
    addTransit(transit);
  }
</script>

<StopPicker
  bind:selectedRouteName
  bind:selectedRouteID
  bind:selectedDirection
  bind:directionName
  bind:selectedStop
  bind:stopName
/>
{#if selectedRouteID && selectedStop && stopName}
  <input bind:value={nickname} />
  <button on:click={addStop}> Add Stop to Watch List </button>
{/if}
