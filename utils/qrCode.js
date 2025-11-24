const QRCode = require('qrcode');

/**
 * Generate QR code as base64 data URL
 * @param {string} data - Data to encode in QR code
 * @returns {Promise<string>} Base64 data URL of QR code
 */
exports.generateQRCode = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate QR code and save to file
 * @param {string} data - Data to encode
 * @param {string} filePath - Path to save QR code
 * @returns {Promise<string>} File path
 */
exports.generateQRCodeFile = async (data, filePath) => {
  try {
    await QRCode.toFile(filePath, data, {
      errorCorrectionLevel: 'M',
      type: 'png',
      width: 300,
      margin: 2
    });
    return filePath;
  } catch (error) {
    console.error('Error generating QR code file:', error);
    throw new Error('Failed to generate QR code file');
  }
};
