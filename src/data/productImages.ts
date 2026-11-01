/**
 * Gera ilustrações vetoriais de estúdio (data:image/svg+xml) de alta definição
 * para garantir carregamento instantâneo, zero imagens quebradas e visual editorial coeso.
 */

function toSvgDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function createNotebookSvg(opts: {
  model: string;
  chip: string;
  gpu: string;
  screenSpec: string;
  chassisColor: string;
  accentColor: string;
  bgTone?: string;
}): string {
  const bg = opts.bgTone ?? "#f0eae0";
  const model = escapeXml(opts.model.slice(0, 22));
  const chip = escapeXml(opts.chip.slice(0, 34));
  const gpu = escapeXml(opts.gpu.slice(0, 30));
  const screenSpec = escapeXml(opts.screenSpec.slice(0, 36));

  return toSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 640" width="800" height="640">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fbf9f5"/>
      <stop offset="100%" stop-color="${bg}"/>
    </linearGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#14261f"/>
      <stop offset="55%" stop-color="#1e3a2f"/>
      <stop offset="100%" stop-color="#0f1d17"/>
    </linearGradient>
    <linearGradient id="chassis" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${opts.chassisColor}"/>
      <stop offset="50%" stop-color="#4a4e54"/>
      <stop offset="100%" stop-color="${opts.chassisColor}"/>
    </linearGradient>
    <filter id="shadow" x="-15%" y="-10%" width="130%" height="135%">
      <feDropShadow dx="0" dy="24" stdDeviation="22" flood-color="#14110e" flood-opacity="0.16"/>
    </filter>
  </defs>

  <rect width="800" height="640" fill="url(#bg)"/>
  <ellipse cx="400" cy="525" rx="310" ry="36" fill="#e2d9c8" opacity="0.65"/>

  <g filter="url(#shadow)">
    <rect x="170" y="110" width="460" height="300" rx="18" fill="#18181b" stroke="${opts.chassisColor}" stroke-width="4"/>
    <rect x="186" y="126" width="428" height="266" rx="8" fill="url(#screen)"/>

    <circle cx="520" cy="210" r="95" fill="${opts.accentColor}" opacity="0.22"/>
    <circle cx="290" cy="300" r="110" fill="#b87333" opacity="0.15"/>

    <text x="218" y="178" font-family="Georgia, serif" font-size="14" fill="#d4915a" letter-spacing="1.2">${chip.toUpperCase()}</text>
    <text x="218" y="218" font-family="Georgia, serif" font-size="28" font-weight="700" fill="#fbf9f5">${model}</text>
    <rect x="218" y="238" width="245" height="30" rx="6" fill="#ffffff" fill-opacity="0.1"/>
    <text x="230" y="258" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#f0eae0">${gpu}</text>
    <text x="218" y="356" font-family="system-ui, sans-serif" font-size="13" fill="#cbd5e1" opacity="0.85">${screenSpec}</text>

    <rect x="378" y="114" width="44" height="6" rx="3" fill="#27272a"/>
    <circle cx="400" cy="117" r="2" fill="#52525b"/>

    <path d="M 110 418 L 690 418 L 730 456 C 734 462, 728 470, 716 470 L 84 470 C 72 470, 66 462, 70 456 Z" fill="url(#chassis)"/>
    <rect x="74" y="464" width="652" height="10" rx="5" fill="#18181b" opacity="0.45"/>
    <rect x="195" y="426" width="410" height="4" rx="2" fill="${opts.accentColor}" opacity="0.75"/>
    <rect x="352" y="418" width="96" height="6" rx="3" fill="#18181b" opacity="0.45"/>
  </g>
</svg>
  `);
}

export function createSmartphoneSvg(opts: {
  model: string;
  chip: string;
  cameraSpec: string;
  screenSpec: string;
  bodyColor: string;
  accentColor: string;
}): string {
  const model = escapeXml(opts.model.slice(0, 18));
  const chip = escapeXml(opts.chip.slice(0, 24));
  const cameraSpec = escapeXml(opts.cameraSpec.slice(0, 22));
  const screenSpec = escapeXml(opts.screenSpec.slice(0, 26));

  return toSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 640" width="800" height="640">
  <defs>
    <linearGradient id="bgPhone" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fbf9f5"/>
      <stop offset="100%" stop-color="#ede5d8"/>
    </linearGradient>
    <linearGradient id="phoneScreen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e3a2f"/>
      <stop offset="100%" stop-color="#11221b"/>
    </linearGradient>
    <filter id="shadowPhone" x="-15%" y="-10%" width="130%" height="135%">
      <feDropShadow dx="0" dy="22" stdDeviation="20" flood-color="#14110e" flood-opacity="0.16"/>
    </filter>
  </defs>

  <rect width="800" height="640" fill="url(#bgPhone)"/>
  <ellipse cx="400" cy="545" rx="220" ry="28" fill="#dfd5c3" opacity="0.7"/>

  <g filter="url(#shadowPhone)">
    <rect x="210" y="105" width="205" height="410" rx="32" fill="${opts.bodyColor}" stroke="#d6cfc2" stroke-width="3"/>
    <rect x="232" y="128" width="76" height="122" rx="20" fill="#18181b" opacity="0.88"/>
    <circle cx="270" cy="156" r="16" fill="#09090b" stroke="${opts.accentColor}" stroke-width="2.5"/>
    <circle cx="270" cy="192" r="16" fill="#09090b" stroke="${opts.accentColor}" stroke-width="2.5"/>
    <circle cx="270" cy="226" r="13" fill="#09090b" stroke="#71717a" stroke-width="2"/>

    <rect x="370" y="85" width="215" height="430" rx="34" fill="#14110e" stroke="#3f3f46" stroke-width="4"/>
    <rect x="382" y="97" width="191" height="406" rx="26" fill="url(#phoneScreen)"/>
    <circle cx="477" cy="114" r="5" fill="#09090b"/>

    <circle cx="515" cy="215" r="70" fill="${opts.accentColor}" opacity="0.22"/>
    <text x="404" y="185" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#d4915a" letter-spacing="1.2">${chip.toUpperCase()}</text>
    <text x="404" y="216" font-family="Georgia, serif" font-size="21" font-weight="700" fill="#fbf9f5">${model}</text>
    <rect x="404" y="236" width="146" height="26" rx="6" fill="#ffffff" fill-opacity="0.1"/>
    <text x="414" y="253" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#f0eae0">${cameraSpec}</text>
    <text x="404" y="465" font-family="system-ui, sans-serif" font-size="12" fill="#cbd5e1">${screenSpec}</text>
  </g>
</svg>
  `);
}

