const pairs = [
  ['dark body text', '#e8ddc3', '#0f0d0a'],
  ['dark secondary text', '#b5a888', '#0f0d0a'],
  ['light body text', '#1d1811', '#f1e4c8'],
  ['light secondary text', '#594b37', '#f1e4c8'],
  ['code text', '#ddd3ba', '#0b0908']
];

function channel(hex) {
  const value = parseInt(hex.slice(1), 16);
  return [value >> 16, (value >> 8) & 255, value & 255].map((part) => {
    const s = part / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
}
function luminance(hex) { const [r, g, b] = channel(hex); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
function ratio(foreground, background) { const a = luminance(foreground); const b = luminance(background); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); }

let failed = false;
for (const [label, foreground, background] of pairs) {
  const value = ratio(foreground, background);
  console.log(`${label}: ${value.toFixed(2)}:1`);
  if (value < 4.5) failed = true;
}
if (failed) { console.error('Contrast check failed: normal text must reach 4.5:1.'); process.exit(1); }
console.log('Contrast check passed: all checked normal-text pairs meet WCAG AA.');
