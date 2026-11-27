// Small hand-drawn style diagrams for the "how it works" page (inline SVG, no images).
const ink = '#22294a';
const soft = '#b9b2a6';
const C = ['#e4572e', '#f3a712', '#669bbc', '#a8c686', '#d1495b', '#29335c'];

const defs = (id) =>
  `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="${ink}"/></marker></defs>`;

const wave = (x, y, n = 3, r = 14) =>
  Array.from({ length: n }, (_, i) => `<path d="M${x + i * 12} ${y - r - i * 8} a ${r + i * 8} ${r + i * 8} 0 0 1 0 ${2 * (r + i * 8)}" fill="none" stroke="${ink}" stroke-width="1.6" opacity="${1 - i * 0.25}"/>`).join('');

const speaker = (x, y) =>
  `<g><rect x="${x - 16}" y="${y - 26}" width="32" height="52" rx="6" fill="${ink}"/><circle cx="${x}" cy="${y - 10}" r="6" fill="#f7f3ec"/><circle cx="${x}" cy="${y + 10}" r="9" fill="#f7f3ec"/></g>`;

const label = (x, y, text, anchor = 'middle') =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Commissioner, sans-serif" font-size="13" fill="${ink}" opacity=".75">${text}</text>`;

export const figures = {
  reflection: `<svg viewBox="0 0 560 320" role="img" aria-label="Sound reflecting off a hard wall">
    ${defs('a1')}
    <rect x="470" y="30" width="26" height="260" fill="${soft}"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<line x1="470" y1="${40 + i * 26}" x2="496" y2="${30 + i * 26}" stroke="#a39b8e" stroke-width="1"/>`).join('')}
    ${speaker(80, 160)}
    ${wave(108, 160)}
    <path d="M150 120 L466 160" stroke="${ink}" stroke-width="2.4" marker-end="url(#a1)" fill="none"/>
    <path d="M466 164 L150 214" stroke="${C[0]}" stroke-width="2.4" marker-end="url(#a1)" fill="none"/>
    <path d="M466 172 L230 268" stroke="${C[0]}" stroke-width="1.4" stroke-dasharray="5 5" fill="none" opacity=".6"/>
  </svg>`,

  absorption: `<svg viewBox="0 0 560 320" role="img" aria-label="Sound entering a soft absorber panel and losing energy">
    ${defs('a2')}
    <rect x="470" y="30" width="26" height="260" fill="${soft}"/>
    <rect x="420" y="70" width="50" height="180" rx="4" fill="${C[1]}" opacity=".9"/>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M424 ${82 + i * 14} q 10 -6 20 0 t 20 0" stroke="#fff" stroke-width="1.4" fill="none" opacity=".7"/>`).join('')}
    ${speaker(80, 160)}
    ${wave(108, 160)}
    <path d="M150 120 L416 154" stroke="${ink}" stroke-width="2.4" marker-end="url(#a2)" fill="none"/>
    <path d="M418 170 L250 196" stroke="${ink}" stroke-width="1.2" stroke-dasharray="3 6" marker-end="url(#a2)" fill="none" opacity=".45"/>
    ${[0, 1, 2].map((i) => `<path d="M${436 + i * 12} 52 q 5 -8 0 -16 q -5 -8 0 -16" stroke="${C[0]}" stroke-width="1.6" fill="none" opacity=".8"/>`).join('')}
  </svg>`,

  diffusion: `<svg viewBox="0 0 560 320" role="img" aria-label="Sound scattering in many directions from a diffuser">
    ${defs('a3')}
    <rect x="490" y="30" width="26" height="260" fill="${soft}"/>
    ${[3, 1, 5, 2, 6, 4, 1, 3, 5, 2, 4, 6, 2]
      .map((d, i) => `<rect x="${490 - d * 9}" y="${44 + i * 18}" width="${d * 9}" height="17" fill="${C[(d + i) % C.length]}"/>`)
      .join('')}
    ${speaker(80, 160)}
    ${wave(108, 160)}
    <path d="M150 140 L428 158" stroke="${ink}" stroke-width="2.4" marker-end="url(#a3)" fill="none"/>
    ${[-62, -38, -16, 6, 28, 50, 70]
      .map((a, i) => {
        const r = 150 + (i % 3) * 20;
        const rad = (Math.PI / 180) * (180 + a);
        return `<path d="M430 162 L${(430 + r * Math.cos(rad)).toFixed(1)} ${(162 + r * Math.sin(rad)).toFixed(1)}" stroke="${C[i % C.length]}" stroke-width="1.6" marker-end="url(#a3)" fill="none" opacity=".9"/>`;
      })
      .join('')}
  </svg>`,

  room: `<svg viewBox="0 0 560 320" role="img" aria-label="Room plan: diffuser on the back wall, absorbers on the side walls, bass traps in the corners">
    <rect x="60" y="30" width="440" height="260" rx="6" fill="none" stroke="${ink}" stroke-width="3"/>
    ${[[62, 32, 1, 1], [498, 32, -1, 1], [62, 288, 1, -1], [498, 288, -1, -1]]
      .map(([x, y, sx, sy]) => `<path d="M${x} ${y} h${sx * 44} L${x} ${y + sy * 44} z" fill="${C[5]}" opacity=".85"/>`)
      .join('')}
    ${speaker(200, 80)}${speaker(360, 80)}
    <circle cx="280" cy="200" r="16" fill="${C[0]}"/><path d="M268 196 q12 -14 24 0" fill="none" stroke="#fff" stroke-width="2"/>
    <rect x="62" y="110" width="14" height="70" fill="${C[1]}"/>
    <rect x="484" y="110" width="14" height="70" fill="${C[1]}"/>
    ${[3, 1, 4, 2, 5, 3, 1, 4, 2, 5, 3, 2, 4]
      .map((d, i) => `<rect x="${190 + i * 14}" y="${288 - d * 4}" width="13" height="${d * 4}" fill="${C[(d + i) % C.length]}"/>`)
      .join('')}
    <path d="M200 106 L70 145 L270 192" fill="none" stroke="${ink}" stroke-dasharray="4 5" opacity=".5"/>
    <path d="M360 106 L490 145 L290 192" fill="none" stroke="${ink}" stroke-dasharray="4 5" opacity=".5"/>
    ${label(110, 102, 'absorber')}
    ${label(450, 102, 'absorber')}
    ${label(280, 254, 'diffuser')}
    ${label(112, 52, 'bass trap', 'start')}
    ${label(448, 52, 'bass trap', 'end')}
  </svg>`,
};
