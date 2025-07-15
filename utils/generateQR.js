const QRCode = require('qrcode');

const generateQRCode = async (data) => {
  try {
    // Generate QR code as data URL (base64)
    const qrCodeDataURL = await QRCode.toDataURL(data);
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

const generateQR = async (applicationId) => {
  try {
    const qrData = {
      applicationId: applicationId,
      type: 'vehicle_pass',
      generatedAt: new Date().toISOString()
    };

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));
    
    return {
      dataURL: qrCodeDataURL,
      data: JSON.stringify(qrData),
      message: 'QR Code generated successfully'
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

module.exports = {
  generateQRCode,
  generateQR
};
