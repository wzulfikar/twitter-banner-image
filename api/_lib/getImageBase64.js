import fetch from "node-fetch";

// Fetch image as buffer and convert to base64
export default async function getImageBase64(imageUrl) {
  return fetch(imageUrl)
    .then((resp) => resp.buffer())
    .then((buffer) => buffer.toString("base64"));
}
