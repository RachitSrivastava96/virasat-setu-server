// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ 
    error: "Unauthorized", 
    message: "Please log in to access this resource" 
  });
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ 
    error: "Forbidden", 
    message: "Admin access required" 
  });
};

module.exports = {
  isAuthenticated,
  isAdmin,
};