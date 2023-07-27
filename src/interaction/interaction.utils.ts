export function capitalizeWord(word: string) {
  return word.charAt(0).toLocaleUpperCase().concat(word.slice(1));
}
