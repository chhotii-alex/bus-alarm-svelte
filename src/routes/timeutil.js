export const minutesAndSeconds = function (diff) {
  // diff is in millisesconds
  if (diff < 500) {
    // Includes cases where diff is negative, which does happen
    return "NOW";
  }
  diff = Math.floor(diff / 1000); // in seconds
  let minutes = Math.floor(diff / 60); // in minutes
  let seconds = diff % 60;
  var str = "" + minutes + " minutes";
  if (minutes < 10) {
    str = str + ", " + seconds + " seconds";
  }
  return str;
};
