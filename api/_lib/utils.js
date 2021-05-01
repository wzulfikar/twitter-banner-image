import fetch from "node-fetch";
import format from "date-fns/format";

import openWeatherIcons from "./openWeatherIcons";

export function getTime(tz) {
  const datetime = new Date().toLocaleString("en-GB", { timeZone: tz }); // Example: 29/04/2021, 03:27:08
  const time = datetime.substr(-8).substr(0, 5).replace(":", ".");
  return time;
}

export function getDay(tz) {
  const localTime = new Date().toLocaleString("en-GB", { timeZone: tz });
  const [date, month, year] = localTime.split(" ")[0].split("/");
  return format(
    new Date(parseInt(year), parseInt(month) - 1, parseInt(date)),
    "iii"
  );
}

export async function getWeatherIcon(city) {
  const apiKey = process.env.OPENWEATHER_API;

  const data = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
  ).then((res) => res.json());

  const emoji = openWeatherIcons[data.weather[0].icon];

  console.log(`[INFO] weather in ${city}:`, {
    ...data.weather[0],
    emoji: emoji,
  });

  return emoji;
}

export async function getGlobalCovidCount() {
  try {
    // Use JHU data from https://github.com/mathdroid/covid-19-api
    const data = await fetch("https://covid19.mathdro.id/api").then((res) =>
      res.json()
    );
    return data.confirmed.value;
  } catch (e) {
    console.log("[ERROR] utils.getGlobalCovidCount failed:", e.message);
    return null;
  }
}
