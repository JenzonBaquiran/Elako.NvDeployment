function extractLocationFromMapsUrl(googleMapsUrl) {
  if (!googleMapsUrl) return [];
  try {
    const decodedUrl = decodeURIComponent(googleMapsUrl);
    console.log("Decoded URL:", decodedUrl);

    const locations = [];

    // Look for place names in the URL (after !2s or similar patterns)
    const placeMatches = decodedUrl.match(/!2s([^!]+)/g);
    console.log("Place matches:", placeMatches);

    if (placeMatches) {
      placeMatches.forEach((match) => {
        const placeName = match.replace("!2s", "").trim();
        if (placeName && placeName.length > 2) {
          locations.push(placeName);
        }
      });
    }

    return [...new Set(locations)];
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

const testUrl =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6545.6975280713095!2d121.15579890000001!3d16.485867799999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x339045197072be39%3A0x36c8bd2ce72fd0f9!2sMERCANCIA%20BARATA-%20Main%20(Bayombong%20branch)!5e1!3m2!1sfil!2sph!4v1761022128854!5m2!1sfil!2sph";

console.log("Testing location extraction with Mercancia Barata URL...");
console.log("Extracted locations:", extractLocationFromMapsUrl(testUrl));
