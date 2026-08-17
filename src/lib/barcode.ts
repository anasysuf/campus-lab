// Code 128-B Barcode SVG Generator (Zero Dependency, Lightweight, High Precision)

const CODE128_PATTERNS: { [key: number]: string } = {
  0: '212222', 1: '222122', 2: '222221', 3: '121223', 4: '121322',
  5: '131222', 6: '122213', 7: '122312', 8: '132212', 9: '221213',
  10: '221312', 11: '231212', 12: '112232', 13: '122132', 14: '122231',
  15: '113222', 16: '123122', 17: '123221', 18: '223211', 19: '221132',
  20: '221231', 21: '213212', 22: '223112', 23: '312131', 24: '311222',
  25: '321122', 26: '321221', 27: '312212', 28: '322112', 29: '322211',
  30: '212123', 31: '212321', 32: '232121', 33: '111323', 34: '131123',
  35: '131321', 36: '112313', 37: '132113', 38: '132311', 39: '211313',
  40: '231113', 41: '231311', 42: '112133', 43: '112331', 44: '132131',
  45: '113123', 46: '113321', 47: '133121', 48: '313121', 49: '211331',
  50: '231131', 51: '213113', 52: '213311', 53: '213131', 54: '311123',
  55: '311321', 56: '331121', 57: '312113', 58: '312311', 59: '332111',
  60: '314111', 61: '221411', 62: '431111', 63: '111224', 64: '111422',
  65: '121124', 66: '121421', 67: '141122', 68: '141221', 69: '112214',
  70: '112412', 71: '122114', 72: '122411', 73: '142112', 74: '142211',
  75: '241211', 76: '221114', 77: '413111', 78: '241112', 79: '134111',
  80: '111242', 81: '121142', 82: '121241', 83: '114212', 84: '124112',
  85: '124211', 86: '411212', 87: '421112', 88: '421211', 89: '212141',
  90: '214121', 91: '412121', 92: '111143', 93: '111341', 94: '131141',
  95: '114113', 96: '114311', 97: '411113', 98: '411311', 99: '113141',
  100: '114131', 101: '311141', 102: '411131', 103: '211412', 104: '211214',
  105: '211232', 106: '2331112',
};

const START_B = 104;
const STOP = 106;

export function generateBarcodeSVG(text: string, height: number = 60, barWidth: number = 2): string {
  if (!text) return '';
  const cleanText = text.trim();
  const codes: number[] = [START_B];

  for (let i = 0; i < cleanText.length; i++) {
    const charCode = cleanText.charCodeAt(i);
    const value = charCode - 32;
    if (value >= 0 && value <= 95) {
      codes.push(value);
    }
  }

  // Calculate checksum
  let checksum = codes[0];
  for (let i = 1; i < codes.length; i++) {
    checksum += codes[i] * i;
  }
  codes.push(checksum % 103);
  codes.push(STOP);

  // Convert codes to widths
  let pattern = '';
  for (const code of codes) {
    pattern += CODE128_PATTERNS[code] || '';
  }

  let totalModules = 0;
  for (let i = 0; i < pattern.length; i++) {
    totalModules += parseInt(pattern[i], 10);
  }

  const quietZone = 10 * barWidth;
  const svgWidth = totalModules * barWidth + quietZone * 2;
  const svgHeight = height;

  let currentX = quietZone;
  let rects = '';
  let isBar = true;

  for (let i = 0; i < pattern.length; i++) {
    const width = parseInt(pattern[i], 10) * barWidth;
    if (isBar) {
      rects += `<rect x="${currentX}" y="0" width="${width}" height="${svgHeight}" fill="#0f172a" />`;
    }
    currentX += width;
    isBar = !isBar;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight + 20}" width="100%" height="100%">
    ${rects}
    <text x="${svgWidth / 2}" y="${svgHeight + 15}" font-family="monospace" font-size="12" font-weight="bold" fill="#334155" text-anchor="middle">${cleanText}</text>
  </svg>`;
}

export function generateAutoAssetCode(category: string, existingCount: number = 0): string {
  const catPrefixMap: { [key: string]: string } = {
    'Electronics & IoT': 'EL',
    'Computer & Network': 'NET',
    'Robotics & AI': 'ROB',
    'Multimedia & VR': 'MM',
    'Special Education Tools': 'PLB',
    'General Lab Tools': 'GEN',
  };

  const prefix = catPrefixMap[category] || 'LAB';
  const year = new Date().getFullYear();
  const seq = String(existingCount + 1).padStart(3, '0');
  const randomSalt = Math.floor(10 + Math.random() * 90);

  return `LAB-${prefix}-${year}-${seq}${randomSalt}`;
}
