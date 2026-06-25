'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState(null)
  const [scores, setScores] = useState([])
  const [draws, setDraws] = useState([])
  const [wins, setWins] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const [{ data: prof }, { data: sc }, { data: dr }, { data: w }] = await Promise.all([
      supabase.from('profiles').select('*, charity:charity_id(name)').eq('id', user.id).single(),
      supabase.from('scores').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
      supabase.from('draws').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(3),
      supabase.from('winners').select('*, draw:draw_id(month, year)').eq('user_id', user.id).order('created_at', { ascending: false }),
    ])

    setProfile(prof)
    setScores(sc || [])
    setDraws(dr || [])
    setWins(w || [])
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div className="min-h-screen bg-[#060d0a] flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const totalWon = wins.reduce((s, w) => s + (parseFloat(w.prize_amount) || 0), 0)
  const charityAmount = profile?.subscription_plan === 'yearly' ? (8999 * (profile.charity_percentage || 10) / 100) : (999 * (profile.charity_percentage || 10) / 100)

  return (
    <div className="min-h-screen bg-[#060d0a]">
      <nav className="border-b border-[#1a4731] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">Golf<span className="text-[#c9a84c]">Gives</span></Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard/scores" className="nav-link text-sm">Scores</Link>
          <Link href="/dashboard/charity" className="nav-link text-sm">Charity</Link>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 text-sm transition-colors">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">Hello, {profile?.full_name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-400 mt-1">Here's your GolfGives overview</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Subscription', value: profile?.subscription_plan === 'yearly' ? 'Yearly' : 'Monthly', sub: profile?.subscription_status === 'active' ? '✅ Active' : '❌ Inactive', color: '#c9a84c' },
            { label: 'Scores Entered', value: `${scores.length}/5`, sub: 'Last 5 rounds', color: '#4a9e73' },
            { label: 'Total Won', value: totalWon > 0 ? `₹${totalWon.toLocaleString('en-IN')}` : '₹0', sub: `${wins.length} prize(s)`, color: '#c9a84c' },
            { label: 'Charity Given', value: `₹${Math.round(charityAmount).toLocaleString('en-IN')}`, sub: `${profile?.charity_percentage || 10}% this month`, color: '#4a9e73' },
          ].map(s => (
            <div key={s.label} className="card">
              <p className="text-gray-400 text-sm mb-2">{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-gray-500 text-xs mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">My Scores</h2>
              <Link href="/dashboard/scores" className="text-[#c9a84c] text-sm hover:underline">Manage →</Link>
            </div>
            {scores.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No scores yet</p>
                <Link href="/dashboard/scores" className="btn-gold text-sm py-2 px-4 inline-block">Enter First Score</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {scores.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-[#1a4731] last:border-0">
                    <p className="text-sm text-gray-400">{new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-[#c9a84c]">{s.score}</span>
                      <span className="text-gray-500 text-xs">pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">My Charity</h2>
              <Link href="/dashboard/charity" className="text-[#c9a84c] text-sm hover:underline">Change →</Link>
            </div>
            {profile?.charity ? (
              <div>
                <p className="text-xl font-semibold mb-2">{profile.charity.name}</p>
                <p className="text-gray-400 text-sm mb-4">Contributing <span className="text-[#c9a84c] font-bold">{profile?.charity_percentage || 10}%</span> of subscription</p>
                <div className="bg-[#1a4731]/30 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Monthly contribution</p>
                  <p className="text-2xl font-bold text-[#c9a84c]">₹{Math.round(charityAmount).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No charity selected yet</p>
                <Link href="/dashboard/charity" className="btn-gold text-sm py-2 px-4 inline-block">Choose Charity</Link>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-lg mb-5">Recent Draws</h2>
          {draws.length === 0 ? (
            <p className="text-gray-400 text-sm">No draws published yet. The next draw happens at the end of the month.</p>
          ) : (
            <div className="space-y-3">
              {draws.map(d => (
                <div key={d.id} className="flex items-center justify-between py-3 border-b border-[#1a4731] last:border-0">
                  <div>
                    <p className="font-semibold">{months[d.month - 1]} {d.year} Draw</p>
                    <p className="text-gray-400 text-sm">Prize pool: ₹{parseFloat(d.total_prize_pool || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex gap-2">
                    {(d.numbers || []).map((n, i) => (
                      <span key={i} className="w-8 h-8 rounded-full bg-[#1a4731] flex items-center justify-center text-sm font-bold text-[#c9a84c]">{n}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
