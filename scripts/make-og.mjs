// Builds a 1200x630 social share image from the regular logo (Logo.png) over
// a darkened circuit board with a blue energy bloom. Run: node scripts/make-og.mjs
import sharp from 'sharp';

const W = 1200, H = 630;

const base = await sharp('public/images/circuit-bg.jpg')
  .resize(W, H, { fit: 'cover' })
  .modulate({ brightness: 0.55, saturation: 1.1 })
  .toBuffer();

// near-black radial so the logo's own black backing blends into the centre,
// while the circuit stays visible toward the edges
const darkCenter = Buffer.from(
  `<svg width="${W}" height="${H}"><defs>
     <radialGradient id="d" cx="50%" cy="50%" r="60%">
       <stop offset="0%" stop-color="#000" stop-opacity="0.96"/>
       <stop offset="50%" stop-color="#01030a" stop-opacity="0.82"/>
       <stop offset="100%" stop-color="#01030a" stop-opacity="0"/>
     </radialGradient>
   </defs><rect width="${W}" height="${H}" fill="url(#d)"/></svg>`
);

// blue bloom behind the logo
const bloom = Buffer.from(
  `<svg width="${W}" height="${H}"><defs>
     <radialGradient id="g" cx="50%" cy="50%" r="44%">
       <stop offset="0%" stop-color="#3aa0ff" stop-opacity="0.55"/>
       <stop offset="45%" stop-color="#1e6fff" stop-opacity="0.22"/>
       <stop offset="100%" stop-color="#1e6fff" stop-opacity="0"/>
     </radialGradient>
   </defs><rect width="${W}" height="${H}" fill="url(#g)"/></svg>`
);

// subtle vignette for depth
const vignette = Buffer.from(
  `<svg width="${W}" height="${H}"><defs>
     <radialGradient id="v" cx="50%" cy="50%" r="75%">
       <stop offset="60%" stop-color="#000" stop-opacity="0"/>
       <stop offset="100%" stop-color="#000" stop-opacity="0.55"/>
     </radialGradient>
   </defs><rect width="${W}" height="${H}" fill="url(#v)"/></svg>`
);

const logo = await sharp('Logo.png').resize({ height: 540 }).toBuffer();

await sharp(base)
  .composite([
    { input: darkCenter },
    { input: bloom },
    { input: logo, gravity: 'center' },
    { input: vignette },
  ])
  .jpeg({ quality: 88 })
  .toFile('public/og-image.jpg');

console.log('Wrote public/og-image.jpg (1200x630)');
