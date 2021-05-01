import dedent from "dedent";
import { getTime, getDay, getWeatherIcon, getGlobalCovidCount } from "./utils";

export default async function getImageUrl(country1, country2) {
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
  data2.weather = data2.weather.replace(" ", "");

  const renderTime = ({ flag, weather, time }) => dedent`
      ${flag}${weather} ${time}
    `;

  const renderDay = (day) =>
    dedent`<div style="display: flex; flex-direction: column; font-size: 2.3rem; padding-left: 2px;">
        <span>${day}</span>
        <span>30°C</span>
      </div>`;

  const renderData = (data) => dedent`
      ${renderTime(data)}${renderDay(data1.day)}<br/>
    `;

  const renderCovidCount = (count) =>
    dedent`<span style="font-size: 4rem;">Global Covid Count: <u style="color: orange;">${count.toLocaleString(
      "en-US"
    )}</u><span>`;

  // Create markdown content
  const mdContent = [
    // Main content
    `**Time is**<br/>`,
    renderData(data1),
    renderData(data2),

    // Sub content
    renderCovidCount(globalCovidCount),
  ];

  const encodeContent = encodeURIComponent(mdContent.join(""));

  return {
    imageUrl: `https://og-image.wzulfikar.com/i/${encodeContent}.png?theme=dark&md=1&fontSize=100px&images=NO_IMAGE`,
    payload: {
      country1: {
        ...country1,
        ...data1,
        markdownContent: mdContent,
      },
      country2: {
        ...country2,
        ...data2,
        markdownContent: mdContent,
      },
    },
  };
}
