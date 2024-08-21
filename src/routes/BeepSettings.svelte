<script>
  export let shouldDoBeep;
  export let transit;
  export let handleInput;
</script>

<span class="outer">
  <input type="checkbox" id="beep" bind:checked={shouldDoBeep} />
  <label for="beep"> Beep during Yellow Alert </label>
  <span class="middle">
    {#if shouldDoBeep}
      every <input
        bind:value={transit.beepRepeatInterval}
        on:input={handleInput}
        type="number"
        min="1"
        max="120"
      />
      seconds
      <span>
        between
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
      </span>
    {/if}
  </span>
</span>

<style>
  @media only screen and (max-width: 1100px) {
    span.outer {
      display: block;
    }
  }
  @media only screen and (max-width: 900px) {
    span.middle {
      display: block;
    }
  }
  @media only screen and (max-width: 600px) {
    span {
      display: block;
    }
  }
</style>
