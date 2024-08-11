<script>
  export let alerts;
</script>

<ul>
  {#each alerts as alert}
    <li>
      <b> {alert.attributes.short_header} </b>
      <br />
      {alert.attributes.description}
    </li>
  {/each}
</ul>
