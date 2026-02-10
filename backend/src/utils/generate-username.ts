import {
  uniqueUsernameGenerator,
  adjectives,
  nouns,
} from 'unique-username-generator';

// Filter to only single, alphabetic words (no hyphens, spaces, etc.)
const safeAdjectives = adjectives.filter((w) => /^[a-zA-Z]+$/.test(w));
const safeNouns = nouns.filter((w) => /^[a-zA-Z]+$/.test(w));

export function generateRandomUsername(): string {
  return uniqueUsernameGenerator({
    dictionaries: [safeAdjectives, safeNouns],
    separator: '_',
    randomDigits: 4,
    length: 50,
  });
}
