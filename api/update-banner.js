import country from "./_lib/country";
import twitter from "./_lib/twitter";
import { getImageUrl, getImageBase64 } from "./_lib/utils";

export default async function handler(req, res) {
  try {
    const imageUrl = await getImageUrl(country.finland, country.indonesia);
    const base64Banner = await getImageBase64(imageUrl);
    await twitter.accountsAndUsers.accountUpdateProfileBanner({
      banner: base64Banner,
    });
    console.log("[INFO] banner updated:", imageUrl);
  } catch (e) {
    console.error("[ERROR] can't update twitter profile:", e);
  }
  res.send("ok");
}
