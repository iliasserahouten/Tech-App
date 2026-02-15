import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, Home, Users, BookMarked } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import styles from './Layout.module.css';

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <BookOpen className={styles.logo} />
          <h1 className={styles.logoText}>Bibliothèque</h1>
        </div>

        <nav className={styles.navigation}>
          <button
            onClick={() => navigate('/dashboard')}
            className={styles.navItem}
          >
            <Home size={20} />
            <span>Tableau de bord</span>
          </button>
          <button
            onClick={() => navigate('/books')}
            className={styles.navItem}
          >
            <BookMarked size={20} />
            <span>Livres</span>
          </button>
          <button
            onClick={() => navigate('/students')}
            className={styles.navItem}
          >
            <Users size={20} />
            <span>Étudiants</span>
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user?.firstName?.[0] || user?.email[0].toUpperCase()}
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email}
              </p>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}