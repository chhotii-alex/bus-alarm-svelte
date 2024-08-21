<script>
  import ColorAlertSetting from "./ColorAlertSetting.svelte";
  import BeepSettings from "./BeepSettings.svelte";

  export let transit;
  export let save;
  export let shouldDoBeep;

  function handleInput(e) {
    transit = transit;
    save();
  }
</script>

<p>
  <ColorAlertSetting
    colorName="Green"
    bind:minutes={transit.greenMinutes}
    inputHandler={handleInput}
  />
  <span>
    <input
      type="checkbox"
      id="ignoreEarlyBusses"
      bind:checked={transit.ignoreEarlyBusses}
      on:change={handleInput}
    />
    <label for="ignoreEarlyBusses"> Don&apos;t show any early bus</label>
    {#if transit.ignoreEarlyBusses}
      coming before
      <input
        type="time"
        bind:value={transit.tooEarlyTime}
        on:input={handleInput}
      />
    {/if}
  </span>
</p>
<p>
  <ColorAlertSetting
    colorName="Yellow"
    bind:minutes={transit.yellowMinutes}
    inputHandler={handleInput}
  />
  <BeepSettings bind:shouldDoBeep {transit} {handleInput} />
</p>
<p>
  <ColorAlertSetting
    colorName="Red"
    bind:minutes={transit.redMinutes}
    inputHandler={handleInput}
  />
  <span>
    <input
      type="checkbox"
      id="ignoreImmediateBusses"
      bind:checked={transit.ignoreImmediateBusses}
      on:change={handleInput}
    />
    <label for="ignoreImmediateBusses"> Don&apos;t show bus </label>
    {#if transit.ignoreImmediateBusses}
      coming within <input
        bind:value={transit.immediateThreshold}
        type="number"
        min="0"
        max="60"
        on:input={handleInput}
      /> minutes
    {/if}
  </span>
</p>

<style>
  @media only screen and (max-width: 870px) {
    span {
      display: block;
    }
  }
</style>
