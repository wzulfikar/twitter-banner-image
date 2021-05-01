import dedent from "dedent";
import { getTime, getDay, getWeather, getGlobalCovidCount } from "./utils";

export default async function getImageUrl(country1, country2) {
  const [data1, data2, globalCovidCount] = await Promise.all([
    (async () => ({
      time: getTime(country1.timezone),
      day: getDay(country1.timezone),
      flag: country1.flag,
      weather: await getWeather(country1.weather),
    }))(),
    (async () => ({
      time: getTime(country2.timezone),
      day: getDay(country2.timezone),
      flag: country2.flag,
      weather: await getWeather(country2.weather),
    }))(),
    getGlobalCovidCount(),
  ]);

  // Remove space from weather icon (if any)
  data1.weather.icon = data1.weather.icon.replace(" ", "");
  data2.weather.icon = data2.weather.icon.replace(" ", "");

  const renderTime = ({ flag, weatherIcon, time }) =>
    dedent`
      <div>${flag}${weatherIcon}<span style="padding-left: 8px;">${time}</span></div>
    `;

  const renderDay = (day, celcius) =>
    dedent`
      <div style="margin-bottom: 10px; display: flex; flex-direction: column; text-align: left; font-size: 2.3rem; padding-left: 0.2em;">
        <span>${day}</span>
        <span>${celcius}°C</span>
      </div>
    `;

  const renderCountryData = (data) =>
    dedent`
      <div style="display: flex; justify-content: center; align-items: flex-end;">
        ${renderTime({ ...data, weatherIcon: data.weather.icon })}
        ${renderDay(data.day, data.weather.celcius)}
      </div>
    `;

  const renderCovidCount = (count) =>
    dedent`
      <span style="font-size: 4rem;">
        Global Covid Count: <u style="color: orange;">${count.toLocaleString(
          "en-US"
        )}</u>
      <span>
    `;

  // Create content (supports markdown)
  const content = [
    // Main content
    `<div><b>Time is</b></div>`,
    renderCountryData(data1),
    renderCountryData(data2),

    // Sub content
    renderCovidCount(globalCovidCount),
  ]
    .join("")
    .replace(/\n\s*/g, "");

  const encodeContent = encodeURIComponent(content);

  return {
    imageUrl: `https://og-image.wzulfikar.com/i/${encodeContent}.png?theme=dark&md=1&fontSize=100px&images=NO_IMAGE`,
    payload: {
      country1: {
        ...country1,
        ...data1,
        content: content,
      },
      country2: {
        ...country2,
        ...data2,
        content: content,
      },
    },
  };
}
