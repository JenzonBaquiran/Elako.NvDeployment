/**
 * Google Maps URL Processor Utility
 * Automatically extracts clean embed URLs from iframe HTML code
 */

/**
 * Processes Google Maps input and extracts the embed URL
 * @param {string} input - The input string (can be iframe HTML or embed URL)
 * @returns {object} - Object with processed URL and processing info
 */
export const processGoogleMapsInput = (input) => {
  if (!input || typeof input !== "string") {
    return {
      url: "",
      wasProcessed: false,
      isValid: false,
      message: "",
    };
  }

  const trimmedInput = input.trim();

  // Check if input is already a clean Google Maps embed URL
  if (isValidGoogleMapsEmbedUrl(trimmedInput)) {
    return {
      url: trimmedInput,
      wasProcessed: false,
      isValid: true,
      message: "Valid Google Maps embed URL",
    };
  }

  // Check if input contains iframe HTML
  if (trimmedInput.includes("<iframe") && trimmedInput.includes("src=")) {
    const extractedUrl = extractUrlFromIframe(trimmedInput);

    if (extractedUrl && isValidGoogleMapsEmbedUrl(extractedUrl)) {
      return {
        url: extractedUrl,
        wasProcessed: true,
        isValid: true,
        message: "Iframe HTML processed - extracted embed URL",
      };
    } else {
      return {
        url: "",
        wasProcessed: false,
        isValid: false,
        message: "Could not extract valid Google Maps URL from iframe",
      };
    }
  }

  // Input doesn't match expected patterns
  return {
    url: trimmedInput,
    wasProcessed: false,
    isValid: false,
    message: "Please provide a Google Maps embed URL or iframe HTML",
  };
};

/**
 * Extracts the src URL from iframe HTML
 * @param {string} iframeHtml - The iframe HTML string
 * @returns {string|null} - The extracted URL or null if not found
 */
const extractUrlFromIframe = (iframeHtml) => {
  try {
    // Look for src attribute in various formats
    const patterns = [
      /src="([^"]+)"/i, // src="url"
      /src='([^']+)'/i, // src='url'
      /src=([^\s>]+)/i, // src=url (without quotes)
    ];

    for (const pattern of patterns) {
      const match = iframeHtml.match(pattern);
      if (match && match[1]) {
        // Decode HTML entities if present
        return decodeHtmlEntities(match[1]);
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting URL from iframe:", error);
    return null;
  }
};

/**
 * Validates if a URL is a valid Google Maps embed URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid Google Maps embed URL
 */
const isValidGoogleMapsEmbedUrl = (url) => {
  try {
    const urlObj = new URL(url);

    // Check if it's a Google Maps domain
    const validDomains = ["www.google.com", "maps.google.com"];
    if (!validDomains.includes(urlObj.hostname)) {
      return false;
    }

    // Check if it's an embed URL
    const isEmbedPath = urlObj.pathname.includes("/maps/embed");
    const hasEmbedParams = urlObj.search.includes("pb=");

    return isEmbedPath || hasEmbedParams;
  } catch (error) {
    return false;
  }
};

/**
 * Decodes HTML entities in a string
 * @param {string} str - String that may contain HTML entities
 * @returns {string} - Decoded string
 */
const decodeHtmlEntities = (str) => {
  const entities = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&#x27;": "'",
  };

  return str.replace(/&[#\w]+;/g, (entity) => {
    return entities[entity] || entity;
  });
};

/**
 * Provides user-friendly feedback messages
 * @param {object} processResult - Result from processGoogleMapsInput
 * @returns {object} - User feedback object
 */
export const getProcessingFeedback = (processResult) => {
  if (!processResult.isValid) {
    return {
      type: "error",
      title: "Invalid Input",
      message:
        "Please provide a valid Google Maps embed URL or iframe HTML code.",
      showHelp: true,
    };
  }

  if (processResult.wasProcessed) {
    return {
      type: "success",
      title: "Iframe Processed",
      message: "Successfully extracted Google Maps embed URL from iframe code.",
      showHelp: false,
    };
  }

  return {
    type: "success",
    title: "Valid URL",
    message: "Google Maps embed URL is valid and ready to use.",
    showHelp: false,
  };
};

export default {
  processGoogleMapsInput,
  getProcessingFeedback,
};
