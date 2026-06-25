'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

export default function AdminUsersPage() {
  const supabase = createClient()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    const { data } = await supabase.from('profiles').select('*, charity:charity_id(name)').order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    await supabase.from('profiles').update({ subscription_status: status }).eq('id', id)
    loadUsers()
  }

  const setAdmin = async (id, isAdmin) => {
    await supabase.from('profiles').update({ role: isAdmin ? 'admin' : 'subscriber' }).eq('id', id)
    loadUsers()
  }

  const filtered = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#060d0a]">
      <nav className="border-b border-[#1a4731] px-6 py-4 flex items-center gap-6">
        <Link href="/admin" className="text-xl font-bold">Golf<span className="text-[#c9a84c]">Gives</span></Link>
        <Link href="/admin" className="nav-link text-sm">← Admin Home</Link>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-gray-400 mb-8">View and manage all subscribers</p>
        <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="input-field max-w-md mb-6" />
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-[#1a4731]">
                <th className="text-left py-3">Name</th>
                <th className="text-left py-3">Email</th>
                <th className="text-left py-3">Plan</th>
                <th className="text-left py-3">Status</th>
                <th className="text-left py-3">Role</th>
                <th className="text-left py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="border-b border-[#1a4731]/50 hover:bg-[#1a4731]/20">
                  <td className="py-3 font-medium">{u.full_name || '—'}</td>
                  <td className="py-3 text-gray-400 text-xs">{u.email}</td>
                  <td className="py-3 capitalize text-xs">{u.subscription_plan || '—'}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${u.subscription_status === 'active' ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                      {u.subscription_status}
                    </span>
                  </td>
                  <td className="py-3 text-xs">
                    <span className={`px-2 py-1 rounded ${u.role === 'admin' ? 'bg-[#c9a84c]/20 text-[#c9a84c]' : 'bg-gray-800 text-gray-400'}`}>{u.role}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      {u.subscription_status === 'active' ? (
                        <button onClick={() => updateStatus(u.id, 'inactive')} className="text-xs border border-red-800 text-red-400 px-2 py-1 rounded hover:bg-red-900/20">Deactivate</button>
                      ) : (
                        <button onClick={() => updateStatus(u.id, 'active')} className="text-xs border border-green-800 text-green-400 px-2 py-1 rounded hover:bg-green-900/20">Activate</button>
                      )}
                      <button onClick={() => setAdmin(u.id, u.role !== 'admin')} className="text-xs border border-[#c9a84c]/40 text-[#c9a84c] px-2 py-1 rounded hover:bg-[#c9a84c]/10">
                        {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
