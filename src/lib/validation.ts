const LETTERS_ONLY = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' ]+$/;
const DIGITS_ONLY = /^\d+$/;

export function onlyLetters(value: string): boolean {
  return LETTERS_ONLY.test(value.trim());
}

export function onlyDigits(value: string): boolean {
  return DIGITS_ONLY.test(value.trim());
}

export function normalizeFullName(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toUpperCase();
}

export function normalizeSentence(value: string): string {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed
    .toLowerCase()
    .replace(/(^|[.;:!?]\s*)([a-záéíóúüñ])/g, (match, separator, letter) => separator + letter.toUpperCase());
}