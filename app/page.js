'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const charities = [
  { name: 'Children First Foundation', cause: 'Education & Healthcare', raised: '₹12,40,000', color: '#c9a84c' },
  { name: 'Green Earth Initiative', cause: 'Environmental Restoration', raised: '₹8,90,000', color: '#4a9e73' },
  { name: 'Veterans Support Network', cause: 'Mental Health & Finance', raised: '₹6,20,000', color: '#2d6a4f' },
  { name: 'Ocean Clean Project', cause: 'Marine Conservation', raised: '₹9,70,000', color: '#1a4731' },
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
          <p className="text-[#c9a84c] text-sm tracking-[0.2em] uppercase font-mono mb-6">Golf · Charity · Win</p>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">Every swing<br/><span className="text-[#c9a84c]">changes lives.</span></h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">Subscribe. Enter your scores. Win monthly prizes. And watch your game fuel real charitable impact — automatically, every month.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-gold text-lg py-4 px-8 inline-block text-center">Start Playing for Good</Link>
            <a href="#how" className="btn-outline text-lg py-4 px-8 inline-block text-center">See How It Works</a>
          </div>
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto border-t border-[#1a4731] pt-10">
            {[['₹37L+', 'Raised for Charity'], ['2,400+', 'Active Members'], ['48', 'Monthly Winners']].map(([n, l]) => (
              <div key={l}><p className="text-3xl font-bold text-
