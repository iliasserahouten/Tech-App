import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { BookOpen, Users, BookMarked, TrendingUp } from 'lucide-react';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className={styles.dashboard}>
      {/* En-tête */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          Bonjour {user?.firstName || 'Enseignant'} ! 👋
        </h1>
        <p className={styles.subtitle}>
          Bienvenue dans votre espace de gestion de bibliothèque
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#DBEAFE' }}>
            <BookOpen style={{ color: '#3B82F6' }} size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statValue}>245</p>
            <p className={styles.statLabel}>Livres</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#D1FAE5' }}>
            <Users style={{ color: '#10B981' }} size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statValue}>128</p>
            <p className={styles.statLabel}>Étudiants</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#FEF3C7' }}>
            <BookMarked style={{ color: '#F59E0B' }} size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statValue}>42</p>
            <p className={styles.statLabel}>Emprunts actifs</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#E0E7FF' }}>
            <TrendingUp style={{ color: '#6366F1' }} size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statValue}>+15%</p>
            <p className={styles.statLabel}>Ce mois</p>
          </div>
        </div>
      </div>

      {/* Message de bienvenue */}
      <div className={styles.welcomeCard}>
        <h2 className={styles.welcomeTitle}>🎉 Votre application fonctionne !</h2>
        <p className={styles.welcomeText}>
          Vous êtes connecté avec succès. Toutes les fonctionnalités seront ajoutées progressivement.
        </p>
        <div className={styles.infoBox}>
          <p><strong>Email :</strong> {user?.email}</p>
          {user?.firstName && (
            <p><strong>Nom :</strong> {user.firstName} {user.lastName}</p>
          )}
        </div>
      </div>
    </div>
  );
}