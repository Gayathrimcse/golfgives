'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

export default function AdminWinnersPage() {
  const supabase = createClient()
  const [winners, setWinners] = useState([])
  const [filter, setFilter] = useState('pending')
  const [msg, setMsg] = useState('')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  useEffect(() => { loadWinners() }, [filter])

  const loadWinners = async () => {
    let q = supabase.from('winners').select('*, user:user_id(full_name, email), draw:draw_id(month, year)').order('created_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    const { data } = await q
    setWinners(data || [])
  }

  const updateStatus = async (id, status) => {
    await supabase.from('winners').update({ status }).eq('id', id)
    setMsg(`Winner ${status}!`)
    loadWinners()
    setTimeout(() => setMsg(''), 3000)
  }

  const statusColor = {
    pending: 'text-yellow-400 bg-yellow-900/20',
    approved: 'text-blue-400 bg-blue-900/20',
    rejected: 'text-red-400 bg-red-900/20',
    paid: 'text-green-400 bg-green-900/20'
  }

  return (
    <div className="min-h-screen bg-[#060d0a]">
      <nav className="border-b border-[#1a4731] px-6 py-4 flex items-center gap-6">
        <Link href="/admin" className="text-xl font-bold">Golf<span className="text-[#c9a84c]">Gives</span></Link>
        <Link href="/admin" className="nav-link text-sm">← Admin Home</Link>
      </nav>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Winner Verification</h1>
        <p className="text-gray-400 mb-8">Review, approve, and track prize payouts.</p>
        {msg && <p className="text-green-400 text-sm bg-green-900/20 p-3 rounded mb-6">{msg}</p>}
        <div className="flex gap-2 mb-8">
          {['all', 'pending', 'approved', 'paid', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded text-sm capitalize transition-colors ${filter === f ? 'bg-[#c9a84c] text-[#060d0a] font-bold' : 'border border-[#1a4731] text-gray-400 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {winners.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-gray-400">No {filter === 'all' ? '' : filter} winners found.</p>
            </div>
          ) : winners.map(w => (
            <div key={w.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold">{w.user?.full_name || 'Unknown'}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded capitalize ${statusColor[w.status] || ''}`}>{w.status}</span>
                    <span className="text-xs text-[#c9a84c] bg-[#c9a84c]/10 px-2 py-0.5 rounded">{w.match_type}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{w.user?.email}</p>
                  <p className="text-gray-400 text-sm">{months[(w.draw?.month || 1) - 1]} {w.draw?.year} Draw</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#c9a84c]">₹{parseFloat(w.prize_amount || 0).toLocaleString('en-IN')}</p>
                  <div className="flex gap-2 mt-3 justify-end">
                    {w.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(w.id, 'approved')} className="text-xs border border-green-800 text-green-400 px-3 py-1 rounded hover:bg-green-900/20">✓ Approve</button>
                        <button onClick={() => updateStatus(w.id, 'rejected')} className="text-xs border border-red-800 text-red-400 px-3 py-1 rounded hover:bg-red-900/20">✕ Reject</button>
                      </>
                    )}
                    {w.status === 'approved' && (
                      <button onClick={() => updateStatus(w.id, 'paid')} className="text-xs border border-[#c9a84c]/50 text-[#c9a84c] px-3 py-1 rounded hover:bg-[#c9a84c]/10">Mark as Paid</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
