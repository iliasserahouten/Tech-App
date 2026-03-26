import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { BookOpen, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import { LoginCredentials } from '../../types';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    setLoginError('');
    
    try {
      const response = await authService.login(data);
      login(response.token, response.user);
      toast.success('Connexion réussie');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      let errorMessage = 'Email ou mot de passe incorrect';
      
      if (error && typeof error === 'object') {
        const err = error as any;
        
        // Gestion du cas où message est un objet avec {message, details}
        if (err.response?.data?.message) {
          if (typeof err.response.data.message === 'string') {
            errorMessage = err.response.data.message;
          } else if (typeof err.response.data.message === 'object' && err.response.data.message.message) {
            errorMessage = err.response.data.message.message;
          }
        } else if (err.response?.data?.error) {
          if (typeof err.response.data.error === 'string') {
            errorMessage = err.response.data.error;
          } else if (typeof err.response.data.error === 'object' && err.response.data.error.message) {
            errorMessage = err.response.data.error.message;
          }
        } else if (err.message && typeof err.message === 'string') {
          errorMessage = err.message;
        }
      }
      
      setLoginError(errorMessage);
      
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '1rem',
          padding: '1rem 1.5rem',
          borderRadius: '0.75rem',
          fontWeight: '500',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* Formes animées */}
      <div className={styles.backgroundShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>

      {/* Carte de login */}
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <BookOpen style={{ width: '2.5rem', height: '2.5rem', color: 'white' }} />
          </div>
          <h1 className={styles.title}>Bienvenue !</h1>
          <p className={styles.subtitle}>Connectez-vous à votre bibliothèque</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {/* Bannière d'erreur globale */}
          {loginError && (
            <div className={styles.errorBanner}>
              <span className={styles.errorIcon}></span>
              <span>{loginError}</span>
            </div>
          )}

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
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className={styles.errorMessage}>
                <span></span>
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
                type={showPassword ? 'text' : 'password'}
                id="password"
                className={`${styles.input} ${styles.passwordInput}`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.togglePassword}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className={styles.errorMessage}>
                <span></span>
                {errors.password.message}
              </p>
            )}
          </div>

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
                Connexion en cours...
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className={styles.signupLink}>
          <p className={styles.signupText}>
            Vous n'avez pas de compte ?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className={styles.signupButton}
            >
              Créer un compte
            </button>
          </p>
        </div>

        <div className={styles.divider}>
          <div className={styles.dividerLine}>
            <div className={styles.dividerBorder}></div>
          </div>
          <div className={styles.dividerText}>
            <span className={styles.dividerTextContent}>Gestion de Bibliothèque</span>
          </div>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            © {new Date().getFullYear()} Tous droits réservés
          </p>
          <p className={styles.footerSubtext}>
            Plateforme dédiée aux enseignants
          </p>
        </div>
      </div>

      <div className={styles.decorativeCircle}></div>
      <div className={styles.decorativeSquare}></div>
    </div>
  );
}