import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, LogOut, Home, Library, ScanLine, Settings } from 'lucide-react';
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
    { path: '/dashboard', label: 'Tableau de bord', icon: Home },
    { path: '/books',     label: 'Livres',           icon: Library },
    { path: '/scan',      label: 'Scan',             icon: ScanLine },
    { path: '/gestion',   label: 'Gestion',          icon: Settings },
  ];

  return (
    <div className={styles.layoutContainer}>
      {/* Header horizontal */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          {/* Logo */}
          <div className={styles.logoSection}>
            <BookOpen className={styles.logoIcon} />
            <span className={styles.logoText}>Bibliothèque</span>
          </div>

          {/* Navigation */}
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

          {/* User section */}
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user?.firstName?.[0] || user?.email[0].toUpperCase()}
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

      {/* Main content */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}