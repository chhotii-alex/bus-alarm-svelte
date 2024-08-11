<script>
  export let transit;
  export let save;
  export let shouldDoBeep;

  function handleInput(e) {
    save();
  }
</script>

<p>
  Green Alert when within <input
    bind:value={transit.greenMinutes}
    on:input={handleInput}
  />
  minutes
  <input
    type="checkbox"
    id="ignoreEarlyBusses"
    bind:checked={transit.ignoreEarlyBusses}
    on:change={handleInput}
  />
  <label for="ignoreEarlyBusses"> Don&apos;t show any early bus</label>
  coming before
  {#if transit.ignoreEarlyBusses}
    <input
      type="time"
      bind:value={transit.tooEarlyTime}
      on:input={handleInput}
    />
  {/if}
</p>
<p>
  Yellow Alert when within <input
    bind:value={transit.yellowMinutes}
    on:input={handleInput}
  />
  minutes
  <input type="checkbox" id="beep" bind:checked={shouldDoBeep} />
  <label for="beep"> Beep during Yellow Alert </label>
  {#if shouldDoBeep}
    every <input
      bind:value={transit.beepRepeatInterval}
      on:input={handleInput}
    />
    seconds between
    <input
      type="time"
      bind:value={transit.minBeepTime}
      on:input={handleInput}
    />
    and
    <input
      type="time"
      bind:value={transit.maxBeepTime}
      on:input={handleInput}
    />
  {/if}
</p>
<p>
  Red Alert when within <input
    bind:value={transit.redMinutes}
    on:input={handleInput}
  />
  minutes
  <input
    type="checkbox"
    id="ignoreImmediateBusses"
    bind:checked={transit.ignoreImmediateBusses}
    on:change={handleInput}
  />
  <label for="ignoreImmediateBusses"> Don&apos;t show immediate bus </label>
  {#if transit.ignoreImmediateBusses}
    coming within <input
      bind:value={transit.immediateThreshold}
      on:input={handleInput}
    /> minutes
  {/if}
</p>
