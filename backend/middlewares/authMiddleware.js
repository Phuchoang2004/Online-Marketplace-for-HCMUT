const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const tokenParts = authHeader.split(' ');
  if (tokenParts[0].toLowerCase() !== 'bearer' || !tokenParts[1]) {
    return res.status(401).json({ success: false, message: 'Only accept Bearer token' });
  }

  try {
    const decoded = jwt.verify(tokenParts[1], process.env.SECRET_KEY);

    if (decoded.role === 'VENDOR' && !decoded.vendorProfile) {
      const userDoc = await User.findById(decoded.id).select('vendorProfile role email');
      if (userDoc) decoded.vendorProfile = userDoc.vendorProfile?.toString();
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error('[AuthMiddleware Error]', err.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token', error: err.message });
  }
};
