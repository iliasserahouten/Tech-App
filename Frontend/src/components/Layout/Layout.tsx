import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, LogOut, Home, Library, ScanLine, Settings, History } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import styles from './Layout.module.css';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

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

      <header className={styles.header}>
        <div className={styles.headerContent}>

          <div className={styles.logoSection}>
            <BookOpen className={styles.logoIcon} />
            <span className={styles.logoText}>Bibliothèque</span>
          </div>

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

          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <button
                className={styles.userAvatar}
                onClick={() => navigate('/profile')}
                title="Mon profil"
              >
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
              </button>
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

      <main className={styles.mainContent}>
        <Outlet />
      </main>

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