import React, { useState, useEffect, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { ModalDetailSchool } from './components/ModalDetailSchool';
import { ModernNoticeModal } from './components/ModernNoticeModal';
import { NotificationPrompt } from './components/NotificationPrompt';

// Eagerly loaded primary landing page
import { HomePage } from './pages/HomePage';

// Lazy loaded secondary & admin pages for optimal performance & tiny initial bundle
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SOPPage = React.lazy(() => import('./pages/SOPPage').then(m => ({ default: m.SOPPage })));
const SchoolsPage = React.lazy(() => import('./pages/SchoolsPage').then(m => ({ default: m.SchoolsPage })));
const NominativePage = React.lazy(() => import('./pages/NominativePage').then(m => ({ default: m.NominativePage })));
const NewsPage = React.lazy(() => import('./pages/NewsPage').then(m => ({ default: m.NewsPage })));
const NewsDetailPage = React.lazy(() => import('./pages/NewsDetailPage').then(m => ({ default: m.NewsDetailPage })));
const AchievementsPage = React.lazy(() => import('./pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const AnnouncementDetailPage = React.lazy(() => import('./pages/AnnouncementDetailPage').then(m => ({ default: m.AnnouncementDetailPage })));
const OrganizationPage = React.lazy(() => import('./pages/OrganizationPage').then(m => ({ default: m.OrganizationPage })));
const DownloadsPage = React.lazy(() => import('./pages/DownloadsPage').then(m => ({ default: m.DownloadsPage })));
const DocumentDetailPage = React.lazy(() => import('./pages/DocumentDetailPage').then(m => ({ default: m.DocumentDetailPage })));
const GalleryPage = React.lazy(() => import('./pages/GalleryPage').then(m => ({ default: m.GalleryPage })));
const GalleryDetailPage = React.lazy(() => import('./pages/GalleryDetailPage').then(m => ({ default: m.GalleryDetailPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const SocialMediaPage = React.lazy(() => import('./pages/SocialMediaPage').then(m => ({ default: m.SocialMediaPage })));
const DataRequestPage = React.lazy(() => import('./pages/DataRequestPage').then(m => ({ default: m.DataRequestPage })));
const WebViewPage = React.lazy(() => import('./pages/WebViewPage').then(m => ({ default: m.WebViewPage })));
const ServiceRequirementsPage = React.lazy(() => import('./pages/ServiceRequirementsPage').then(m => ({ default: m.ServiceRequirementsPage })));
const ServiceRequirementDetailPage = React.lazy(() => import('./pages/ServiceRequirementDetailPage').then(m => ({ default: m.ServiceRequirementDetailPage })));
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

const WEBVIEW_SERVICES = [
  {
    id: 'service-aula',
    title: 'Peminjaman Aula Korwilcam Purwodadi',
    url: 'https://peminjamanaulakorwilpwd.blogspot.com/',
    cropTop: 56
  },
  {
    id: 'service-cuti',
    title: 'Layanan Surat Cuti GTK Online',
    url: 'https://www.cutikorwilpwd.online/',
    cropTop: 0
  },
  {
    id: 'service-survey',
    title: 'Survey Kepuasan Pelayanan Terpadu',
    url: 'https://pelayananterpadupwd.blogspot.com/',
    cropTop: 95
  }
];

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4 space-y-3">
    <div className="w-9 h-9 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    <p className="text-xs font-semibold text-slate-500 animate-pulse">Memuat halaman...</p>
  </div>
);

const MainContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    isAuthenticated, 
    selectedNews, 
    selectedAnnouncement, 
    selectedGallery, 
    selectedDocument,
    selectedServiceRequirement 
  } = useApp();

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

  // Melacak webview mana saja yang sudah pernah dimount agar tetap hidup di memori (keep-alive)
  const [visitedWebViews, setVisitedWebViews] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (WEBVIEW_SERVICES.some((s) => s.id === activeTab)) {
      initial[activeTab] = true;
    }
    return initial;
  });

  useEffect(() => {
    if (WEBVIEW_SERVICES.some((s) => s.id === activeTab)) {
      setVisitedWebViews((prev) => (prev[activeTab] ? prev : { ...prev, [activeTab]: true }));
    }
  }, [activeTab]);

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

  const isWebView = WEBVIEW_SERVICES.some((s) => s.id === activeTab) || activeTab === 'service-permintaan-data';

  // Public portal routing
  return (
    <div className={`flex flex-col ${isWebView ? 'h-screen overflow-hidden bg-white' : 'min-h-screen bg-slate-50 text-slate-800'}`}>
      {/* Sticky Navbar */}
      <Navbar />

      {/* Main Routed Page Content */}
      <main className={`flex-1 ${isWebView ? 'w-full h-[calc(100vh-74px)] overflow-hidden flex flex-col' : ''}`}>
        <Suspense fallback={<PageLoadingFallback />}>
          {/* Halaman Standar (Beranda, Profil, SOP, Direktori Sekolah, Berita, Unduhan, Galeri, Kontak) */}
          {selectedNews ? (
            <NewsDetailPage />
          ) : selectedAnnouncement ? (
            <AnnouncementDetailPage />
          ) : selectedGallery ? (
            <GalleryDetailPage />
          ) : selectedDocument ? (
            <DocumentDetailPage />
          ) : selectedServiceRequirement ? (
            <ServiceRequirementDetailPage />
          ) : activeTab === 'service-permintaan-data' ? (
            <DataRequestPage />
          ) : !isWebView ? (
            <>
              {activeTab === 'home' && <HomePage />}
              {activeTab === 'profile' && <ProfilePage />}
              {activeTab === 'sop-pelayanan' && <SOPPage />}
              {activeTab === 'schools' && <SchoolsPage />}
              {(activeTab === 'nominatif' || activeTab === 'nominative') && <NominativePage />}
              {activeTab === 'news' && <NewsPage />}
              {(activeTab === 'achievements' || activeTab === 'prestasi') && <AchievementsPage />}
              {activeTab === 'organization' && <OrganizationPage />}
              {activeTab === 'service-requirements' && <ServiceRequirementsPage />}
              {activeTab === 'downloads' && <DownloadsPage />}
              {activeTab === 'gallery' && <GalleryPage />}
              {activeTab === 'contact' && <ContactPage />}
              {activeTab === 'social-media' && <SocialMediaPage />}
            </>
          ) : null}

          {/* Layanan Terpadu WebViews (Keep-Alive: Tetap hidup di memori DOM tanpa unmount atau reload ulang) */}
          {WEBVIEW_SERVICES.map((service) => {
            const isMounted = visitedWebViews[service.id];
            if (!isMounted) return null;

            const isCurrentActive =
              activeTab === service.id &&
              !selectedNews &&
              !selectedAnnouncement &&
              !selectedGallery &&
              !selectedDocument &&
              !selectedServiceRequirement;

            return (
              <div
                key={service.id}
                className={
                  isCurrentActive
                    ? 'w-full h-full flex-1 flex flex-col relative z-10'
                    : 'invisible absolute inset-0 -z-10 pointer-events-none'
                }
                aria-hidden={!isCurrentActive}
              >
                <WebViewPage 
                  title={service.title}
                  url={service.url}
                  cropTop={service.cropTop}
                />
              </div>
            );
          })}
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
      <ModernNoticeModal />
      <NotificationPrompt />
    </AppProvider>
  );
}

export default App;
