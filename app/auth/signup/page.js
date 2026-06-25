'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', plan: 'monthly' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name } }
    })

    if (error) { setError(error.message); setLoading(false); return }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: form.email,
        full_name: form.name,
        subscription_plan: form.plan,
        subscription_status: 'active',
      })
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#060d0a] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-bold">Golf<span className="text-[#c9a84c]">Gives</span></Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Create your account</h1>
          <p className="text-gray-400 text-sm">Start playing for good today</p>
        </div>
        <div className="card">
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Full Name</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)} className="input-field" placeholder="Your full name" required />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Email</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Password</label>
              <input type="password" value={form.password} onChange={e => update('password', e.target.value)} className="input-field" placeholder="Min. 8 characters" minLength={8} required />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Choose Plan</label>
              <div className="grid grid-cols-2 gap-3">
                {[['monthly', 'Monthly', '₹999/mo'], ['yearly', 'Yearly', '₹8,999/yr']].map(([val, label, price]) => (
                  <button type="button" key={val} onClick={() => update('plan', val)}
                    className={`p-3 rounded-lg border text-left transition-all ${form.plan === val ? 'border-[#c9a84c] bg-[#c9a84c]/10' : 'border-[#1a4731]'}`}>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-[#c9a84c] text-sm">{price}</p>
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded">{error}</p>}
            <button type="submit" disabled={loading} className="btn-gold w-full text-center">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account? <Link href="/auth/login" className="text-[#c9a84c] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
