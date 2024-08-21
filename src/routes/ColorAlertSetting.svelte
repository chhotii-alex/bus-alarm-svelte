<script>
  export let colorName;
  export let minutes;
  export let inputHandler;
</script>

{colorName} Alert when within
<input
  bind:value={minutes}
  on:input={inputHandler}
  type="number"
  min="1"
  max="480"
/>
minutes
