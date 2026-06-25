'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

export default function CharityPage() {
  const supabase = createClient()
  const [charities, setCharities] = useState([])
  const [profile, setProfile] = useState(null)
  const [selected, setSelected] = useState(null)
  const [percentage, setPercentage] = useState(10)
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const [{ data: prof }, { data: chars }] = await Promise.all([
      supabase.from('profiles').select('*, charity:charity_id(id, name)').eq('id', user.id).single(),
      supabase.from('charities').select('*').eq('active', true).order('featured', { ascending: false }),
    ])
    setProfile(prof)
    setCharities(chars || [])
    setSelected(prof?.charity_id)
    setPercentage(prof?.charity_percentage || 10)
  }

  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({ charity_id: selected, charity_percentage: percentage }).eq('id', user.id)
    setSuccess('Saved!')
    setLoading(false)
    setTimeout(() => setSuccess(''), 3000)
  }

  const monthlyFee = profile?.subscription_plan === 'yearly' ? 8999 / 12 : 999
  const donation = Math.round(monthlyFee * percentage / 100)

  return (
    <div className="min-h-screen bg-[#060d0a]">
      <nav className="border-b border-[#1a4731] px-6 py-4 flex items-center gap-6">
        <Link href="/dashboard" className="text-xl font-bold">Golf<span className="text-[#c9a84c]">Gives</span></Link>
        <Link href="/dashboard" className="nav-link text-sm">← Back</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Choose Your Charity</h1>
        <p className="text-gray-400 mb-10">Minimum 10% of your subscription goes to the charity you select.</p>
        <div className="card mb-10">
          <h2 className="font-bold text-lg mb-4">Contribution Percentage</h2>
          <div className="flex items-center gap-6">
            <input type="range" min="10" max="100" step="5" value={percentage} onChange={e => setPercentage(Number(e.target.value))} className="flex-1 accent-[#c9a84c]" />
            <span className="text-3xl font-bold text-[#c9a84c] w-20 text-right">{percentage}%</span>
          </div>
          <p className="text-gray-400 text-sm mt-3">That's <span className="text-[#c9a84c] font-bold">₹{donation}/month</span> going to your chosen charity.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {charities.map(c => (
            <button key={c.id} onClick={() => setSelected(c.id)}
              className={`card text-left transition-all ${selected === c.id ? 'border-[#c9a84c] bg-[#1a2d1f]' : 'hover:border-[#2d6a4f]'}`}>
              {c.featured && <p className="text-[#c9a84c] text-xs font-mono uppercase tracking-widest mb-3">⭐ Featured</p>}
              <h3 className="font-bold text-lg mb-1">{c.name}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{c.description}</p>
              {selected === c.id && <p className="text-[#c9a84c] text-sm mt-3 font-semibold">✓ Selected</p>}
            </button>
          ))}
        </div>
        {success && <p className="text-green-400 text-sm bg-green-900/20 p-3 rounded mb-4">{success}</p>}
        <button onClick={handleSave} disabled={loading || !selected} className="btn-gold">
          {loading ? 'Saving...' : 'Save Charity Preferences'}
        </button>
      </div>
    </div>
  )
}
