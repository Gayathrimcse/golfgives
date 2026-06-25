'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

export default function AdminDrawsPage() {
  const supabase = createClient()
  const [draws, setDraws] = useState([])
  const [form, setForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), drawType: 'random', pool: '' })
  const [simResult, setSimResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  useEffect(() => { loadDraws() }, [])

  const loadDraws = async () => {
    const { data } = await supabase.from('draws').select('*').order('created_at', { ascending: false })
    setDraws(data || [])
  }

  const generateNumbers = (type) => {
    const nums = new Set()
    while (nums.size < 5) nums.add(Math.floor(Math.random() * 45) + 1)
    return [...nums].sort((a, b) => a - b)
  }

  const handleSimulate = async () => {
    setLoading(true)
    const nums = generateNumbers(form.drawType)
    setSimResult(nums)
    setMsg('Simulation complete — review numbers before publishing.')
    setLoading(false)
  }

  const handlePublish = async () => {
    if (!simResult) { setMsg('Please simulate first.'); return }
    setLoading(true)
    const { data: activeSubs } = await supabase.from('profiles').select('id').eq('subscription_status', 'active')
    const pool = parseFloat(form.pool) || (activeSubs?.length || 0) * 999 * 0.5

    const { data: draw, error } = await supabase.from('draws').insert({
      month: form.month, year: form.year, numbers: simResult,
      draw_type: form.drawType, status: 'published',
      total_prize_pool: pool, published_at: new Date().toISOString(),
    }).select().single()

    if (error) { setMsg('Error: ' + error.message); setLoading(false); return }

    const { data: allScores } = await supabase.from('scores').select('user_id, score')
    const userScores = {}
    allScores?.forEach(s => {
      if (!userScores[s.user_id]) userScores[s.user_id] = []
      userScores[s.user_id].push(s.score)
    })

    const prizeShares = { '5-match': 0.4, '4-match': 0.35, '3-match': 0.25 }
    const winnerInserts = []
    Object.entries(userScores).forEach(([uid, scores]) => {
      const matches = scores.filter(s => simResult.includes(s)).length
      let tier = null
      if (matches >= 5) tier = '5-match'
      else if (matches >= 4) tier = '4-match'
      else if (matches >= 3) tier = '3-match'
      if (tier) winnerInserts.push({ draw_id: draw.id, user_id: uid, match_type: tier, prize_amount: pool * prizeShares[tier], status: 'pending' })
    })

    if (winnerInserts.length > 0) await supabase.from('winners').insert(winnerInserts)
    setMsg(`Draw published! ${winnerInserts.length} winner(s) found.`)
    setSimResult(null)
    loadDraws()
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#060d0a]">
      <nav className="border-b border-[#1a4731] px-6 py-4 flex items-center gap-6">
        <Link href="/admin" className="text-xl font-bold">Golf<span className="text-[#c9a84c]">Gives</span></Link>
        <Link href="/admin" className="nav-link text-sm">← Admin Home</Link>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Draw Management</h1>
        <p className="text-gray-400 mb-10">Configure, simulate, and publish monthly prize draws.</p>
        <div className="card mb-8">
          <h2 className="font-bold text-lg mb-6">Configure New Draw</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Month</label>
              <select value={form.month} onChange={e => setForm(f => ({...f, month: Number(e.target.value)}))} className="input-field">
                {months.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Year</label>
              <input type="number" value={form.year} onChange={e => setForm(f => ({...f, year: Number(e.target.value)}))} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Draw Type</label>
              <select value={form.drawType} onChange={e => setForm(f => ({...f, drawType: e.target.value}))} className="input-field">
                <option value="random">Random (Lottery-style)</option>
                <option value="algorithmic">Algorithmic (Weighted by scores)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Prize Pool (₹) — leave blank for auto</label>
              <input type="number" value={form.pool} onChange={e => setForm(f => ({...f, pool: e.target.value}))} className="input-field" placeholder="Auto-calculated" />
            </div>
          </div>
          {simResult && (
            <div className="bg-[#1a2d1f] border border-[#c9a84c] rounded-lg p-4 mb-6">
              <p className="text-[#c9a84c] text-sm font-mono uppercase tracking-widest mb-3">Simulated Numbers</p>
              <div className="flex gap-3">
                {simResult.map((n, i) => (
                  <div key={i} className="w-12 h-12 rounded-full bg-[#c9a84c] text-[#060d0a] flex items-center justify-center font-bold text-lg">{n}</div>
                ))}
              </div>
            </div>
          )}
          {msg && <p className="text-[#c9a84c] text-sm mb-4 bg-[#c9a84c]/10 p-3 rounded">{msg}</p>}
          <div className="flex gap-4">
            <button onClick={handleSimulate} disabled={loading} className="btn-outline">🎲 Simulate Draw</button>
            {simResult && <button onClick={handlePublish} disabled={loading} className="btn-gold">📢 Publish Results</button>}
          </div>
        </div>
        <div className="card">
          <h2 className="font-bold text-lg mb-6">Past Draws</h2>
          {draws.length === 0 ? <p className="text-gray-400 text-sm">No draws yet.</p> : (
            <div className="space-y-4">
              {draws.map(d => (
                <div key={d.id} className="flex items-center justify-between py-4 border-b border-[#1a4731] last:border-0">
                  <div>
                    <p className="font-semibold">{months[d.month-1]} {d.year}</p>
                    <p className="text-gray-400 text-sm">Prize Pool: ₹{parseFloat(d.total_prize_pool || 0).toLocaleString('en-IN')} · {d.draw_type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {(d.numbers || []).map((n, i) => (
                        <span key={i} className="w-7 h-7 rounded-full bg-[#1a4731] flex items-center justify-center text-xs font-bold text-[#c9a84c]">{n}</span>
                      ))}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${d.status === 'published' ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-400'}`}>{d.status}</span>
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
