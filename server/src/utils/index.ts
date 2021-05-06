export function range(min: number, max: number, value: number) {
  return Math.max(min, Math.min(max, value));
}

export function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export function abbreviate(str: string, length: number) {
  let abbreviation = '';
  for (const word of str.split(' ')) {
    if (word.length + abbreviation.length >= length - 3) {
      break;
    }
    abbreviation += word + ' ';
  }

  abbreviation = abbreviation.replace(/(\s*,?\s*)*$/, '');

  return abbreviation + (abbreviation.endsWith('.') ? '' : '...');
}
