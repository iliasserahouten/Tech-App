import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { User, Mail, Lock, LogOut, Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, login } = useAuthStore();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName]   = useState(user?.lastName ?? '');
  const [email, setEmail]         = useState(user?.email ?? '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd]   = useState(false);
  const [showNewPwd, setShowNewPwd]           = useState(false);

  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setSaving(true);
    try {
      const response = await api.put('/auth/profile', {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email: email || undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      const { user: updatedUser, token } = response.data;
      login(token, updatedUser);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast.success('Profil mis à jour avec succès');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message ?? 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Retour
        </button>
        <h1 className={styles.title}>Mon Profil</h1>
      </div>

      {/* Avatar */}
      <div className={styles.avatarSection}>
        <div className={styles.avatar}>
          {user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase()}
        </div>
        <p className={styles.avatarName}>
          {user?.firstName} {user?.lastName}
        </p>
        <p className={styles.avatarEmail}>{user?.email}</p>
      </div>

      <form onSubmit={handleSave} className={styles.form}>

        {/* Informations personnelles */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <User size={16} /> Informations personnelles
          </h2>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Prénom</label>
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Prénom"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Nom</label>
              <input
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Nom"
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Mail size={16} /> Adresse email
          </h2>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@exemple.com"
            />
          </div>
        </div>

        {/* Mot de passe */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Lock size={16} /> Changer le mot de passe
          </h2>
          <p className={styles.hint}>Laissez vide si vous ne souhaitez pas changer le mot de passe</p>

          <div className={styles.formGroup}>
            <label>Mot de passe actuel</label>
            <div className={styles.passwordInput}>
              <input
                type={showCurrentPwd ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)}>
                {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Nouveau mot de passe</label>
            <div className={styles.passwordInput}>
              <input
                type={showNewPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowNewPwd(!showNewPwd)}>
                {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Bouton sauvegarder */}
        <button type="submit" className={styles.saveBtn} disabled={saving}>
          <Save size={18} />
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </form>

      {/* Déconnexion */}
      <button className={styles.logoutBtn} onClick={handleLogout}>
        <LogOut size={18} />
        Se déconnecter
      </button>
    </div>
  );
}