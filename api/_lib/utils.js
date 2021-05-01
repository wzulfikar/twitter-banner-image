import fetch from "node-fetch";
import format from "date-fns/format";
import openWeatherIcons from "./openWeatherIcons";

function getTime(tz) {
  const datetime = new Date().toLocaleString("en-GB", { timeZone: tz }); // Example: 29/04/2021, 03:27:08
  const time = datetime.substr(-8).substr(0, 5).replace(":", ".");
  return time;
}

function getDay(tz) {
  return format(new Date(), "iii", { timeZone: tz });
}

async function getWeatherIcon(city) {
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

async function getGlobalCovidCount() {
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

export async function getImageUrl(country1, country2) {
  const [data1, data2, globalCovidCount] = await Promise.all([
    (async () => ({
      time: getTime(country1.timezone),
      day: getDay(country1.timezone),
      flag: country1.flag,
      weather: await getWeatherIcon(country1.weather),
    }))(),
    (async () => ({
      time: getTime(country2.timezone),
      day: getDay(country2.timezone),
      flag: country2.flag,
      weather: await getWeatherIcon(country2.weather),
    }))(),
    getGlobalCovidCount(),
  ]);

  // Remove space from weather emoji (if any)
  data1.weather = data1.weather.replace(" ", "");
  data2.weather = data1.weather.replace(" ", "");

  const renderDay = (day) =>
    `<span style="font-size: 2.3rem; padding-left: 2px;">(${day})</span>`;

  const renderCovidCount = (count) =>
    `<span style="font-size: 4rem;">Global Covid Count: <u style="color: orange;">${count.toLocaleString(
      "en-US"
    )}</u><span>`;

  const content = [
    // Main content
    `**Time is**<br/>`,
    `${data1.flag}${data1.weather} ${data1.time}${renderDay(data1.day)}<br/>`,
    `${data2.flag}${data2.weather} ${data2.time}${renderDay(data2.day)}<br/>`,

    // Sub content
    renderCovidCount(globalCovidCount),
  ];

  const encodeContent = encodeURIComponent(content.join(""));

  return {
    imageUrl: `https://og-image.wzulfikar.com/i/${encodeContent}.png?theme=dark&md=1&fontSize=100px&images=NO_IMAGE`,
    payload: {
      country1: {
        ...country1,
        ...data1,
      },
      country2: {
        ...country1,
        ...data2,
      },
    },
  };
}

// Fetch image as buffer and convert to base64
export async function getImageBase64(imageUrl) {
  return fetch(imageUrl)
    .then((resp) => resp.buffer())
    .then((buffer) => buffer.toString("base64"));
}
