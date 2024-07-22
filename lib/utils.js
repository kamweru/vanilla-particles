export const getRandomFromRange = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);
export const getRandomFloat = () => {
  return parseFloat((Math.random() * 2 - 1).toFixed(3));
};
export const range = (start, stop, step = 1) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

/**
 * Generates a random hexadecimal string of the specified length.
 * @param {number} n - The length of the string to generate.
 * @returns {string} - The generated hexadecimal string.
 */
export let uuid = (n = 8) => {
  // Define the possible characters to use
  const DIGITS = "0123456789";
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const ALPHABET_LOWERCASE = ALPHABET.toLocaleLowerCase();
  const ALPHANUMERIC = ALPHABET + ALPHABET_LOWERCASE + DIGITS;
  // Initialize an empty string to store the output
  let output = "";
  // Loop n times
  while (n--) {
    // Pick a random index from 0 to IDX - 1
    let index = Math.floor(Math.random() * ALPHANUMERIC.length);
    // Append the character at that index to the output
    output += ALPHANUMERIC[index];
  }
  // Return the output
  return output;
};

export const interpolate = (str, params) => {
  let names = Object.keys(params);
  let vals = Object.values(params);
  return new Function(...names, `return \`${str}\`;`)(...vals);
};
