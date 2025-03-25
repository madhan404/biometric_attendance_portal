const jwt = require('jsonwebtoken');


const auth = (allowedRoles) => (req, res, next) => {
  
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    // Verify token using the secret key from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'itiskey'); 
    req.user = decoded;

    const userRoles = req.user.roles;
    if (!allowedRoles.some(role => userRoles.includes(role))) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;
