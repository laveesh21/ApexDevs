import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BottomNav from './components/BottomNav'
import MobileNavbar from './components/MobileNavbar'
import Homepage from './pages/Homepage'
import About from './pages/About'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProjectDetail from './pages/ProjectDetail'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import PublicProfile from './pages/PublicProfile'
import Connections from './pages/Connections'
import Community from './pages/Community'
import ThreadDetail from './pages/ThreadDetail'
import Chat from './pages/Chat'
import Settings from './pages/Settings'
// import './App.css'

function AppContent() {
  const { loading } = useAuth();
  const location = useLocation();
  const hideFooter = location.pathname.startsWith('/chat');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col pb-14 md:pb-0">
      <Navbar />
      <MobileNavbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<About />} />
        <Route path="/community" element={<Community />} />
        <Route path="/thread/:id" element={<ThreadDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />0
        <Route path="/profile/connections" element={<Connections />} />
        <Route path="/user/:userId" element={<PublicProfile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:userId" element={<Chat />} />
      </Routes>
      {!hideFooter && <Footer />}
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App