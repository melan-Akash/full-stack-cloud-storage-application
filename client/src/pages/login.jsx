import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useApp } from '../context/appContext'

const Login = ({ mode = 'login' }) => {
  const isRegister = mode === 'register'
  const navigate = useNavigate()
  const { login, register } = useApp()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const ok = isRegister
      ? await register(form.name, form.email, form.password)
      : await login(form.email, form.password)

    setIsLoading(false)

    if (ok) {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white selection:bg-orange-500 selection:text-white">
      {/* Left Hero Brand Panel */}
      <div className="relative md:w-1/2 min-h-115 md:min-h-screen p-8 sm:p-12 lg:p-20 flex flex-col justify-between overflow-hidden bg-[#faf7f4]">
        {/* Subtle radial glows */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle_at_0%_0%,rgba(254,215,170,0.5)_0%,rgba(255,247,237,0.3)_45%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full pointer-events-none bg-[radial-gradient(circle_at_100%_100%,rgba(254,215,170,0.3)_0%,transparent_60%)]" />

        {/* Diamond Geometric Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-85"
          style={{
            backgroundImage: "url('/pattern.svg')",
            backgroundRepeat: 'repeat',
          }}
        />

        {/* Top: Brand Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <img src="/logo.svg" alt="Drivea Logo" className="h-6 w-auto" />
          <span className="text-xl font-bold tracking-widest text-slate-900 uppercase">
            DRIVEA
          </span>
        </div>

        {/* Center: Hero Heading & Description */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-slate-900 leading-[1.18]">
            Secure, Simple &amp; Fast <br />
            <span className="text-orange-600 font-normal">Cloud Storage.</span>
          </h1>
          <p className="mt-5 text-slate-500 text-sm sm:text-base leading-relaxed max-w-sm">
            Store your files securely in our drive, organize into folders, share with permissions and access anywhere.
          </p>
        </div>

        {/* Bottom: Copyright & Portfolio Link */}
        <div className="relative z-10 text-xs text-slate-400">
          © {new Date().getFullYear()}{' '}
          <a
            href="https://melanakash.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-orange-600 transition-colors font-medium underline underline-offset-2"
          >
            Melan Akash
          </a>
          . All rights reserved.
        </div>
      </div>

      {/* Right Auth Form */}
      <div className="flex-1 bg-white p-8 sm:p-12 lg:p-20 flex items-center justify-center">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight">
              {isRegister ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
              {isRegister
                ? 'Enter your details below to get started with 1 GB free storage'
                : 'Enter your credentials to access your Drive'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <Input
                label="Full Name"
                icon={User}
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 rounded-xl font-medium text-sm mt-2"
              isLoading={isLoading}
            >
              {isRegister ? 'Create account' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center pt-1 text-xs sm:text-sm text-slate-500">
            {isRegister ? (
              <p>
                Already have an account?{' '}
                <Link to="/login" className="text-orange-600 font-semibold hover:underline ml-0.5">
                  Sign in
                </Link>
              </p>
            ) : (
              <p>
                Don't have an account yet?{' '}
                <Link to="/register" className="text-orange-600 font-semibold hover:underline ml-0.5">
                  Create account
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login