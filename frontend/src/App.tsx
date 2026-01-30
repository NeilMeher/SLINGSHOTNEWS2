import React, { useState, useEffect } from 'react'
import { OnboardingFlow } from './components/onboarding/OnboardingFlow'
import { ProfilePage } from './components/profile/ProfilePage'
import { SettingsPanel } from './components/settings/SettingsPanel'
import { VerifyEmail } from './components/auth/VerifyEmail'
import { VerificationBanner } from './components/auth/VerificationBanner'
import { AuthForm } from './components/auth/AuthForm'
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

  const handleAuthSuccess = () => {
    refreshAuth();
  };

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
    return <AuthForm onSuccess={handleAuthSuccess} />;
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
