import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Analytics from './pages/Analytics.jsx'
import CreatePoll from './pages/CreatePoll.jsx'
import Dashboard from './pages/Dashboard.jsx'
import EditPoll from './pages/EditPoll.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import PollPage from './pages/PollPage.jsx'
import Register from './pages/Register.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'

export default function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main key={location.pathname} className="animate-page-enter">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/poll/:slug" element={<PollPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<CreatePoll />} />
            <Route path="/edit/:pollId" element={<EditPoll />} />
            <Route path="/analytics/:pollId" element={<Analytics />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
