const prisma = require("../prismaClient");

const adminMiddleware = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res
      .status(401)
      .json({ error: "Access denied. Authentication required." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { is_admin: true },
    });

    if (user && user.is_admin === true) {
      return next();
    }

    return res.status(403).json({ error: "Access denied. Admins only." });
  } catch (error) {
    next(error);
  }
};

module.exports = adminMiddleware;
