import { useEffect, useState, useMemo } from 'react';
import {
  History, Search, ChevronDown, BookOpen, User, Calendar,
  CheckCircle, Clock, AlertTriangle, Loader, Filter, X,
} from 'lucide-react';
import { loansService } from '../../services/loansService';
import { classroomsService } from '../../services/classroomsService';
import { studentsService } from '../../services/studentsService';
import { Loan, LoanStatus, Classroom, Student } from '../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import styles from './HistoryPage.module.css';

// ── Badge statut ──────────────────────────────────────────────────────────────
function LoanStatusBadge({ status }: { status: LoanStatus }) {
  const map: Record<LoanStatus, { label: string; className: string; Icon: any }> = {
    ACTIVE:   { label: 'En cours',  className: styles.badgeActive,   Icon: Clock },
    RETURNED: { label: 'Rendu',     className: styles.badgeReturned, Icon: CheckCircle },
    LATE:     { label: 'En retard', className: styles.badgeLate,     Icon: AlertTriangle },
  };
  const { label, className, Icon } = map[status] ?? map.ACTIVE;
  return (
    <span className={`${styles.badge} ${className}`}>
      <Icon size={11} /> {label}
    </span>
  );
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return format(new Date(iso), 'd MMM yyyy', { locale: fr });
}

