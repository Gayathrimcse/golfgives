'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

export default function ScoresPage() {
  const supabase = createClient()
  const [scores, setScores] = useState([])
  const [form, setForm] = useState({ score: '', date: new Date().toISOString().split('T')[0] })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState(null)

  useEffect(() => { loadScores() }, [])

  const loadScores = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const { data } = await supabase.from('scores').select('*').eq('user_id', user.id).order('date', { ascending: false })
    setScores(data || [])
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    const score = parseInt(form.score)
    if (score < 1 || score > 45) { setError('Score must be between 1 and 45'); setLoading(false); return }
    const existing = scores.find(s => s.date === form.date)
    if (existing) { setError('A score for this date already exists.'); setLoading(false); return }
    if (scores.length >= 5) {
      const oldest = [...scores].sort((a, b) => new Date(a.date) - new Date(b.date))[0]
      await supabase.from('scores').delete().eq('id', oldest.id)
    }
    const { error: err } = await supabase.from('scores').insert({ user_id: userId, score, date: form.date })
    if (err) { setError(err.message); setLoading(false); return }
    setSuccess('Score added!')
    setForm({ score: '', date: new Date().toISOString().split('T')[0] })
    loadScores()
    setLoading(false)
  }

  const handleDelete = async (id) => {
    await supabase.from('scores').delete().eq('id', id)
    loadScores()
  }

  const avg = scores.length ? (scores.reduce((s, x) => s + x.score, 0) / scores.length).toFixed(1) : '-'

  return (
    <div className="min-h-screen bg-[#060d0a]">
      <nav className="border-b border-[#1a4731] px-6 py-4 flex items-center gap-6">
        <Link href="/dashboard" className="text-xl font-bold">Golf<span className="text-[#c9a84c]">Gives</span></Link>
        <Link href="/dashboard" className="nav-link text-sm">← Back</Link>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">My Golf Scores</h1>
        <p className="text-gray-400 mb-10">Stableford scores (1–45). Only your latest 5 are kept.</p>
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[['Scores', `${scores.length}/5`], ['Average', avg], ['Highest', scores.length ? Math.max(...scores.map(s => s.score)) : '-']].map(([l, v]) => (
            <div key={l} className="card text-center">
              <p className="text-gray-400 text-sm">{l}</p>
              <p className="text-2xl font-bold text-[#c9a84c]">{v}</p>
            </div>
          ))}
        </div>
        <div className="card mb-8">
          <h2 className="font-bold text-lg mb-5">Add New Score</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Score (1–45)</label>
                <input type="number" min="1" max="45" value={form.score} onChange={e => setForm(f => ({...f, score: e.target.value}))} className="input-field" placeholder="e.g. 36" required />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Date Played</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} className="input-field" max={new Date().toISOString().split('T')[0]} required />
              </div>
            </div>
            {error && <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded">{error}</p>}
            {success && <p className="text-green-400 text-sm bg-green-900/20 p-3 rounded">{success}</p>}
            <button type="submit" disabled={loading} className="btn-gold">{loading ? 'Adding...' : 'Add Score'}</button>
          </form>
        </div>
        <div className="card">
          <h2 className="font-bold text-lg mb-5">Recorded Scores</h2>
          {scores.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No scores yet.</p>
          ) : (
            <div className="space-y-3">
              {scores.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between py-3 border-b border-[#1a4731] last:border-0">
                  <div>
                    <p className="text-sm text-gray-400">{new Date(s.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    {i === 0 && <span className="text-xs text-[#c9a84c] font-mono">Latest</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-[#c9a84c]">{s.score}</span>
                    <button onClick={() => handleDelete(s.id)} className="text-gray-600 hover:text-red-400 text-sm">✕</button>
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
