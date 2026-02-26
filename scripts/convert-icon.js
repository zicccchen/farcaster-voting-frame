const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Read the SVG file
const svgPath = path.join(__dirname, '../public/icon.svg');
const pngPath = path.join(__dirname, '../public/icon.png');

// Create a simple gradient PNG with voting icon
async function createIcon() {
  try {
    // Create a 512x512 PNG with gradient and white voting icon
    const svg = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0052FF"/>
            <stop offset="100%" style="stop-color:#00D4FF"/>
          </linearGradient>
        </defs>

        <!-- Background -->
        <rect width="512" height="512" rx="100" fill="url(#bg)"/>

        <!-- Vote icon -->
        <g transform="translate(128, 128)">
          <!-- Checkbox -->
          <rect x="60" y="80" width="140" height="140" rx="20" fill="none" stroke="white" stroke-width="12"/>
          <path d="M 100 150 L 130 180 L 170 120" stroke="white" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

          <!-- Text -->
          <text x="130" y="260" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="white" text-anchor="middle">VOTE</text>
        </g>
      </svg>
    `;

    // Convert SVG to PNG
    await sharp(Buffer.from(svg))
      .resize(512, 512)
      .png()
      .toFile(pngPath);

    console.log('✅ icon.png created successfully at:', pngPath);

    // Get file size
    const stats = fs.statSync(pngPath);
    console.log('📏 File size:', (stats.size / 1024).toFixed(2), 'KB');

  } catch (error) {
    console.error('❌ Error creating icon:', error);
    process.exit(1);
  }
}

createIcon();
