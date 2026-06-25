import './globals.css'

export const metadata = {
  title: 'GolfGives — Play. Win. Give.',
  description: 'A subscription golf platform combining performance tracking, monthly prize draws, and charitable giving.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
