const fetch = require("node-fetch");
const { TwitterClient } = require("twitter-api-client");

const twitterClient = new TwitterClient({
  apiKey: process.env.TWITTER_API_KEY,
  apiSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

function getTime(tz) {
  const datetime = new Date().toLocaleString("en-GB", { timeZone: tz }); // Example: 29/04/2021, 03:27:08
  const time = datetime.substr(-8).substr(0, 5).replace(":", ".");
  return time;
}

function getImageUrl(tz1, tz2) {
  const wibTime = getTime("Asia/Jakarta");
  const helsinkiTime = getTime("Europe/Helsinki");

  return `https://og-image.wzulfikar.com/i/**Time%20is**%3Cbr%2F%3E%F0%9F%87%AB%F0%9F%87%AE%20${helsinkiTime}%3Cbr%2F%3E%F0%9F%87%AE%F0%9F%87%A9%20${wibTime}.png?theme=dark&md=1&fontSize=100px&images=NO_IMAGE`;
}

// Fetch image as buffer and convert to base64
async function getImageBase64(imageUrl) {
  return fetch(imageUrl)
    .then((resp) => resp.buffer())
    .then((buffer) => buffer.toString("base64"));
}

export default async function handler(req, res) {
  try {
    const imageUrl = getImageUrl();
    const base64Banner = await getImageBase64(imageUrl);
    await twitterClient.accountsAndUsers.accountUpdateProfileBanner({
      banner: base64Banner,
    });
    console.log("[INFO] banner updated:", imageUrl);
  } catch (e) {
    console.error("[ERROR] can't update twitter profile:", e);
  }
  res.send("ok");
}
