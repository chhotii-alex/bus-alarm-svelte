<script>
  let audioElement;

  function startSound() {
    audioElement.play();
  }

  function stopSound() {
    audioElement.pause();
  }
</script>

<audio bind:this={audioElement}>
  <source src="putthepathhere" type="audio/mpeg" />
</audio>
