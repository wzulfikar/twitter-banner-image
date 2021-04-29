import fetch from "node-fetch";
import openWeatherIcons from "./openWeatherIcons";

function getTime(tz) {
  const datetime = new Date().toLocaleString("en-GB", { timeZone: tz }); // Example: 29/04/2021, 03:27:08
  const time = datetime.substr(-8).substr(0, 5).replace(":", ".");
  return time;
}

async function getWeatherIcon(city) {
  const apiKey = process.env.OPENWEATHER_API;

  const data = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
  ).then((res) => res.json());

  return openWeatherIcons[data.weather[0].icon];
}

export async function getImageUrl(country1, country2) {
  const [data1, data2] = await Promise.all([
    (async () => ({
      time: getTime(country1.timezone),
      emoji: encodeURIComponent(country1.flag),
      weather: await getWeatherIcon(country1.weather),
    }))(),
    (async () => ({
      time: getTime(country2.timezone),
      emoji: encodeURIComponent(country2.flag),
      weather: await getWeatherIcon(country2.weather),
    }))(),
  ]);

  return `https://og-image.wzulfikar.com/i/**Time%20is**%3Cbr%2F%3E${data1.emoji}${data1.weather}%20${data1.time}%3Cbr%2F%3E${data2.emoji}${data2.weather}%20${data2.time}.png?theme=dark&md=1&fontSize=100px&images=NO_IMAGE`;
}

// Fetch image as buffer and convert to base64
export async function getImageBase64(imageUrl) {
  return fetch(imageUrl)
    .then((resp) => resp.buffer())
    .then((buffer) => buffer.toString("base64"));
}
