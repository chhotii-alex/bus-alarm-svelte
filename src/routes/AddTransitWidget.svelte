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
      sound: {
        minTime: "07:00",
        maxTime: "10:00",
        yellow: {
          active: true,
          beep: {
            repeatInterval: 5,
            volume: 100,
            freq: 220,
            duration: 300,
          },
        },
        red: {
          active: true,
          beep: {
            repeatInterval: 2,
            volume: 110,
            freq: 120,
            duration: 300,
          },
        },
      },
    };
    addTransit(transit);
  }

  function onEnter(key, action) {
    if (key === "Enter") {
      action();
    }
  }
</script>

<StopPicker
  bind:selectedRouteName
  bind:selectedRouteID
  bind:selectedDirection
  bind:directionName
  bind:selectedStop
  bind:stopName
>
  {#if selectedRouteID && selectedStop && stopName}
    <span class="fieldLabel"> Nickname: </span>
    <span>
      <input
        class="wide"
        bind:value={nickname}
        on:keyup={(e) => onEnter(e.key, addStop)}
      />
    </span>
    <button on:click={addStop}> Add Stop to Watch List </button>
  {/if}
</StopPicker>