// ── Carte mobile pour un emprunt ──────────────────────────────────────────────
function LoanCard({ loan }: { loan: Loan }) {
  return (
    <div className={`${styles.card} ${loan.status === 'LATE' ? styles.cardLate : ''}`}>
      {/* Titre du livre */}
      <div className={styles.cardHeader}>
        <BookOpen size={16} className={styles.cardBookIcon} />
        <div className={styles.cardBookInfo}>
          <p className={styles.cardBookTitle}>{loan.book?.title ?? '—'}</p>
          {loan.book?.universe && (
            <p className={styles.cardBookSub}>{loan.book.universe}</p>
          )}
        </div>
        <LoanStatusBadge status={loan.status} />
      </div>

      {/* Infos */}
      <div className={styles.cardBody}>
        <div className={styles.cardRow}>
          <span className={styles.cardLabel}><User size={12} /> Élève</span>
          <span className={styles.cardValue}>
            {loan.student?.firstName} {loan.student?.lastName}
          </span>
        </div>
        <div className={styles.cardRow}>
          <span className={styles.cardLabel}><BookOpen size={12} /> Classe</span>
          <span className={styles.cardValue}>
            {loan.student?.classroom?.name ?? loan.book?.classroom?.name ?? '—'}
          </span>
        </div>
        <div className={styles.cardRow}>
          <span className={styles.cardLabel}><Calendar size={12} /> Emprunté le</span>
          <span className={styles.cardValue}>{fmtDate(loan.borrowedAt)}</span>
        </div>
        {loan.dueAt && (
          <div className={styles.cardRow}>
            <span className={styles.cardLabel}><Calendar size={12} /> Retour prévu</span>
            <span className={`${styles.cardValue} ${loan.status === 'LATE' ? styles.cardValueLate : ''}`}>
              {fmtDate(loan.dueAt)}
            </span>
          </div>
        )}
        {loan.returnedAt && (
          <div className={styles.cardRow}>
            <span className={styles.cardLabel}><Calendar size={12} /> Rendu le</span>
            <span className={styles.cardValue}>{fmtDate(loan.returnedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [loans, setLoans]           = useState<Loan[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents]     = useState<Student[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const [search, setSearch]                   = useState('');
  const [filterStatus, setFilterStatus]       = useState('');
  const [filterClassroom, setFilterClassroom] = useState('');
  const [filterStudent, setFilterStudent]     = useState('');

  useEffect(() => {
    Promise.all([
      loansService.getAllLoans(),
      classroomsService.getMyClassrooms(),
      classroomsService.getTodayClassroom(),
    ])
      .then(([loansData, classroomsData, todayClassroom]) => {
        setLoans(loansData);
        setClassrooms(classroomsData);
      if (todayClassroom) {
        setFilterClassroom(todayClassroom.id);
      } else if (classroomsData.length > 0) {
        setFilterClassroom(classroomsData[0].id); // ← première classe par défaut
      }
      })
      .catch(() => setError('Impossible de charger l\'historique'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!filterClassroom) { setStudents([]); setFilterStudent(''); return; }
    studentsService.getStudentsByClassroom(filterClassroom).then(setStudents);
    setFilterStudent('');
  }, [filterClassroom]);

  const filtered = useMemo(() => {
    return loans.filter(loan => {
      const studentName = `${loan.student?.firstName ?? ''} ${loan.student?.lastName ?? ''}`.toLowerCase();
      const bookTitle   = (loan.book?.title ?? '').toLowerCase();
      const q           = search.toLowerCase();
      const matchSearch    = !q || studentName.includes(q) || bookTitle.includes(q);
      const matchStatus    = !filterStatus    || loan.status === filterStatus;
      const matchClassroom = !filterClassroom || loan.book?.classroom?.id === filterClassroom;
      const matchStudent   = !filterStudent   || loan.studentId === filterStudent;
      return matchSearch && matchStatus && matchClassroom && matchStudent;
    });
  }, [loans, search, filterStatus, filterClassroom, filterStudent]);

  const stats = useMemo(() => ({
    total:    loans.length,
    active:   loans.filter(l => l.status === 'ACTIVE').length,
    returned: loans.filter(l => l.status === 'RETURNED').length,
    late:     loans.filter(l => l.status === 'LATE').length,
  }), [loans]);

  const resetFilters = () => {
    setSearch(''); setFilterStatus(''); setFilterClassroom(''); setFilterStudent('');
  };
  const hasFilters = search || filterStatus || filterClassroom || filterStudent;

  if (loading) return (
    <div className={styles.loading}>
      <Loader size={32} className={styles.spin} />
      <span>Chargement de l'historique…</span>
    </div>
  );

  if (error) return (
    <div className={styles.errorBox}>
      <AlertTriangle size={20} /><span>{error}</span>
    </div>
  );

  return (
    <div className={styles.page}>

      {/* En-tête */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <History size={22} className={styles.titleIcon} />
          <h1 className={styles.title}>Historique</h1>
        </div>
        <p className={styles.subtitle}>{stats.total} emprunt{stats.total !== 1 ? 's' : ''}</p>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.statAll}`}>
          <BookOpen size={18} /><div><p className={styles.statValue}>{stats.total}</p><p className={styles.statLabel}>Total</p></div>
        </div>
        <div className={`${styles.statCard} ${styles.statActive}`}>
          <Clock size={18} /><div><p className={styles.statValue}>{stats.active}</p><p className={styles.statLabel}>En cours</p></div>
        </div>
        <div className={`${styles.statCard} ${styles.statReturned}`}>
          <CheckCircle size={18} /><div><p className={styles.statValue}>{stats.returned}</p><p className={styles.statLabel}>Rendus</p></div>
        </div>
        <div className={`${styles.statCard} ${styles.statLate}`}>
          <AlertTriangle size={18} /><div><p className={styles.statValue}>{stats.late}</p><p className={styles.statLabel}>En retard</p></div>
        </div>
      </div>

      {/* Filtres */}
      <div className={styles.filtersBox}>
        <div className={styles.filtersTitle}>
          <Filter size={14} /><span>Filtres</span>
          {hasFilters && (
            <button className={styles.resetBtn} onClick={resetFilters}>
              <X size={12} /> Réinitialiser
            </button>
          )}
        </div>
        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input type="text" placeholder="Rechercher un élève ou un livre…" value={search}
            onChange={e => setSearch(e.target.value)} className={styles.searchInput} />
        </div>
        <div className={styles.filterRow}>
          <div className={styles.selectWrapper}>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={styles.select}>
              <option value="">Tous les statuts</option>
              <option value="ACTIVE">En cours</option>
              <option value="RETURNED">Rendu</option>
              <option value="LATE">En retard</option>
            </select>
            <ChevronDown size={14} className={styles.chevron} />
          </div>
          <div className={styles.selectWrapper}>
            <select value={filterClassroom} onChange={e => setFilterClassroom(e.target.value)} className={styles.select}>
              <option value="">Toutes les classes</option>
              {classrooms.map(c => (
                <option key={c.id} value={c.id}>{c.schoolName ?? c.school?.name} — {c.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className={styles.chevron} />
          </div>
          {students.length > 0 && (
            <div className={styles.selectWrapper}>
              <select value={filterStudent} onChange={e => setFilterStudent(e.target.value)} className={styles.select}>
                <option value="">Tous les élèves</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                ))}
              </select>
              <ChevronDown size={14} className={styles.chevron} />
            </div>
          )}
        </div>
      </div>

      <p className={styles.count}>
        {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
        {hasFilters && ` (filtré${filtered.length !== 1 ? 's' : ''})`}
      </p>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <History size={40} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>Aucun emprunt trouvé</p>
          <p className={styles.emptyText}>
            {hasFilters ? 'Essayez de modifier vos filtres.' : 'Aucun emprunt enregistré.'}
          </p>
        </div>
      ) : (
        <>
          {/* ── DESKTOP : tableau ── */}
          <div className={styles.table}>
            <div className={`${styles.row} ${styles.rowHead}`}>
              <span className={styles.colBook}>Livre</span>
              <span className={styles.colStudent}>Élève</span>
              <span className={styles.colClass}>Classe</span>
              <span className={styles.colDate}>Emprunté le</span>
              <span className={styles.colDate}>Retour prévu</span>
              <span className={styles.colDate}>Rendu le</span>
              <span className={styles.colStatus}>Statut</span>
            </div>
            {filtered.map(loan => (
              <div key={loan.id} className={`${styles.row} ${styles.rowData} ${loan.status === 'LATE' ? styles.rowLate : ''}`}>
                <div className={styles.colBook}>
                  <BookOpen size={14} className={styles.rowIcon} />
                  <div>
                    <p className={styles.bookTitle}>{loan.book?.title ?? '—'}</p>
                    {loan.book?.universe && <p className={styles.bookSub}>{loan.book.universe}</p>}
                  </div>
                </div>
                <div className={styles.colStudent}>
                  <User size={14} className={styles.rowIcon} />
                  <span>{loan.student?.firstName} {loan.student?.lastName}</span>
                </div>
                <div className={styles.colClass}>
                  <span>{loan.student?.classroom?.name ?? loan.book?.classroom?.name ?? '—'}</span>
                </div>
                <div className={styles.colDate}>
                  <Calendar size={12} className={styles.dateIcon} />{fmtDate(loan.borrowedAt)}
                </div>
                <div className={styles.colDate}>
                  {loan.dueAt ? <><Calendar size={12} className={styles.dateIcon} />{fmtDate(loan.dueAt)}</> : '—'}
                </div>
                <div className={styles.colDate}>
                  {loan.returnedAt ? <><Calendar size={12} className={styles.dateIcon} />{fmtDate(loan.returnedAt)}</> : '—'}
                </div>
                <div className={styles.colStatus}><LoanStatusBadge status={loan.status} /></div>
              </div>
            ))}
          </div>

          {/* ── MOBILE : cartes ── */}
          <div className={styles.cardList}>
            {filtered.map(loan => <LoanCard key={loan.id} loan={loan} />)}
          </div>
        </>
      )}
    </div>
  );
}