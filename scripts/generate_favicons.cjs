const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateFavicons() {
  const rootDir = path.resolve(__dirname, '..');
  const inputLogo = path.join(rootDir, 'public', 'logo.png');
  const publicDir = path.join(rootDir, 'public');

  console.log('Reading', inputLogo);

  // Generate individual PNGs
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
  ];

  const pngBuffers = {};

  for (const item of sizes) {
    const buf = await sharp(inputLogo)
      .resize(item.size, item.size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    pngBuffers[item.size] = buf;
    const dest = path.join(publicDir, item.name);
    fs.writeFileSync(dest, buf);
    console.log(`Generated ${item.name} (${buf.length} bytes)`);
  }

  // Create favicon.ico containing 16x16, 32x32, and 48x48
  const icoSizes = [16, 32, 48];
  const count = icoSizes.length;

  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(count, 4); // count

  const directoryEntries = [];
  let currentOffset = 6 + count * 16;

  for (const s of icoSizes) {
    const buf = pngBuffers[s];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(s === 256 ? 0 : s, 0); // width
    entry.writeUInt8(s === 256 ? 0 : s, 1); // height
    entry.writeUInt8(0, 2); // palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(buf.length, 8); // size
    entry.writeUInt32LE(currentOffset, 12); // offset
    directoryEntries.push(entry);
    currentOffset += buf.length;
  }

  const icoBuffer = Buffer.concat([
    header,
    ...directoryEntries,
    ...icoSizes.map(s => pngBuffers[s])
  ]);

  const icoPath = path.join(publicDir, 'favicon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`Generated favicon.ico (${icoBuffer.length} bytes)`);

  // Update favicon.svg so it embeds the logo or represents the logo instead of Vite logo
  const logoBase64 = fs.readFileSync(path.join(publicDir, 'favicon-48x48.png')).toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <image href="data:image/png;base64,${logoBase64}" width="48" height="48" />
</svg>
`;
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');
  console.log('Updated favicon.svg with Korwilcam logo');

  // Generate site.webmanifest
  const manifest = {
    name: "Korwilcam Purwodadi Grobogan",
    short_name: "Korwilcam",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    theme_color: "#1e40af",
    background_color: "#ffffff",
    display: "standalone"
  };

  fs.writeFileSync(
    path.join(publicDir, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );
  console.log('Generated site.webmanifest');
}

generateFavicons().catch(err => {
  console.error(err);
  process.exit(1);
});
