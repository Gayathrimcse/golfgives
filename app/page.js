'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const charities = [
  { name: 'Children First Foundation', cause: 'Education & Healthcare', raised: 'Rs 12,40,000', color: '#c9a84c' },
  { name: 'Green Earth Initiative', cause: 'Environmental Restoration', raised: 'Rs 8,90,000', color: '#4a9e73' },
  { name: 'Veterans Support Network', cause: 'Mental Health & Finance', raised: 'Rs 6,20,000', color: '#2d6a4f' },
  { name: 'Ocean Clean Project', cause: 'Marine Conservation', raised: 'Rs 9,70,000', color: '#1a4731' },
]

const steps = [
  { n: '01', title: 'Subscribe', desc: 'Choose a monthly or yearly plan. A portion of every subscription goes directly to your chosen charity.' },
  { n: '02', title: 'Enter Your Scores', desc: 'Log your last 5 golf scores in Stableford format. Your scores determine your draw entries.' },
  { n: '03', title: 'Join the Draw', desc: 'Every month, numbers are drawn. Match 3, 4, or all 5 to win your share of the prize pool.' },
  { n: '04', title: 'Give Back', desc: 'Win or lose, a minimum 10% of your subscription fuels real charitable change. You choose where it goes.' },
]

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#060d0a] text-[#f0f0e8]">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#060d0a]/95 backdrop-blur border-b border-[#1a4731]' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-[#c9a84c] text-2xl font-bold tracking-tight">Golf<span className="text-white">Gives</span></span>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="nav-link text-sm">How It Works</a>
            <a href="#charities" className="nav-link text-sm">Charities</a>
            <a href="#prizes" className="nav-link text-sm">Prizes</a>
            <Link href="/auth/login" className="nav-link text-sm">Login</Link>
            <Link href="/auth/signup" className="btn-gold text-sm py-2 px-5">Join Now</Link>
          </div>
          <Link href="/auth/signup" className="md:hidden btn-gold text-sm py-2 px-4">Join</Link>
        </div>
      </nav>

      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#c9a84c] text-sm tracking-[0.2em] uppercase font-mono mb-6">Golf - Charity - Win</p>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">Every swing<br/><span className="text-[#c9a84c]">changes lives.</span></h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">Subscribe. Enter your scores. Win monthly prizes. And watch your game fuel real charitable impact every month.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-gold text-lg py-4 px-8 inline-block text-center">Start Playing for Good</Link>
            <a href="#how" className="btn-outline text-lg py-4 px-8 inline-block text-center">See How It Works</a>
          </div>
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto border-t border-[#1a4731] pt-10">
            {[['Rs 37L+', 'Raised for Charity'], ['2,400+', 'Active Members'], ['48', 'Monthly Winners']].map(([n, l]) => (
              <div key={l}><p className="text-3xl font-bold text-[#c9a84c]">{n}</p><p className="text-gray-400 text-sm mt-1">{l}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-24 px-6 bg-[#0a1510]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#c9a84c] text-sm tracking-[0.2em] uppercase font-mono text-center mb-4">The Process</p>
          <h2 className="text-4xl font-bold text-center mb-16">Simple. Impactful. Rewarding.</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="card hover:border-[#c9a84c] transition-colors">
                <p className="text-[#c9a84c] font-mono text-3xl font-bold mb-4">{s.n}</p>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="prizes" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#c9a84c] text-sm tracking-[0.2em] uppercase font-mono text-center mb-4">Prize Pools</p>
          <h2 className="text-4xl font-bold text-center mb-4">Win every month.</h2>
          <p className="text-gray-400 text-center mb-16">Three tiers. Real cash prizes. Jackpot rolls over if unclaimed.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { match: '5-Number Match', share: '40%', highlight: true },
              { match: '4-Number Match', share: '35%', highlight: false },
              { match: '3-Number Match', share: '25%', highlight: false },
            ].map((p) => (
              <div key={p.match} className={`card text-center ${p.highlight ? 'border-[#c9a84c] bg-[#1a2d1f]' : ''}`}>
                {p.highlight && <p className="text-[#c9a84c] text-xs font-mono uppercase tracking-widest mb-3">Jackpot</p>}
                <p className="text-5xl font-bold text-[#c9a84c] mb-2">{p.share}</p>
                <p className="text-sm text-gray-400 mb-1">of prize pool</p>
                <p className="font-semibold mt-4">{p.match}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="charities" className="py-24 px-6 bg-[#0a1510]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#c9a84c] text-sm tracking-[0.2em] uppercase font-mono text-center mb-4">Give Back</p>
          <h2 className="text-4xl font-bold text-center mb-4">You choose where it goes.</h2>
          <p className="text-gray-400 text-center mb-16">At least 10% of your subscription goes to your chosen charity every month.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {charities.map((c) => (
              <div key={c.name} className="card hover:border-[#c9a84c] transition-all hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-full mb-4" style={{ background: c.color + '30', border: `2px solid ${c.color}` }} />
                <h3 className="font-bold mb-1">{c.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{c.cause}</p>
                <p className="text-[#c9a84c] text-sm font-mono">{c.raised} raised</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#c9a84c] text-sm tracking-[0.2em] uppercase font-mono mb-4">Subscription Plans</p>
          <h2 className="text-4xl font-bold mb-16">Join the community.</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { plan: 'Monthly', price: 'Rs 999', period: '/month', features: ['Monthly draw entry', 'Score tracking (5 scores)', 'Charity contribution', 'Win sharing'] },
              { plan: 'Yearly', price: 'Rs 8,999', period: '/year', features: ['All Monthly features', '12x draw entries', 'Priority support', 'Exclusive yearly badge'], highlight: true },
            ].map((p) => (
              <div key={p.plan} className={`card text-left ${p.highlight ? 'border-[#c9a84c] bg-[#1a2d1f]' : ''}`}>
                {p.highlight && <p className="text-[#c9a84c] text-xs font-mono uppercase tracking-widest mb-3">Best Value</p>}
                <h3 className="text-2xl font-bold mb-1">{p.plan}</h3>
                <p className="text-4xl font-bold text-[#c9a84c] mt-3">{p.price}<span className="text-gray-400 text-base font-normal">{p.period}</span></p>
                <ul className="space-y-2 my-6">
                  {p.features.map(f => <li key={f} className="flex items-center gap-2 text-sm"><span className="text-[#c9a84c]">✓</span> {f}</li>)}
                </ul>
                <Link href="/auth/signup" className={p.highlight ? 'btn-gold w-full text-center block' : 'btn-outline w-full text-center block'}>Get Started</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#1a4731] py-10 px-6 text-center">
        <p className="text-3xl font-bold mb-2">Golf<span className="text-[#c9a84c]">Gives</span></p>
        <p className="text-gray-400 text-sm mb-6">Play. Win. Give.</p>
        <div className="flex justify-center gap-8 text-sm text-gray-400">
          <Link href="/auth/login" className="hover:text-[#c9a84c]">Login</Link>
          <Link href="/auth/signup" className="hover:text-[#c9a84c]">Sign Up</Link>
        </div>
        <p className="text-gray-600 text-xs mt-8">2026 GolfGives - Built for Digital Heroes</p>
      </footer>
    </div>
  )
}
