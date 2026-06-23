/**
 * Generates the PWA icons, favicon PNG and the social/OG image from the SVG
 * sources. Run with: npm run assets   (requires the `sharp` devDependency)
 */
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = resolve(__dirname, '../public');

const icon = readFileSync(resolve(pub, 'favicon.svg'));
const og = readFileSync(resolve(__dirname, 'og-source.svg'));
const shareBase = readFileSync(resolve(__dirname, 'share-base.svg'));

await sharp(icon, { density: 384 }).resize(192, 192).png().toFile(resolve(pub, 'icon-192.png'));
await sharp(icon, { density: 384 }).resize(512, 512).png().toFile(resolve(pub, 'icon-512.png'));
await sharp(og).resize(1200, 630).png().toFile(resolve(pub, 'og.png'));
// Premium share-card base template (live data is overlaid at runtime)
await sharp(shareBase, { density: 144 }).resize(1080, 1500).png().toFile(resolve(pub, 'share-base.png'));

console.log('✓ icon-192.png, icon-512.png, og.png, share-base.png gerados em public/');
