import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db.js'

// Register User
export const register = async (req, res) => {
  const { name, email, password } = req.body

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, storage_used, storage_limit, created_at',
      [name, email, hashedPassword]
    )

    const user = newUser.rows[0]

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    })

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(201).json({ user, token })
  } catch (error) {
    console.error('Error during registration:', error)
    res.status(500).json({ error: 'Server error during registration' })
  }
}

// Login User
export const login = async (req, res) => {
  const { email, password } = req.body

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    const user = userResult.rows[0]
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    })

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    const { password: _, ...userData } = user
    res.json({ user: userData, token })
  } catch (error) {
    console.error('Error during login:', error)
    res.status(500).json({ error: 'Server error during login' })
  }
}

// Logout User
export const logout = async (req, res) => {
  try {
    res.clearCookie('token')
    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Error during logout:', error)
    res.status(500).json({ error: 'Server error during logout' })
  }
}

// Get Current Logged In User Profile
export const getMe = async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, name, email, storage_used, storage_limit, created_at FROM users WHERE id = $1',
      [req.user.id]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user: userResult.rows[0] })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ error: 'Server error fetching user profile' })
  }
}