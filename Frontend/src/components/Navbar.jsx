import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { useTheme } from '../hooks/useTheme.js'

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
  }`

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setOpen(false)
    navigate('/')
  }

  const closeMenu = () => setOpen(false)

  const links = user ? (
    <>
      <NavLink onClick={closeMenu} className={navLinkClass} to="/dashboard">Dashboard</NavLink>
      <NavLink onClick={closeMenu} className={navLinkClass} to="/create">Create</NavLink>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-md px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <NavLink onClick={closeMenu} className={navLinkClass} to="/login">Login</NavLink>
      <Link
        onClick={closeMenu}
        to="/register"
        className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
      >
        Sign up
      </Link>
    </>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-sm font-black text-white">
            P
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-950">PulsePoll</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Toggle dark mode"
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-md border border-slate-300 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            {theme === 'dark' ? 'L' : 'D'}
          </button>
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="grid h-10 w-10 place-items-center rounded-md border border-slate-300 text-slate-700 sm:hidden"
          >
            <span className="h-0.5 w-5 bg-current shadow-[0_6px_0_currentColor,0_-6px_0_currentColor]" />
          </button>
        </div>

        <nav className="hidden items-center gap-2 sm:flex">
          {links}
        </nav>
      </div>
      {open && (
        <nav className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-slate-200 px-4 py-3 sm:hidden">
          {links}
        </nav>
      )}
    </header>
  )
}
