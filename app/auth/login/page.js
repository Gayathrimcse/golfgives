'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    if (profile?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#060d0a] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-bold">Golf<span className="text-[#c9a84c]">Gives</span></Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Welcome back</h1>
          <p className="text-gray-400 text-sm">Sign in to your account</p>
        </div>
        <div className="card">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required />
            </div>
            {error && <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded">{error}</p>}
            <button type="submit" disabled={loading} className="btn-gold w-full text-center">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account? <Link href="/auth/signup" className="text-[#c9a84c] hover:underline">Sign up</Link>
          </p>
        </div>
        <div className="mt-6 card border-[#c9a84c]/30 text-sm">
          <p className="text-[#c9a84c] font-semibold mb-2">Demo Credentials</p>
          <p className="text-gray-400">Admin: <span className="text-white font-mono">admin@golfgives.com</span></p>
          <p className="text-gray-400">Password: <span className="text-white font-mono">Admin@123</span></p>
          <p className="text-gray-400 mt-2">User: <span className="text-white font-mono">user@golfgives.com</span></p>
          <p className="text-gray-400">Password: <span className="text-white font-mono">User@123</span></p>
        </div>
      </div>
    </div>
  )
}
