import React, { useEffect, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { ModalDetailSchool } from './components/ModalDetailSchool';

// Eagerly loaded primary landing page
import { HomePage } from './pages/HomePage';

// Lazy loaded secondary & admin pages for optimal performance & tiny initial bundle
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SchoolsPage = React.lazy(() => import('./pages/SchoolsPage').then(m => ({ default: m.SchoolsPage })));
const NewsPage = React.lazy(() => import('./pages/NewsPage').then(m => ({ default: m.NewsPage })));
const NewsDetailPage = React.lazy(() => import('./pages/NewsDetailPage').then(m => ({ default: m.NewsDetailPage })));
const AnnouncementDetailPage = React.lazy(() => import('./pages/AnnouncementDetailPage').then(m => ({ default: m.AnnouncementDetailPage })));
const DownloadsPage = React.lazy(() => import('./pages/DownloadsPage').then(m => ({ default: m.DownloadsPage })));
const GalleryPage = React.lazy(() => import('./pages/GalleryPage').then(m => ({ default: m.GalleryPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const WebViewPage = React.lazy(() => import('./pages/WebViewPage').then(m => ({ default: m.WebViewPage })));
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4 space-y-3">
    <div className="w-9 h-9 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    <p className="text-xs font-semibold text-slate-500 animate-pulse">Memuat halaman...</p>
  </div>
);

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
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <AdminLogin />
      </Suspense>
    );
  }

  if (activeTab === 'admin-dashboard') {
    if (!isAuthenticated) {
      return (
        <Suspense fallback={<PageLoadingFallback />}>
          <AdminLogin />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <AdminDashboard />
      </Suspense>
    );
  }

  const isWebView = activeTab.startsWith('service-');

  // Public portal routing
  return (
    <div className={`flex flex-col ${isWebView ? 'h-screen overflow-hidden bg-white' : 'min-h-screen bg-slate-50 text-slate-800'}`}>
      {/* Sticky Navbar */}
      <Navbar />

      {/* Main Routed Page Content */}
      <main className={`flex-1 ${isWebView ? 'w-full h-[calc(100vh-74px)] overflow-hidden flex flex-col' : ''}`}>
        <Suspense fallback={<PageLoadingFallback />}>
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
        </Suspense>
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
