<script>
  export let alerts;
</script>

<ul>
  {#each alerts as alert}
    <li>
      <b> {alert.attributes.short_header} </b>
      <br />
      {#if alert.attributes.description}
        {alert.attributes.description}
      {/if}
    </li>
  {/each}
</ul>
