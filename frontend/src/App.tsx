import React, { useState, useEffect } from 'react'
import { OnboardingFlow } from './components/onboarding/OnboardingFlow'
import { ProfilePage } from './components/profile/ProfilePage'
import { SettingsPanel } from './components/settings/SettingsPanel'
import { VerifyEmail } from './components/auth/VerifyEmail'
import { VerificationBanner } from './components/auth/VerificationBanner'
import { AdminPanel } from './components/admin/AdminPanel'
import { VerticalNewsFeed } from './components/feed/VerticalNewsFeed'
import { SavedPage } from './pages/SavedPage'
import { SearchPage } from './pages/SearchPage'
import { useAuth } from './hooks/useAuth'
import { authService } from './services/authService'

type PageType = 'home' | 'trending' | 'profile' | 'saved' | 'search';

const App: React.FC = () => {
  const { user, isAdmin, refreshAuth } = useAuth()
  const [isAuthenticated, setIsAuthenticated] = useState(!!authService.getToken())
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [currentPage, setCurrentPage] = useState<PageType>('home')

  // Simple Router logic for verify-email
  const path = window.location.pathname;
  const verifyToken = path.startsWith('/verify-email/') ? path.split('/')[2] : null;

  // Sync isAuthenticated with useAuth
  useEffect(() => {
    setIsAuthenticated(!!user)
  }, [user])

  // Check onboarding status on mount or auth change
  useEffect(() => {
    const checkStatus = async () => {
      if (isAuthenticated) {
        try {
          const status = await authService.checkOnboarding();
          if (!status.completed) {
            setShowOnboarding(true);
          }
        } catch (err) {
          console.error('Failed to check onboarding status', err);
        }
      }
    };
    checkStatus();
  }, [isAuthenticated]);

  const handleLogin = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `user_${Date.now()}@example.com`,
        password: 'Password123!',
        username: `temp_${Math.floor(Math.random() * 10000)}`,
        dateOfBirth: '2000-01-01'
      })
    });

    const result = await response.json();
    if (result.success) {
      authService.setToken(result.data.tokens.accessToken);
      refreshAuth();
    } else {
      alert(result.message || 'Signup failed 💀');
    }
  }

  const handleLogout = () => {
    authService.logout();
    refreshAuth();
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    window.location.reload();
  };

  const handleNavigate = (page: 'home' | 'trending' | 'profile') => {
    if (page === 'profile') {
      setCurrentPage('profile');
    } else {
      setCurrentPage(page);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0791ed]/20 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] -ml-48 -mb-48" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-none tracking-tight drop-shadow-2xl">SLINGSHOT</h1>
            <span className="text-[12px] font-bold tracking-[0.4em] text-[#0791ed] mt-2 drop-shadow-md">NEWS</span>
          </div>
          <p className="text-white/40 mb-12 text-xl font-medium max-w-sm lowercase">
            news that actually hits different fr fr. no cap. 🚀
          </p>
          <button
            onClick={handleLogin}
            className="group relative px-12 py-5 bg-white text-black font-black text-2xl rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
          >
            <span className="relative z-10">get started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0791ed] to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
          </button>
        </div>
      </div>
    )
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="h-screen bg-black text-white overflow-hidden">
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      {currentPage === 'search' ? (
        <SearchPage onBack={() => setCurrentPage('home')} />
      ) : currentPage === 'saved' ? (
        <SavedPage onBack={() => setCurrentPage('home')} />
      ) : currentPage === 'profile' ? (
        <ProfilePage onClose={() => setCurrentPage('home')} />
      ) : (
        <VerticalNewsFeed
          feedType={currentPage === 'trending' ? 'trending' : 'latest'}
          onNavigate={handleNavigate}
          activePage={currentPage as 'home' | 'trending' | 'profile'}
        />
      )}

      {/* Verification Flow */}
      {verifyToken && (
        <VerifyEmail
          token={verifyToken}
          onComplete={() => {
            window.history.replaceState({}, '', '/');
            refreshAuth();
          }}
        />
      )}

      {isAuthenticated && !verifyToken && currentPage === 'home' && (
        <VerificationBanner user={user} onRefresh={refreshAuth} />
      )}
    </div>
  )
}

export default App
