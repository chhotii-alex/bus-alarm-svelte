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

export const timeStringToMinutes = function (str) {
  if (typeof str != "string") return 0;
  let fields = str.split(":");
  let minutes = 60 * parseInt(fields[0]);
  if (fields.length > 1) {
    minutes += parseInt(fields[1]);
  }
  return minutes;
};

export const minutesFromMidnight = function (dateTimeStr) {
  let fields = dateTimeStr.split("T");
  return timeStringToMinutes(fields[1]);
};

export const justTimePart = function (timeStr) {
  let fields = timeStr.split("T");
  if (fields && fields.length > 1) {
    fields = fields[1].split("-");
    if (fields) {
      return fields[0];
    }
  }
  return "not parsed: " + timeStr;
};

export const minutesFromMillis = function (millis) {
  return millis / (1000 * 60);
};

export const minutesFromNow = function (timeStr, now) {
  const aTime = Date.parse(timeStr);
  let ms = aTime - now;
  return Math.floor(minutesFromMillis(ms));
};