export function createHeadphoneSvg(opts: {
  model: string;
  ancSpec: string;
  batterySpec: string;
  bodyColor: string;
  accentColor: string;
}): string {
  const model = escapeXml(opts.model.slice(0, 20));
  const ancSpec = escapeXml(opts.ancSpec.slice(0, 28));
  const batterySpec = escapeXml(opts.batterySpec.slice(0, 28));

  return toSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 640" width="800" height="640">
  <defs>
    <linearGradient id="bgAudio" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fbf9f5"/>
      <stop offset="100%" stop-color="#ede6da"/>
    </linearGradient>
    <filter id="shadowAudio" x="-15%" y="-10%" width="130%" height="135%">
      <feDropShadow dx="0" dy="22" stdDeviation="20" flood-color="#14110e" flood-opacity="0.16"/>
    </filter>
  </defs>

  <rect width="800" height="640" fill="url(#bgAudio)"/>
  <ellipse cx="400" cy="535" rx="230" ry="28" fill="#dfd5c3" opacity="0.65"/>

  <g filter="url(#shadowAudio)">
    <path d="M 245 310 C 245 130, 555 130, 555 310" fill="none" stroke="${opts.bodyColor}" stroke-width="34" stroke-linecap="round"/>
    <path d="M 265 290 C 265 155, 535 155, 535 290" fill="none" stroke="${opts.accentColor}" stroke-width="6" stroke-linecap="round" opacity="0.8"/>

    <rect x="233" y="295" width="24" height="60" rx="8" fill="#52525b"/>
    <rect x="543" y="295" width="24" height="60" rx="8" fill="#52525b"/>

    <ellipse cx="255" cy="395" rx="56" ry="82" fill="${opts.bodyColor}" stroke="${opts.accentColor}" stroke-width="3"/>
    <ellipse cx="275" cy="395" rx="28" ry="64" fill="#27272a"/>

    <ellipse cx="545" cy="395" rx="56" ry="82" fill="${opts.bodyColor}" stroke="${opts.accentColor}" stroke-width="3"/>
    <ellipse cx="525" cy="395" rx="28" ry="64" fill="#27272a"/>

    <rect x="275" y="245" width="250" height="110" rx="16" fill="#1e3a2f"/>
    <text x="400" y="280" text-anchor="middle" font-family="Georgia, serif" font-size="20" font-weight="700" fill="#fbf9f5">${model}</text>
    <text x="400" y="308" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#d4915a">${ancSpec}</text>
    <text x="400" y="334" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#e2e8f0">${batterySpec}</text>
  </g>
</svg>
  `);
}

export function createKeyboardSvg(opts: {
  model: string;
  switchSpec: string;
  connSpec: string;
  caseColor: string;
  keycapAccent: string;
}): string {
  const model = escapeXml(opts.model.slice(0, 24));
  const switchSpec = escapeXml(opts.switchSpec.slice(0, 22));
  const connSpec = escapeXml(opts.connSpec.slice(0, 18));

  return toSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 640" width="800" height="640">
  <defs>
    <linearGradient id="bgKb" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fbf9f5"/>
      <stop offset="100%" stop-color="#ede5d8"/>
    </linearGradient>
    <filter id="shadowKb" x="-15%" y="-10%" width="130%" height="135%">
      <feDropShadow dx="0" dy="22" stdDeviation="20" flood-color="#14110e" flood-opacity="0.16"/>
    </filter>
  </defs>

  <rect width="800" height="640" fill="url(#bgKb)"/>
  <ellipse cx="400" cy="495" rx="310" ry="30" fill="#dfd5c3" opacity="0.65"/>

  <g filter="url(#shadowKb)">
    <rect x="220" y="120" width="360" height="86" rx="14" fill="#1e3a2f"/>
    <text x="400" y="156" text-anchor="middle" font-family="Georgia, serif" font-size="21" font-weight="700" fill="#fbf9f5">${model}</text>
    <text x="400" y="184" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="#d4915a">${switchSpec} · ${connSpec}</text>

    <rect x="130" y="250" width="540" height="210" rx="20" fill="${opts.caseColor}" stroke="#3f3f46" stroke-width="3"/>
    <rect x="148" y="268" width="504" height="174" rx="12" fill="#18181b"/>

    <rect x="160" y="280" width="34" height="28" rx="5" fill="${opts.keycapAccent}"/>
    <rect x="202" y="280" width="32" height="28" rx="5" fill="#e4e4e7"/>
    <rect x="240" y="280" width="32" height="28" rx="5" fill="#e4e4e7"/>
    <rect x="278" y="280" width="32" height="28" rx="5" fill="#e4e4e7"/>
    <rect x="316" y="280" width="32" height="28" rx="5" fill="#e4e4e7"/>
    <rect x="360" y="280" width="32" height="28" rx="5" fill="#52525b"/>
    <rect x="398" y="280" width="32" height="28" rx="5" fill="#52525b"/>
    <rect x="436" y="280" width="32" height="28" rx="5" fill="#52525b"/>
    <rect x="474" y="280" width="32" height="28" rx="5" fill="#52525b"/>
    <rect x="518" y="280" width="32" height="28" rx="5" fill="#e4e4e7"/>
    <rect x="556" y="280" width="32" height="28" rx="5" fill="#e4e4e7"/>
    <circle cx="618" cy="294" r="15" fill="${opts.keycapAccent}" stroke="#fafafa" stroke-width="2"/>

    <rect x="160" y="316" width="474" height="28" rx="5" fill="#d4d4d8" opacity="0.9"/>
    <rect x="160" y="352" width="420" height="28" rx="5" fill="#d4d4d8" opacity="0.9"/>
    <rect x="588" y="352" width="46" height="28" rx="5" fill="${opts.keycapAccent}"/>
    <rect x="160" y="388" width="110" height="32" rx="5" fill="#52525b"/>
    <rect x="278" y="388" width="210" height="32" rx="5" fill="${opts.keycapAccent}"/>
    <rect x="496" y="388" width="138" height="32" rx="5" fill="#52525b"/>
  </g>
</svg>
  `);
}

