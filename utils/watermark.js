const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Add text watermark to image
 * @param {string} inputPath - Input image path
 * @param {string} outputPath - Output image path
 * @param {object} options - Watermark options
 * @returns {Promise<string>} Output path
 */
exports.addTextWatermark = async (inputPath, outputPath, options = {}) => {
  try {
    const {
      text = '© Photo Studio',
      opacity = 0.5,
      position = 'bottom-right'
    } = options;

    // Read image metadata
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Calculate font size based on image dimensions
    const fontSize = Math.floor(metadata.width / 30);

    // Create SVG text watermark
    const svgText = createWatermarkSVG(text, fontSize, opacity, position, metadata);

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Composite watermark onto image
    await image
      .composite([{
        input: Buffer.from(svgText),
        gravity: getGravity(position)
      }])
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error('Error adding watermark:', error);
    throw new Error('Failed to add watermark to image');
  }
};

/**
 * Add logo watermark to image
 * @param {string} inputPath - Input image path
 * @param {string} logoPath - Logo image path
 * @param {string} outputPath - Output image path
 * @param {object} options - Watermark options
 * @returns {Promise<string>} Output path
 */
exports.addLogoWatermark = async (inputPath, logoPath, outputPath, options = {}) => {
  try {
    const {
      opacity = 0.7,
      position = 'bottom-right',
      scale = 0.1 // Logo size as percentage of image width
    } = options;

    // Read image metadata
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Resize logo
    const logoWidth = Math.floor(metadata.width * scale);
    const logoBuffer = await sharp(logoPath)
      .resize(logoWidth, null, { fit: 'inside' })
      .png()
      .toBuffer();

    // Apply opacity to logo
    const transparentLogo = await sharp(logoBuffer)
      .composite([{
        input: Buffer.from([255, 255, 255, Math.floor(255 * opacity)]),
        raw: {
          width: 1,
          height: 1,
          channels: 4
        },
        tile: true,
        blend: 'dest-in'
      }])
      .toBuffer();

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Composite logo onto image
    await image
      .composite([{
        input: transparentLogo,
        gravity: getGravity(position)
      }])
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error('Error adding logo watermark:', error);
    throw new Error('Failed to add logo watermark to image');
  }
};

/**
 * Create SVG watermark text
 */
function createWatermarkSVG(text, fontSize, opacity, position, metadata) {
  const padding = 20;
  const textColor = `rgba(255, 255, 255, ${opacity})`;
  const strokeColor = `rgba(0, 0, 0, ${opacity * 0.5})`;

  return `
    <svg width="${metadata.width}" height="${metadata.height}">
      <text
        x="${padding}"
        y="${metadata.height - padding}"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="${textColor}"
        stroke="${strokeColor}"
        stroke-width="1"
      >${text}</text>
    </svg>
  `;
}

/**
 * Convert position string to sharp gravity
 */
function getGravity(position) {
  const gravityMap = {
    'top-left': 'northwest',
    'top-right': 'northeast',
    'bottom-left': 'southwest',
    'bottom-right': 'southeast',
    'center': 'center'
  };
  return gravityMap[position] || 'southeast';
}

/**
 * Generate thumbnail
 * @param {string} inputPath - Input image path
 * @param {string} outputPath - Output thumbnail path
 * @param {number} width - Thumbnail width
 * @returns {Promise<string>} Output path
 */
exports.generateThumbnail = async (inputPath, outputPath, width = 300) => {
  try {
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await sharp(inputPath)
      .resize(width, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw new Error('Failed to generate thumbnail');
  }
};
