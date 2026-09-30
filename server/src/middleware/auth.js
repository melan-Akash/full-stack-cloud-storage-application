import jwt from 'jsonwebtoken'

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized, token failed' })
  }
}