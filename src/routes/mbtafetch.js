/*
  Note that mbtakey.js is not tracked by git.
  * Get a working MBTA key here: https://api-v3.mbta.com/portal
  * Create mbtakey.js file containing:
     export const theMBTAKey = "(key you got from MBTA here)";
  */
import { theMBTAKey } from "./mbtakey.js";

function makeMbtaHeaders(lastMod = null) {
  let mbtaHeaders = { "X-API-Key": theMBTAKey };
  if (lastMod) {
    mbtaHeaders["If-Modified-Since"] = lastMod;
  }
  return mbtaHeaders;
}

function makeFetchOptions(lastMod = null) {
  return { headers: makeMbtaHeaders(lastMod) };
}

export const mbtaFetch = async function (url, lastMod = null) {
  const fetchOptions = makeFetchOptions(lastMod);
  const response = await fetch(url, fetchOptions);
  return response;
};
