import country from "./_lib/country";
import twitter from "./_lib/twitter";
import { getImageUrl, getImageBase64 } from "./_lib/utils";

function sendImage(res, buffer) {
  res.statusCode = 200;
  res.setHeader("Content-Type", `image/png`);
  res.setHeader(
    "Cache-Control",
    `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`
  );
  res.end(buffer);
}

export default async function handler(req, res) {
  try {
    const imageUrl = await getImageUrl(country.finland, country.indonesia);
    const base64Banner = await getImageBase64(imageUrl);

    const { preview } = req.query;
    if (preview === "true") {
      sendImage(res, Buffer.from(base64Banner, "base64"));
    } else {
      await twitter.accountsAndUsers.accountUpdateProfileBanner({
        banner: base64Banner,
      });
      console.log("[INFO] banner updated:", imageUrl);
      res.send({ ok: true });
    }
  } catch (e) {
    console.error("[ERROR] can't update twitter profile:", e);
    res.statusCode = 500;
    res.send({ ok: false, msg: "check logs for error message" });
  }
}
