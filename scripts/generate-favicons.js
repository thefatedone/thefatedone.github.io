#!/usr/bin/env node
/**
 * generate-favicons.js
 *
 * Generates all PNG favicon variants from favicon.svg so the site
 * works correctly across every browser/device (legacy tabs, retina
 * tabs, Windows tiles, iOS home screen, Android home screen, PWA).
 *
 * Usage:
 *   node scripts/generate-favicons.js
 *
 * Requires `sharp` (npm install sharp).
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const SVG_PATH = path.join(ROOT, 'favicon.svg');

const SIZES = [
    { size: 16,  out: 'favicon-16x16.png' },
    { size: 32,  out: 'favicon-32x32.png' },
    { size: 48,  out: 'favicon-48x48.png' },
    { size: 64,  out: 'favicon-64x64.png' },
    { size: 96,  out: 'favicon-96x96.png' },
    { size: 180, out: 'apple-touch-icon.png' },
    { size: 192, out: 'android-chrome-192x192.png' },
    { size: 512, out: 'android-chrome-512x512.png' },
];

async function main() {
    if (!fs.existsSync(SVG_PATH)) {
        console.error(`SVG not found: ${SVG_PATH}`);
        process.exit(1);
    }

    const svg = fs.readFileSync(SVG_PATH);

    console.log(`Source: ${SVG_PATH}`);
    console.log(`Size:   ${svg.length} bytes`);
    console.log('');

    for (const { size, out } of SIZES) {
        const outPath = path.join(ROOT, out);
        await sharp(svg, { density: 384 }) // high density for crisp rendering
            .resize(size, size, {
                fit: 'contain',
                background: { r: 10, g: 25, b: 47, alpha: 0 },
            })
            .png({ compressionLevel: 9, quality: 95 })
            .toFile(outPath);
        const stats = fs.statSync(outPath);
        console.log(`  ${out.padEnd(32)} ${size}x${size}  (${stats.size} bytes)`);
    }

    console.log('');
    console.log('Done.');
}

main().catch((err) => {
    console.error('Failed to generate favicons:', err);
    process.exit(1);
});
