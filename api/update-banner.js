import country from "./_lib/country";
import twitter from "./_lib/twitter";
import getImageUrl from "./_lib/getImageUrl";
import getImageBase64 from "./_lib/getImageBase64";

const SECRET_TOKEN = process.env.SECRET_TOKEN;

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
    const { imageUrl, payload } = await getImageUrl(
      country.finland,
      country.indonesia
    );
    const base64Banner = await getImageBase64(imageUrl);

    const { preview, token, debug } = req.query;

    // Handle preview mode
    if (preview === "true") {
      sendImage(res, Buffer.from(base64Banner, "base64"));
      return;
    }

    // Handle debug mode
    if (debug === "true") {
      res.status(200).send({
        ok: true,
        msg: "debug mode enabled",
        data: {
          imageUrl,
          payload,
        },
      });
      return;
    }

    // Prevent unauthorized request so it doesn't trigger Twitter API call
    if (token !== SECRET_TOKEN) {
      res.status(400).send({ ok: false, msg: "bad request" });
      return;
    }

    // Happy path: actually update the twitter banner
    await twitter.accountsAndUsers.accountUpdateProfileBanner({
      banner: base64Banner,
    });
    console.log("[INFO] banner updated:", imageUrl);
    res.send({ ok: true, msg: "banner updated", image: imageUrl });
  } catch (e) {
    console.error("[ERROR] can't update twitter profile:", e);
    res.status(500).send({ ok: false, msg: "check logs for error message" });
  }
}
