function rbacMiddleware(req, res, next) {
  const allowedRolesForWrite = ["admin", "user"];
  if (req.method === "GET") return next();
  if (!req.user || !allowedRolesForWrite.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

module.exports = rbacMiddleware;
