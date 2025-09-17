const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateIcons() {
  const logo = path.join(__dirname, 'logo.png');
  
  const configs = {
    'icon.png': {
      size: 1024,
      background: '#4F46E5',
      padding: 200 // 20% padding
    },
    'splash.png': {
      size: 1024,
      background: '#4F46E5',
      padding: 256 // 25% padding
    },
    'adaptive-icon.png': {
      size: 1024,
      background: '#4F46E5',
      padding: 220 // ~21% padding
    }
  };

  for (const [filename, config] of Object.entries(configs)) {
    const outputFile = path.join(__dirname, filename);
    const { size, background, padding } = config;

    try {
      // Créer un fond carré avec la couleur de fond
      const canvas = await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 79, g: 70, b: 229, alpha: 1 } // #4F46E5
        }
      })
        .png()
        .toBuffer();

      // Calculer la taille du logo avec le padding
      const logoSize = size - (padding * 2);

      // Redimensionner le logo et le composer sur le fond
      await sharp(logo)
        .resize(logoSize, logoSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer()
        .then(resizedLogo => {
          return sharp(canvas)
            .composite([{
              input: resizedLogo,
              top: padding,
              left: padding
            }])
            .toFile(outputFile);
        });

      console.log(`Generated ${filename}`);
    } catch (error) {
      console.error(`Error generating ${filename}:`, error);
    }
  }
}

generateIcons();