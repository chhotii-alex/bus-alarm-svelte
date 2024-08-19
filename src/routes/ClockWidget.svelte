<script>
  import { onMount } from "svelte";
  let now = new Date();

  onMount(() => {
    setInterval(tickTime, 333);
  });

  function tickTime() {
    now = new Date();
  }

  function timeString(when) {
    if (!when) return "";
    var hour = when.getHours();
    var ampm = "am";
    if (hour >= 12) {
      ampm = "pm";
      if (hour > 12) {
        hour = hour - 12;
      }
    } else if (hour == 0) {
      hour = 12;
    }
    var minute = when.getMinutes();
    minute = ("0" + minute).slice(-2);
    var second = when.getSeconds();
    second = ("0" + second).slice(-2);
    return `${hour}:${minute}:${second} ${ampm}`;
  }
</script>

<p>
  {timeString(now)}
</p>

<style>
  p {
    margin: auto;
    text-align: center;
  }
</style>
