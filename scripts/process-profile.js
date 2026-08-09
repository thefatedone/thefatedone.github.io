#!/usr/bin/env node
/**
 * process-profile.js
 *
 * Removes a (near-)white background from a source photo and writes a
 * transparent PNG to assets/images/profile.png — ready to use with the
 * portfolio's circular profile frame.
 *
 * Usage:
 *   node scripts/process-profile.js <input-image> [threshold]
 *
 * Examples:
 *   node scripts/process-profile.js ./photo.jpg
 *   node scripts/process-profile.js ./photo.jpg 18
 *
 * Requires `sharp` (npm install sharp).
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE = process.argv[2];
const THRESHOLD = Number(process.argv[3] ?? 22); // 0..255; higher = more aggressive
const OUTPUT = path.resolve(
    __dirname,
    '..',
    'assets',
    'images',
    'profile.png'
);

if (!SOURCE) {
    console.error('Usage: node scripts/process-profile.js <input-image> [threshold]');
    process.exit(1);
}

if (!fs.existsSync(SOURCE)) {
    console.error(`Source file not found: ${SOURCE}`);
    process.exit(1);
}

const removeNearWhiteBackground = (threshold) => {
    const channels = 4; // RGBA
    return (pixel) => {
        /* pixel: Buffer<Uint8> of length channels */
        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];

        /* Treat very light pixels as background. The min-channel rule keeps
           off-white (cream, beige, etc.) safe in skin tones. */
        const minChannel = Math.min(r, g, b);
        const bgCutoff = 255 - threshold;

        if (minChannel >= bgCutoff) {
            /* Linear fade based on brightness for softer edges:
               pure white -> alpha 0 (fully transparent),
               just inside cutoff -> alpha 255 (fully opaque). */
            const distance = minChannel - bgCutoff; // 0..threshold
            const fade = distance / threshold; // 0..1
            const alpha = Math.round((1 - fade) * 255);
            pixel[3] = alpha;
        } else {
            pixel[3] = 255;
        }
    };
};

async function main() {
    const sourcePath = path.resolve(SOURCE);
    const ext = path.extname(sourcePath).toLowerCase();

    console.log(`Reading:  ${sourcePath}`);
    console.log(`Threshold: ${THRESHOLD}`);

    let pipeline = sharp(sourcePath);

    /* Normalize format — sharp handles jpg/png/webp from the same call */
    pipeline = pipeline.ensureAlpha();

    const { data, info } = await pipeline
        .raw()
        .toBuffer({ resolveWithObject: true });

    const removeFn = removeNearWhiteBackground(THRESHOLD);
    const channels = info.channels;
    const pixelCount = data.length / channels;

    for (let i = 0; i < pixelCount; i++) {
        const offset = i * channels;
        const pixel = data.slice(offset, offset + channels);
        removeFn(pixel);
        /* Write the modified alpha back */
        data[offset + 3] = pixel[3];
    }

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

    await sharp(data, {
        raw: {
            width: info.width,
            height: info.height,
            channels: 4,
        },
    })
        .png({ compressionLevel: 9 })
        .toFile(OUTPUT);

    console.log(`Wrote:    ${OUTPUT}`);
    console.log(`Size:     ${info.width}x${info.height}`);
}

main().catch((err) => {
    console.error('Failed to process image:', err);
    process.exit(1);
});
