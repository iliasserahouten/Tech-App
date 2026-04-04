import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { BookOpen, Lock, Mail, User, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import styles from '../LoginPage/LoginPage.module.css'; 

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await authService.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      toast.success('Compte créé avec succès ! ');
      navigate('/login');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Erreur lors de l\'inscription'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* Formes animées en arrière-plan */}
      <div className={styles.backgroundShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>

      {/* Carte d'inscription */}
      <div className={styles.loginCard}>
        {/* Bouton retour */}
        <button
          onClick={() => navigate('/login')}
          className={styles.backButton}
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className={styles.title}>Créer un compte</h1>
          <p className={styles.subtitle}>Rejoignez la bibliothèque</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {/* Prénom */}
          <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.label}>
              Prénom
            </label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} />
              <input
                {...register('firstName', {
                  required: 'Prénom requis',
                })}
                type="text"
                id="firstName"
                className={styles.input}
                placeholder="Jean"
              />
            </div>
            {errors.firstName && (
              <p className={styles.errorMessage}>
                <span>⚠️</span>
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Nom */}
          <div className={styles.formGroup}>
            <label htmlFor="lastName" className={styles.label}>
              Nom
            </label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} />
              <input
                {...register('lastName', {
                  required: 'Nom requis',
                })}
                type="text"
                id="lastName"
                className={styles.input}
                placeholder="Dupont"
              />
            </div>
            {errors.lastName && (
              <p className={styles.errorMessage}>
                <span>⚠️</span>
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Adresse email
            </label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} />
              <input
                {...register('email', {
                  required: 'Email requis',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email invalide',
                  },
                })}
                type="email"
                id="email"
                className={styles.input}
                placeholder="votre.email@exemple.com"
              />
            </div>
            {errors.email && (
              <p className={styles.errorMessage}>
                <span>⚠️</span>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Mot de passe */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Mot de passe
            </label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <input
                {...register('password', {
                  required: 'Mot de passe requis',
                  minLength: {
                    value: 6,
                    message: 'Au moins 6 caractères',
                  },
                })}
                type="password"
                id="password"
                className={styles.input}
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className={styles.errorMessage}>
                <span>⚠️</span>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirmer mot de passe */}
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirmer le mot de passe
            </label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <input
                {...register('confirmPassword', {
                  required: 'Confirmation requise',
                  validate: (value) =>
                    value === password || 'Les mots de passe ne correspondent pas',
                })}
                type="password"
                id="confirmPassword"
                className={styles.input}
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <p className={styles.errorMessage}>
                <span>⚠️</span>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Bouton d'inscription */}
          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? (
              <span className={styles.buttonContent}>
                <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Inscription en cours...
              </span>
            ) : (
              'Créer mon compte'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className={styles.footer} style={{ marginTop: '1.5rem' }}>
          <p className={styles.footerText}>
            © {new Date().getFullYear()} Tous droits réservés
          </p>
        </div>
      </div>

      {/* Éléments décoratifs */}
      <div className={styles.decorativeCircle}></div>
      <div className={styles.decorativeSquare}></div>
    </div>
  );
}