import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { ModalDetailSchool } from './components/ModalDetailSchool';

// Public Pages
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { SchoolsPage } from './pages/SchoolsPage';
import { NewsPage } from './pages/NewsPage';
import { NewsDetailPage } from './pages/NewsDetailPage';
import { AnnouncementDetailPage } from './pages/AnnouncementDetailPage';
import { DownloadsPage } from './pages/DownloadsPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { WebViewPage } from './pages/WebViewPage';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, isAuthenticated, selectedNews, selectedAnnouncement } = useApp();

  // Shortcut Keyboard Rahasia (Ctrl + Shift + A atau Alt + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) ||
        (e.altKey && (e.key === 'a' || e.key === 'A'))
      ) {
        e.preventDefault();
        setActiveTab(isAuthenticated ? 'admin-dashboard' : 'admin-login');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, setActiveTab]);

  // Admin routing
  if (activeTab === 'admin-login') {
    return <AdminLogin />;
  }

  if (activeTab === 'admin-dashboard') {
    if (!isAuthenticated) {
      return <AdminLogin />;
    }
    return <AdminDashboard />;
  }

  const isWebView = activeTab.startsWith('service-');

  // Public portal routing
  return (
    <div className={`flex flex-col ${isWebView ? 'h-screen overflow-hidden bg-white' : 'min-h-screen bg-slate-50 text-slate-800'}`}>
      {/* Sticky Navbar */}
      <Navbar />

      {/* Main Routed Page Content */}
      <main className={`flex-1 ${isWebView ? 'w-full h-[calc(100vh-74px)] overflow-hidden flex flex-col' : ''}`}>
        {/* Full Page News Detail atau Announcement Detail jika dipilih */}
        {selectedNews ? (
          <NewsDetailPage />
        ) : selectedAnnouncement ? (
          <AnnouncementDetailPage />
        ) : (
          <>
            {activeTab === 'home' && <HomePage />}
            {activeTab === 'profile' && <ProfilePage />}
            {activeTab === 'schools' && <SchoolsPage />}
            {activeTab === 'news' && <NewsPage />}
            {activeTab === 'downloads' && <DownloadsPage />}
            {activeTab === 'gallery' && <GalleryPage />}
            {activeTab === 'contact' && <ContactPage />}

            {/* Layanan Terpadu WebViews (Pure View) */}
            {activeTab === 'service-aula' && (
              <WebViewPage 
                title="Peminjaman Aula Korwilcam Purwodadi"
                url="https://peminjamanaulakorwilpwd.blogspot.com/"
                cropTop={56}
              />
            )}
            {activeTab === 'service-cuti' && (
              <WebViewPage 
                title="Layanan Surat Cuti GTK Online"
                url="https://www.cutikorwilpwd.online/"
              />
            )}
            {activeTab === 'service-survey' && (
              <WebViewPage 
                title="Survey Kepuasan Pelayanan Terpadu"
                url="https://pelayananterpadupwd.blogspot.com/"
                cropTop={95}
              />
            )}
          </>
        )}
      </main>

      {/* Institutional Footer (disembunyikan pada mode webview untuk mencegah double scroll) */}
      {!isWebView && <Footer />}

      {/* Interactive Global Modals */}
      <ModalDetailSchool />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
