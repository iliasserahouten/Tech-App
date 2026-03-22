import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, LogOut, Home, Library, ScanLine, Settings, History } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import styles from './Layout.module.css';

// ── Hook PWA install prompt ────────────────────────────────────────────────────
function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const triggerInstall = async () => {
    if (!promptEvent) return;
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setPromptEvent(null);
  };

  return { canInstall: !!promptEvent && !isInstalled, triggerInstall };
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { canInstall, triggerInstall } = useInstallPrompt();
  const [showBanner, setShowBanner] = useState(true);

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Accueil',    icon: Home     },
    { path: '/books',     label: 'Livres',     icon: Library  },
    { path: '/scan',      label: 'Scan',       icon: ScanLine },
    { path: '/gestion',   label: 'Gestion',    icon: Settings },
    { path: '/history',   label: 'Historique', icon: History  },
  ];

  return (
    <div className={styles.layoutContainer}>

      {/* ── Bannière install PWA (Android/Chrome) ── */}
      {canInstall && showBanner && (
        <div className={styles.installBanner}>
          <BookOpen size={20} className={styles.installIcon} />
          <div className={styles.installText}>
            <strong>Installer l'app</strong>
            <span>Accès rapide au scan depuis votre téléphone</span>
          </div>
          <button className={styles.installBtn} onClick={async () => { await triggerInstall(); setShowBanner(false); }}>
            Installer
          </button>
          <button className={styles.installDismiss} onClick={() => setShowBanner(false)}>✕</button>
        </div>
      )}

      {/* ── Header desktop ── */}
      <header className={styles.header}>
        <div className={styles.headerContent}>

          {/* Logo */}
          <div className={styles.logoSection}>
            <BookOpen className={styles.logoIcon} />
            <span className={styles.logoText}>Bibliothèque</span>
          </div>

          {/* Nav desktop — cachée sur mobile via CSS */}
          <nav className={styles.navigation}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User + logout */}
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email}
                </span>
              </div>
            </div>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <LogOut size={20} />
              <span>Déconnexion</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── Contenu principal ── */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>

      {/* ── Bottom Navigation mobile — visible uniquement sur mobile via CSS ── */}
      <nav className={styles.bottomNav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isScan = item.path === '/scan';
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={[
                styles.bottomNavItem,
                isActive ? styles.bottomNavItemActive : '',
                isScan   ? styles.bottomNavScan       : '',
              ].join(' ')}
            >
              {isScan ? (
                <div className={styles.scanBubble}>
                  <Icon size={26} />
                </div>
              ) : (
                <Icon size={22} />
              )}
              <span className={styles.bottomNavLabel}>{item.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}