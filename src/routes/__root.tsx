import { createRootRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { cn } from '@/lib/utils'
import { GITHUB_URL, TWITTER_URL, TWITTER_HANDLE } from '@/lib/constants'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <div className="min-h-screen flex flex-col bg-horror-black relative overflow-x-hidden">
        {/* Ambient glow effects - more subtle */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-horror-red/3 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-horror-orange/3 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <Header />
        <main className="flex-1 relative z-10">
          <Outlet />
        </main>
        <Footer />
      </div>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  )
}

function Header() {
  const router = useRouterState()
  const isHome = router.location.pathname === '/'
  const isContribute = router.location.pathname === '/contribute'

  return (
    <header className="sticky top-0 z-50 border-b border-horror-red/20 bg-horror-black/95 backdrop-blur-2xl">
      {/* Top danger stripe - more subtle */}
      <div className="h-px bg-gradient-to-r from-transparent via-horror-red/50 to-transparent" />

      <div className="container mx-auto px-4 md:px-6 py-4 md:py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3 relative">
            <div className="absolute -inset-2 bg-horror-red/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <h1 className="font-display text-3xl md:text-4xl xl:text-5xl text-horror-red relative z-10 tracking-tighter group-hover:animate-glitch">
              AI HORRORS
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-wrap gap-2 md:gap-3">
            <Link
              to="/"
              className={cn(
                "relative px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-bold uppercase tracking-widest transition-all duration-200",
                isHome
                  ? "bg-horror-orange text-horror-black border border-horror-orange"
                  : "bg-horror-gray border border-horror-orange/30 text-gray-300 hover:text-white hover:border-horror-orange/60"
              )}
            >
              All Stories
            </Link>
            <Link
              to="/contribute"
              className={cn(
                "relative px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-bold uppercase tracking-widest transition-all duration-200",
                isContribute
                  ? "bg-horror-orange text-horror-black border border-horror-orange"
                  : "bg-horror-gray border border-horror-orange/30 text-gray-300 hover:text-white hover:border-horror-orange/60"
              )}
            >
              Submit
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="relative px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-bold uppercase tracking-widest transition-all duration-200 bg-horror-gray border border-horror-red/30 text-gray-300 hover:text-white hover:border-horror-red/60"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="relative border-t border-horror-red/20 bg-horror-gray/50 backdrop-blur-xl py-12 md:py-16 mt-24">
      {/* Top glow line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-horror-red/30 to-transparent" />

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 text-center md:text-left">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl text-horror-red mb-3 tracking-tight">AI HORRORS</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              A community-curated archive of real AI disasters. Learn from production failures before they happen to you.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-4">Navigate</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-500 hover:text-horror-orange transition-colors">All Stories</Link></li>
              <li><Link to="/contribute" className="text-gray-500 hover:text-horror-orange transition-colors">Submit Story</Link></li>
              <li><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-horror-orange transition-colors">GitHub</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-4">Community</h4>
            <div className="space-y-2 text-sm">
              <p className="text-gray-500">Built with ⚡ by developers</p>
              <p className="text-gray-500">Open source & community-driven</p>
              <div className="flex items-center gap-3 mt-3">
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-horror-red hover:text-horror-orange transition-colors font-bold">
                  GitHub →
                </a>
                <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-horror-orange transition-colors">
                  {TWITTER_HANDLE}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-horror-red/20 text-center">
          <p className="text-gray-600 text-xs">
            © 2026 AI HORRORS. Every horror story is a lesson learned.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Created by{' '}
            <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer" className="text-horror-red hover:text-horror-orange transition-colors">
              {TWITTER_HANDLE}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
