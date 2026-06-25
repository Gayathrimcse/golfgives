'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

export default function AdminCharitiesPage() {
  const supabase = createClient()
  const [charities, setCharities] = useState([])
  const [form, setForm] = useState({ name: '', description: '', image_url: '', featured: false })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { loadCharities() }, [])

  const loadCharities = async () => {
    const { data } = await supabase.from('charities').select('*').order('featured', { ascending: false })
    setCharities(data || [])
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('charities').insert({ ...form, active: true })
    if (error) { setMsg('Error: ' + error.message) } else {
      setMsg('Charity added!')
      setForm({ name: '', description: '', image_url: '', featured: false })
      setShowForm(false)
      loadCharities()
    }
    setLoading(false)
  }

  const toggleFeatured = async (id, val) => {
    await supabase.from('charities').update({ featured: !val }).eq('id', id)
    loadCharities()
  }

  const toggleActive = async (id, val) => {
    await supabase.from('charities').update({ active: !val }).eq('id', id)
    loadCharities()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this charity?')) return
    await supabase.from('charities').delete().eq('id', id)
    loadCharities()
  }

  return (
    <div className="min-h-screen bg-[#060d0a]">
      <nav className="border-b border-[#1a4731] px-6 py-4 flex items-center gap-6">
        <Link href="/admin" className="text-xl font-bold">Golf<span className="text-[#c9a84c]">Gives</span></Link>
        <Link href="/admin" className="nav-link text-sm">← Admin Home</Link>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Charity Management</h1>
            <p className="text-gray-400">Add, edit, and feature charities.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-gold">+ Add Charity</button>
        </div>
        {showForm && (
          <div className="card mb-8">
            <h2 className="font-bold text-lg mb-5">Add New Charity</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Charity Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input-field" placeholder="e.g. Children First Foundation" required />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="input-field h-24 resize-none" placeholder="What does this charity do?" required />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Image URL (optional)</label>
                <input type="url" value={form.image_url} onChange={e => setForm(f => ({...f, image_url: e.target.value}))} className="input-field" placeholder="https://..." />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({...f, featured: e.target.checked}))} className="accent-[#c9a84c] w-4 h-4" />
                <span className="text-sm text-gray-400">Feature on homepage</span>
              </label>
              {msg && <p className="text-green-400 text-sm">{msg}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="btn-gold">{loading ? 'Saving...' : 'Add Charity'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        )}
        <div className="space-y-4">
          {charities.map(c => (
            <div key={c.id} className={`card flex items-start justify-between gap-4 ${!c.active ? 'opacity-50' : ''}`}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold">{c.name}</h3>
                  {c.featured && <span className="text-xs bg-[#c9a84c]/20 text-[#c9a84c] px-2 py-0.5 rounded">Featured</span>}
                  {!c.active && <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">Inactive</span>}
                </div>
                <p className="text-gray-400 text-sm">{c.description}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => toggleFeatured(c.id, c.featured)} className="text-xs border border-[#c9a84c]/40 text-[#c9a84c] px-2 py-1 rounded hover:bg-[#c9a84c]/10">
                  {c.featured ? 'Unfeature' : 'Feature'}
                </button>
                <button onClick={() => toggleActive(c.id, c.active)} className="text-xs border border-gray-700 text-gray-400 px-2 py-1 rounded hover:bg-gray-800">
                  {c.active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleDelete(c.id)} className="text-xs border border-red-800 text-red-400 px-2 py-1 rounded hover:bg-red-900/20">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
