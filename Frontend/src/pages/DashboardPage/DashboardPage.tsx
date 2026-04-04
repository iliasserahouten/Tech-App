import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { BookOpen, AlertCircle, CheckCircle, Clock, QrCode, Loader, RefreshCw } from 'lucide-react';
import { classroomsService } from '../../services/classroomsService';
import { statsService } from '../../services/statsService';
import { Classroom, DashboardStats } from '../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const [currentClassroom, setCurrentClassroom] = useState<Classroom | null>(null);
  const [myClassrooms, setMyClassrooms] = useState<Classroom[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    setIsLoading(true);
    setHasError(false);

    try {
      const classrooms = await classroomsService.getMyClassrooms();
      setMyClassrooms(classrooms);

      const todayClassroom = await classroomsService.getTodayClassroom();
      const active = todayClassroom || (classrooms.length > 0 ? classrooms[0] : null);
      setCurrentClassroom(active);

      // Charger les stats globales (activité récente + emprunts actifs)
      try {
        const dashboardStats = await statsService.getDashboardStats();
        setStats(dashboardStats);

        // Appliquer les stats de la classe active par-dessus
        if (active) {
          try {
            const classStats = await statsService.getClassroomStats(active.id);
            setStats(prev => prev ? {
              ...prev,
              totalBorrowed: classStats.activeLoans,
              totalOverdue: classStats.overdueLoans,
              totalAvailable: classStats.totalBooks - classStats.activeLoans - classStats.overdueLoans,
            } : prev);
          } catch {}
        }
      } catch {
        setStats({
          totalBorrowed: 0,
          totalOverdue: 0,
          totalAvailable: 0,
          totalBooks: 0,
          totalStudents: 0,
          activeLoans: [],
          recentActivities: [],
        });
      }
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Chargement initial
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ← Rechargement automatique à chaque fois qu'on revient sur le Dashboard
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      loadDashboardData();
    }
  }, [location.pathname]);

  // Recharger les KPIs quand la classe active change manuellement
  useEffect(() => {
    if (!currentClassroom) return;
    statsService.getClassroomStats(currentClassroom.id)
      .then(classStats => {
        setStats(prev => prev ? {
          ...prev,
          totalBorrowed: classStats.activeLoans,
          totalOverdue: classStats.overdueLoans,
          totalAvailable: classStats.totalBooks - classStats.activeLoans - classStats.overdueLoans,
        } : prev);
      })
      .catch(() => {});
  }, [currentClassroom]);

  const handleClassroomChange = (classroomId: string) => {
    const classroom = myClassrooms.find(c => c.id === classroomId);
    if (classroom) setCurrentClassroom(classroom);
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
    bgColor,
  }: {
    icon: any;
    label: string;
    value: number;
    color: string;
    bgColor: string;
  }) => (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ backgroundColor: bgColor }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div className={styles.statContent}>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statValue}>{value}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader className={styles.spinner} size={48} />
        <p className={styles.loadingText}>Chargement...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* En-tête */}
      <div className={styles.header}>
        <div className={styles.userGreeting}>
          <h1 className={styles.title}>
            Bonjour, {user?.firstName || 'Enseignant'} {user?.lastName || ''}
          </h1>

          {myClassrooms.length > 0 ? (
            <div className={styles.classroomSelector}>
              <label htmlFor="classroom-select" className={styles.classroomLabel}>
                Classe active :
              </label>
              <select
                id="classroom-select"
                value={currentClassroom?.id || ''}
                onChange={(e) => handleClassroomChange(e.target.value)}
                className={styles.classroomSelect}
              >
                {myClassrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className={styles.noClassroom}>
              Vous n'avez pas encore de classe assignée
            </div>
          )}
        </div>

        {/* Bouton rafraîchir */}
        <button
          onClick={loadDashboardData}
          className={styles.refreshBtn}
          title="Rafraîchir"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* KPIs */}
      {stats && (
        <div className={styles.kpiSection}>
          <h2 className={styles.sectionTitle}>Les KPIs :</h2>
          <div className={styles.statsGrid}>
            <StatCard
              icon={BookOpen}
              label={`${stats.totalBorrowed} livre${stats.totalBorrowed > 1 ? 's' : ''} Emprunté${stats.totalBorrowed > 1 ? 's' : ''}`}
              value={stats.totalBorrowed}
              color="#3B82F6"
              bgColor="#DBEAFE"
            />
            <StatCard
              icon={AlertCircle}
              label={`${stats.totalOverdue} Retard${stats.totalOverdue > 1 ? 's' : ''}`}
              value={stats.totalOverdue}
              color="#EF4444"
              bgColor="#FEE2E2"
            />
            <StatCard
              icon={CheckCircle}
              label={`${stats.totalAvailable} livre${stats.totalAvailable > 1 ? 's' : ''} disponible${stats.totalAvailable > 1 ? 's' : ''}`}
              value={stats.totalAvailable}
              color="#10B981"
              bgColor="#D1FAE5"
            />
          </div>
        </div>
      )}

      {/* Bouton Scanner */}
      <div className={styles.scanSection}>
        <button
          onClick={() => navigate('/scan')}
          className={styles.scanButton}
        >
          <QrCode size={48} />
          <span className={styles.scanText}>SCANNER</span>
          <span className={styles.scanSubtext}>Emprunter ou Retourner</span>
        </button>
        <p className={styles.scanDescription}>
          Scannez le QR code d'un livre
        </p>
      </div>

      {/* Activité Récente */}
      <div className={styles.activitySection}>
        <h2 className={styles.sectionTitle}>Activité Récente</h2>
        <div className={styles.activityList}>
          {stats && stats.recentActivities && stats.recentActivities.length > 0 ? (
            stats.recentActivities.map((activity) => {
              let formattedDate = 'Date inconnue';
              try {
                if (activity.timestamp) {
                  formattedDate = format(new Date(activity.timestamp), 'dd MMMM yyyy', { locale: fr });
                }
              } catch (error) {
                console.error('Erreur formatage date:', error);
              }

              return (
                <div key={activity.id} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    {activity.type === 'borrow' ? (
                      <BookOpen size={20} color="#3B82F6" />
                    ) : (
                      <CheckCircle size={20} color="#10B981" />
                    )}
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}>
                      <strong>{activity.studentName || 'Étudiant inconnu'}</strong>{' '}
                      {activity.type === 'borrow' ? 'a emprunté' : 'a retourné'} "
                      {activity.bookTitle || 'Livre inconnu'}"
                    </p>
                    <p className={styles.activityTime}>{formattedDate}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className={styles.emptyState}>Aucune activité récente</p>
          )}
        </div>
      </div>

      {/* Message erreur */}
      {hasError && (
        <div className={styles.infoBox}>
          <AlertCircle size={20} />
          <p>Les données seront disponibles une fois le backend connecté</p>
        </div>
      )}

      {/* Emprunts actifs */}
      {stats && stats.activeLoans && stats.activeLoans.length > 0 && (
        <div className={styles.activeLoansSection}>
          <h2 className={styles.sectionTitle}>Emprunts en cours</h2>
          <div className={styles.loansList}>
            {stats.activeLoans.map((loan) => {
              let dueDate = null;
              try {
                if (loan.dueAt) {
                  dueDate = format(new Date(loan.dueAt), 'dd/MM/yyyy');
                }
              } catch (error) {
                console.error('Erreur formatage date retour:', error);
              }

              return (
                <div key={loan.id} className={styles.loanCard}>
                  <div className={styles.loanInfo}>
                    <p className={styles.loanBook}>
                      {loan.book?.title || 'Livre inconnu'}
                    </p>
                    <p className={styles.loanStudent}>
                      {loan.student?.firstName || ''} {loan.student?.lastName || ''}
                    </p>
                  </div>
                  <div className={styles.loanDue}>
                    {dueDate ? (
                      <>
                        <Clock size={16} />
                        <span>Retour : {dueDate}</span>
                      </>
                    ) : (
                      <span className={styles.noDueDate}>Pas de date de retour</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}