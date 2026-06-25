'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [stats, setStats] = useState({ users: 0, active: 0, pool: 0, charity: 0, draws: 0, pending: 0 })
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (prof?.role !== 'admin') { router.push('/dashboard'); return }

    const [{ count: total }, { count: active }, { data: users }, { count: draws }, { count: pending }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
      supabase.from('profiles').select('full_name, email, subscription_status, subscription_plan, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('draws').select('*', { count: 'exact', head: true }),
      supabase.from('winners').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ])

    const pool = (active || 0) * 999 * 0.5
    const charity = (active || 0) * 999 * 0.1
    setStats({ users: total || 0, active: active || 0, pool, charity, draws: draws || 0, pending: pending || 0 })
    setRecentUsers(users || [])
    setLoading(false)
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/') }

  if (loading) return <div className="min-h-screen bg-[#060d0a] flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>

  return (
    <div className="min-h-screen bg-[#060d0a]">
      <nav className="border-b border-[#1a4731] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">Golf<span className="text-[#c9a84c]">Gives</span> <span className="text-xs text-gray-500 font-mono ml-2">ADMIN</span></Link>
        <div className="flex items-center gap-6">
          <Link href="/admin/users" className="nav-link text-sm">Users</Link>
          <Link href="/admin/draws" className="nav-link text-sm">Draws</Link>
          <Link href="/admin/charities" className="nav-link text-sm">Charities</Link>
          <Link href="/admin/winners" className="nav-link text-sm">Winners</Link>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 text-sm">Logout</button>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-400 mb-10">Platform overview and controls</p>
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Users', value: stats.users, icon: '👥' },
            { label: 'Active Subscribers', value: stats.active, icon: '✅' },
            { label: 'Total Prize Pool', value: `₹${Math.round(stats.pool).toLocaleString('en-IN')}`, icon: '🏆' },
            { label: 'Charity Contributions', value: `₹${Math.round(stats.charity).toLocaleString('en-IN')}`, icon: '❤️' },
            { label: 'Draws Run', value: stats.draws, icon: '🎲' },
            { label: 'Pending Verifications', value: stats.pending, icon: '🔍', alert: stats.pending > 0 },
          ].map(s => (
            <div key={s.label} className={`card ${s.alert ? 'border-[#c9a84c]' : ''}`}>
              <p className="text-2xl mb-2">{s.icon}</p>
              <p className="text-gray-400 text-sm">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.alert ? 'text-[#c9a84c]' : 'text-white'}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          {[
            { href: '/admin/users', label: 'Manage Users', icon: '👥', desc: 'View, edit, manage subscriptions' },
            { href: '/admin/draws', label: 'Run Draw', icon: '🎲', desc: 'Configure and publish monthly draws' },
            { href: '/admin/charities', label: 'Charities', icon: '❤️', desc: 'Add, edit, feature charities' },
            { href: '/admin/winners', label: 'Winners', icon: '🏆', desc: 'Verify winners and mark payouts' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="card hover:border-[#c9a84c] transition-colors block">
              <p className="text-3xl mb-3">{l.icon}</p>
              <p className="font-bold mb-1">{l.label}</p>
              <p className="text-gray-400 text-sm">{l.desc}</p>
            </Link>
          ))}
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg">Recent Signups</h2>
            <Link href="/admin/users" className="text-[#c9a84c] text-sm hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-[#1a4731]">
                  <th className="text-left py-3">Name</th>
                  <th className="text-left py-3">Email</th>
                  <th className="text-left py-3">Plan</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(u => (
                  <tr key={u.email} className="border-b border-[#1a4731]/50">
                    <td className="py-3 font-medium">{u.full_name || '—'}</td>
                    <td className="py-3 text-gray-400">{u.email}</td>
                    <td className="py-3 capitalize">{u.subscription_plan || '—'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${u.subscription_status === 'active' ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-400'}`}>{u.subscription_status}</span>
                    </td>
                    <td className="py-3 text-gray-400">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
