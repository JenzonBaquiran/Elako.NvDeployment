/**
 * Utility functions for handling customer names and privacy
 */

/**
 * Masks a customer's full name for privacy protection
 * Examples:
 * "Nicolai Dela Pena" -> "N**o*a"
 * "Syd Galindo" -> "S*d G****o"
 * "Arjanelle Agustin" -> "A****e A****n"
 * "John Doe" -> "J**n D*e"
 * "Maria" -> "M***a"
 *
 * @param {string} fullName - The full name to mask
 * @returns {string} - The masked name
 */
function maskCustomerName(fullName) {
  if (!fullName || typeof fullName !== "string") {
    return "Anonymous";
  }

  const trimmedName = fullName.trim();
  if (trimmedName.length === 0) {
    return "Anonymous";
  }

  // Split name into parts (first, middle, last names)
  const nameParts = trimmedName.split(/\s+/);

  if (nameParts.length === 0) {
    return "Anonymous";
  }

  // Function to mask a single name part
  function maskNamePart(name) {
    if (!name || name.length === 0) return "";
    if (name.length === 1) return name;
    if (name.length === 2) return name[0] + "*";
    if (name.length === 3) return name[0] + "*" + name[name.length - 1];

    // For names longer than 3 characters
    const firstChar = name[0];
    const lastChar = name[name.length - 1];
    const middleLength = name.length - 2;
    const asterisks = "*".repeat(middleLength);

    return firstChar + asterisks + lastChar;
  }

  // Handle single name (first name only)
  if (nameParts.length === 1) {
    return maskNamePart(nameParts[0]);
  }

  // Handle multiple names - mask each part separately
  const maskedParts = nameParts.map((part) => maskNamePart(part));

  // For very long names, show only first and last parts
  if (maskedParts.length > 3) {
    return maskedParts[0] + " " + maskedParts[maskedParts.length - 1];
  }

  // For 2-3 names, show all parts
  return maskedParts.join(" ");
}

/**
 * Masks customer name from customer object
 * @param {Object} customer - Customer object with firstname and lastname
 * @returns {string} - Masked full name
 */
function maskCustomerFromObject(customer) {
  if (!customer) {
    return "Anonymous";
  }

  const firstname = customer.firstname || "";
  const lastname = customer.lastname || "";
  const fullName = `${firstname} ${lastname}`.trim();

  return maskCustomerName(fullName);
}

/**
 * Gets the first letter of a masked name for avatar display
 * @param {string} maskedName - The masked name
 * @returns {string} - First letter for avatar
 */
function getAvatarLetter(maskedName) {
  if (!maskedName || maskedName === "Anonymous") {
    return "A";
  }
  return maskedName.charAt(0).toUpperCase();
}

module.exports = {
  maskCustomerName,
  maskCustomerFromObject,
  getAvatarLetter,
};
