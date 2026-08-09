#!/usr/bin/env node
/**
 * generate-placeholder.js
 *
 * Creates a clean, minimalist placeholder profile PNG so the about
 * section renders correctly before the user adds their actual photo.
 * Run once via:
 *
 *   node scripts/generate-placeholder.js
 *
 * Requires `sharp`.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUTPUT = path.resolve(
    __dirname,
    '..',
    'assets',
    'images',
    'profile.png'
);

const SIZE = 600;

/* SVG placeholder — soft gradient circle with monogram */
const svg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
    <defs>
        <radialGradient id="g" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stop-color="#1f4068" />
            <stop offset="55%" stop-color="#16243d" />
            <stop offset="100%" stop-color="#0a192f" />
        </radialGradient>
    </defs>
    <rect width="${SIZE}" height="${SIZE}" fill="url(#g)" />
    <g fill="#64ffda" font-family="Inter, system-ui, sans-serif"
       font-weight="700" font-size="220" text-anchor="middle">
        <text x="50%" y="58%" dominant-baseline="middle">AP</text>
    </g>
</svg>
`);

async function main() {
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    await sharp(svg).png({ compressionLevel: 9 }).toFile(OUTPUT);
    console.log(`Wrote placeholder: ${OUTPUT}`);
}

main().catch((err) => {
    console.error('Failed to generate placeholder:', err);
    process.exit(1);
});