export function createGenericStudioSvg(opts: {
  brand: string;
  model: string;
  highlight: string;
  specLine: string;
}): string {
  const brand = escapeXml(opts.brand.slice(0, 20));
  const model = escapeXml(opts.model.slice(0, 24));
  const highlight = escapeXml(opts.highlight.slice(0, 32));
  const specLine = escapeXml(opts.specLine.slice(0, 38));

  return toSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 640" width="800" height="640">
  <defs>
    <linearGradient id="bgGen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fbf9f5"/>
      <stop offset="100%" stop-color="#e9dfd0"/>
    </linearGradient>
    <linearGradient id="cardGen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e3a2f"/>
      <stop offset="100%" stop-color="#12241d"/>
    </linearGradient>
    <filter id="shadowGen" x="-15%" y="-10%" width="130%" height="135%">
      <feDropShadow dx="0" dy="24" stdDeviation="20" flood-color="#14110e" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="800" height="640" fill="url(#bgGen)"/>
  <ellipse cx="400" cy="520" rx="260" ry="30" fill="#d8cbb8" opacity="0.7"/>
  <g filter="url(#shadowGen)">
    <rect x="180" y="135" width="440" height="320" rx="24" fill="url(#cardGen)" stroke="#b87333" stroke-width="3"/>
    <circle cx="530" cy="220" r="80" fill="#b87333" opacity="0.2"/>
    <text x="225" y="205" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#d4915a" letter-spacing="1.6">${brand.toUpperCase()}</text>
    <text x="225" y="252" font-family="Georgia, serif" font-size="30" font-weight="700" fill="#fbf9f5">${model}</text>
    <rect x="225" y="278" width="290" height="34" rx="8" fill="#ffffff" fill-opacity="0.1"/>
    <text x="240" y="300" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#f0eae0">${highlight}</text>
    <text x="225" y="395" font-family="system-ui, sans-serif" font-size="14" fill="#cbd5e1">${specLine}</text>
  </g>
</svg>
  `);
}
