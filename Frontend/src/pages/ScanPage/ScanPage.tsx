import { useState, useEffect, useRef } from 'react';
import { Camera, Keyboard, CheckCircle, XCircle, AlertTriangle, ArrowLeft, User, Users, Calendar, Loader, BookOpen, UserCheck } from 'lucide-react';
import { booksService } from '../../services/booksService';
import { studentsService } from '../../services/studentsService';
import { classroomsService } from '../../services/classroomsService';
import { Book, Student, Loan, Classroom } from '../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import styles from './ScanPage.module.css';


function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ── Phase 1 : Scanner ──
import { Html5Qrcode } from 'html5-qrcode';

function ScanFrame({ onScan }: { onScan: (code: string) => void }) {
  const [manual, setManual]             = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError]   = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startCamera = async () => {
    setCameraError('');
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 200, height: 200 } },
        (decodedText) => {
          stopCamera();
          onScan(decodedText.trim().toUpperCase());
        },
        () => {}
      );
      setCameraActive(true);
    } catch (err: any) {
      setCameraError('Impossible d\'accéder à la caméra. Utilisez la saisie manuelle.');
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      scannerRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  const handleManual = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manual.trim().toUpperCase();
    if (code) { onScan(code); setManual(''); }
  };

  return (
    <div className={styles.scanFrame}>
      <div className={styles.scanTitle}>
        <h1>Scanner un livre</h1>
        <p>Scannez le QR code ou saisissez le code manuellement</p>
      </div>

      {/* Zone caméra — html5-qrcode gère tout ici */}
      <div
        id="qr-reader"
        style={{
          width: '100%',
          maxWidth: '340px',
          margin: '0 auto',
          borderRadius: '16px',
          overflow: 'hidden',
          minHeight: cameraActive ? '280px' : '0',
          background: '#000',
        }}
      />

      {/* Placeholder quand caméra inactive */}
      {!cameraActive && (
        <div className={styles.viewfinder}>
          <div className={styles.viewfinderInner}>
            <Camera size={48} className={styles.cameraIcon} />
            <div className={styles.corner + ' ' + styles.cornerTL} />
            <div className={styles.corner + ' ' + styles.cornerTR} />
            <div className={styles.corner + ' ' + styles.cornerBL} />
            <div className={styles.corner + ' ' + styles.cornerBR} />
            <div className={styles.scanLine} />
          </div>
          <p className={styles.viewfinderHint}>Positionnez le QR code dans le cadre</p>
        </div>
      )}

      {/* Erreur caméra */}
      {cameraError && (
        <div className={styles.cameraError}>
          <AlertTriangle size={14} /> {cameraError}
        </div>
      )}

      {/* Bouton activer/désactiver caméra */}
      <button
        className={`${styles.cameraBtn} ${cameraActive ? styles.cameraBtnActive : ''}`}
        onClick={cameraActive ? stopCamera : startCamera}
      >
        <Camera size={18} />
        {cameraActive ? 'Arrêter la caméra' : 'Activer la caméra'}
      </button>

      {/* Saisie manuelle */}
      <div className={styles.manualSection}>
        <p className={styles.manualLabel}>
          <Keyboard size={14} />
          Code illisible ? Saisissez-le manuellement
        </p>
        <form onSubmit={handleManual} className={styles.manualForm}>
          <input
            value={manual}
            onChange={e => setManual(e.target.value)}
            placeholder="Ex: LIV-0001"
            className={styles.manualInput}
          />
          <button type="submit" className={styles.manualBtn}>Valider</button>
        </form>
      </div>
    </div>
  );
}

function EmpruntForm({
  book,
  onBack,
  onSuccess,
}: {
  book: Book;
  onBack: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [allClassrooms, setAllClassrooms]         = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState(book.classroomId);
  const [students, setStudents]                   = useState<Student[]>([]);
  const [studentId, setStudentId]                 = useState('');
  const [dueAt, setDueAt]                         = useState(addDays(15));
  const [loading, setLoading]                     = useState(false);
  const [loadingStudents, setLoadingStudents]     = useState(true);
  const [error, setError]                         = useState('');

  // Charger toutes les classes au montage
  useEffect(() => {
    classroomsService.getMyClassrooms().then(cls => {
      setAllClassrooms(cls);
    }).catch(() => {});
  }, []);

  // Recharger les élèves quand la classe sélectionnée change
  useEffect(() => {
    if (!selectedClassroomId) return;
    setLoadingStudents(true);
    setStudentId('');
    studentsService.getStudentsByClassroom(selectedClassroomId).then(data => {
      setStudents(data);
      if (data.length > 0) setStudentId(data[0].id);
      setLoadingStudents(false);
    }).catch(() => setLoadingStudents(false));
  }, [selectedClassroomId]);

  const handleConfirm = async () => {
    if (!studentId) return;
    setLoading(true);
    setError('');
    try {
      await booksService.createLoan({
        qrToken: book.qrToken,
        studentId,
        dueAt,
      });
      const student = students.find(s => s.id === studentId);
      onSuccess(`Emprunt enregistré pour ${student?.firstName} ${student?.lastName}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Erreur lors de l\'emprunt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.actionPage}>
      <button className={styles.backBtn} onClick={onBack}>
        <ArrowLeft size={18} /> Retour
      </button>

      <div className={styles.bookCard + ' ' + styles.bookCardAvailable}>
        <div className={styles.bookCardIcon}>
          <CheckCircle size={24} className={styles.iconGreen} />
        </div>
        <div className={styles.bookCardInfo}>
          <p className={styles.bookCardTitle}>{book.title}</p>
          <p className={styles.bookCardSub}>{book.universe ?? book.publisher ?? '—'}</p>
          <p className={styles.bookCardToken}>{book.qrToken} · Disponible</p>
        </div>
      </div>

      <h2 className={styles.actionTitle}>Nouvel Emprunt</h2>

      {error && <div className={styles.errorBox}><AlertTriangle size={16} />{error}</div>}

      <div className={styles.formSection}>

        {/* Sélecteur de classe */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Users size={14} /> Classe
          </label>
          <select
            value={selectedClassroomId}
            onChange={e => setSelectedClassroomId(e.target.value)}
            className={styles.formSelect}
          >
            {allClassrooms.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}{c.grade ? ` - ${c.grade}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Sélecteur d'élève */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <User size={14} /> Élève
          </label>
          {loadingStudents ? (
            <div className={styles.loadingStudents}>
              <Loader size={16} className={styles.spin} /> Chargement...
            </div>
          ) : students.length > 0 ? (
            <select
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              className={styles.formSelect}
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
              ))}
            </select>
          ) : (
            <p className={styles.noStudents}>
              <AlertTriangle size={14} />
              Aucun élève dans cette classe. Ajoutez-en dans la Gestion.
            </p>
          )}
        </div>

        {/* Date de retour */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Calendar size={14} /> Date de retour prévue (J+15 par défaut)
          </label>
          <input
            type="date"
            value={dueAt}
            onChange={e => setDueAt(e.target.value)}
            min={addDays(1)}
            className={styles.formInput}
          />
        </div>
      </div>

      <button
        className={styles.confirmBtn + ' ' + styles.confirmBtnGreen}
        onClick={handleConfirm}
        disabled={loading || !studentId}
      >
        {loading ? <Loader size={18} className={styles.spin} /> : <CheckCircle size={18} />}
        {loading ? 'Enregistrement...' : 'Confirmer l\'emprunt'}
      </button>
    </div>
  );
}


function RetourForm({
  book,
  loan,
  onBack,
  onSuccess,
}: {
  book: Book;
  loan: Loan | null;
  onBack: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [showReservation, setShowReservation] = useState(false);
  const [allClassrooms, setAllClassrooms]   = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [students, setStudents]             = useState<Student[]>([]);
  const [studentId, setStudentId]           = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [desiredFrom, setDesiredFrom]       = useState(addDays(1));
  const isLate = loan?.status === 'LATE';

  // Charger les classes quand on ouvre le formulaire de réservation
  useEffect(() => {
    if (!showReservation) return;
    classroomsService.getMyClassrooms().then(cls => {
      setAllClassrooms(cls);
      if (cls.length > 0) setSelectedClassroomId(cls[0].id);
    }).catch(() => {});
  }, [showReservation]);

  // Charger les élèves quand la classe change
  useEffect(() => {
    if (!selectedClassroomId) return;
    setLoadingStudents(true);
    setStudentId('');
    studentsService.getStudentsByClassroom(selectedClassroomId).then(data => {
      setStudents(data);
      if (data.length > 0) setStudentId(data[0].id);
      setLoadingStudents(false);
    }).catch(() => setLoadingStudents(false));
  }, [selectedClassroomId]);

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await booksService.returnBook(book.qrToken);
      onSuccess(`"${book.title}" est de retour en rayon`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Erreur lors du retour');
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async () => {
    if (!studentId) return;
    setLoading(true);
    setError('');
    try {
await booksService.createReservation({
  qrToken: book.qrToken,  // ← qrToken au lieu de bookId
  studentId,
  desiredFrom,
});
      const student = students.find(s => s.id === studentId);
      onSuccess(`Réservation créée pour ${student?.firstName} ${student?.lastName}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.actionPage}>
      <button className={styles.backBtn} onClick={onBack}>
        <ArrowLeft size={18} /> Retour
      </button>

      <div className={`${styles.bookCard} ${isLate ? styles.bookCardLate : styles.bookCardLoaned}`}>
        <div className={styles.bookCardIcon}>
          {isLate
            ? <AlertTriangle size={24} className={styles.iconRed} />
            : <XCircle size={24} className={styles.iconOrange} />}
        </div>
        <div className={styles.bookCardInfo}>
          <p className={styles.bookCardTitle}>{book.title}</p>
          <p className={styles.bookCardSub}>{book.universe ?? book.publisher ?? '—'}</p>
          <p className={styles.bookCardToken}>{book.qrToken} · {isLate ? 'En retard ⚠️' : 'Emprunté'}</p>
        </div>
      </div>

      {!showReservation ? (
        <>
          <h2 className={styles.actionTitle}>Retour en rayon</h2>

          {error && <div className={styles.errorBox}><AlertTriangle size={16} />{error}</div>}

          {loan && (
            <div className={styles.loanDetails}>
              <div className={styles.loanRow}>
                <span>Emprunté par</span>
                <strong>{loan.student?.firstName} {loan.student?.lastName}</strong>
              </div>
              <div className={styles.loanRow}>
                <span>Emprunté le</span>
                <span>{format(new Date(loan.borrowedAt), 'dd MMMM yyyy', { locale: fr })}</span>
              </div>
              {loan.dueAt && (
                <div className={styles.loanRow}>
                  <span>Retour prévu</span>
                  <strong className={isLate ? styles.late : styles.normal}>
                    {format(new Date(loan.dueAt), 'dd MMMM yyyy', { locale: fr })}
                  </strong>
                </div>
              )}
            </div>
          )}

          <button
            className={styles.confirmBtn + ' ' + styles.confirmBtnBlue}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? <Loader size={18} className={styles.spin} /> : <CheckCircle size={18} />}
            {loading ? 'Enregistrement...' : 'Confirmer le retour'}
          </button>

          <button
            className={styles.reserveBtn}
            onClick={() => setShowReservation(true)}
          >
            <UserCheck size={16} />
            Réserver pour un autre élève
          </button>
        </>
      ) : (
        <>
          <h2 className={styles.actionTitle}>Réserver ce livre</h2>
          <p className={styles.reserveHint}>Le livre sera réservé dès son retour en rayon.</p>

          {error && <div className={styles.errorBox}><AlertTriangle size={16} />{error}</div>}

          <div className={styles.formSection}>
            {/* Classe */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Users size={14} /> Classe
              </label>
              <select
                value={selectedClassroomId}
                onChange={e => setSelectedClassroomId(e.target.value)}
                className={styles.formSelect}
              >
                {allClassrooms.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.grade ? ` - ${c.grade}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Élève */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <User size={14} /> Élève
              </label>
              {loadingStudents ? (
                <div className={styles.loadingStudents}>
                  <Loader size={16} className={styles.spin} /> Chargement...
                </div>
              ) : students.length > 0 ? (
                <select
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  className={styles.formSelect}
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                  ))}
                </select>
              ) : (
                <p className={styles.noStudents}>
                  <AlertTriangle size={14} />
                  Aucun élève dans cette classe.
                </p>
              )}
            </div>

            {/* Date souhaitée */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Calendar size={14} /> Date souhaitée (optionnel)
              </label>
              <input
                type="date"
                value={desiredFrom}
                onChange={e => setDesiredFrom(e.target.value)}
                min={addDays(1)}
                className={styles.formInput}
              />
            </div>
          </div>

          <button
            className={styles.confirmBtn + ' ' + styles.confirmBtnBlue}
            onClick={handleReservation}
            disabled={loading || !studentId}
          >
            {loading ? <Loader size={18} className={styles.spin} /> : <UserCheck size={18} />}
            {loading ? 'Réservation...' : 'Confirmer la réservation'}
          </button>

          <button
            className={styles.reserveBtn}
            onClick={() => setShowReservation(false)}
          >
            <ArrowLeft size={16} />
            Annuler
          </button>
        </>
      )}
    </div>
  );
}
// ── Phase 3 : Succès ──
function SuccessScreen({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <div className={styles.successPage}>
      <div className={styles.successIcon}>
        <CheckCircle size={48} />
      </div>
      <h2>Opération réussie !</h2>
      <p>{message}</p>
      <button className={styles.confirmBtn + ' ' + styles.confirmBtnBlue} onClick={onReset}>
        <BookOpen size={18} />
        Scanner un autre livre
      </button>
    </div>
  );
}

// ── Page principale ──
type Phase = 'scan' | 'emprunt' | 'retour' | 'success';

export default function ScanPage() {
  const [phase, setPhase]           = useState<Phase>('scan');
  const [book, setBook]             = useState<Book | null>(null);
  const [loan, setLoan]             = useState<Loan | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [scanError, setScanError]   = useState('');
  const [scanning, setScanning]     = useState(false);

  const handleScan = async (qrToken: string) => {
    setScanning(true);
    setScanError('');
    try {
      const foundBook = await booksService.getBookByQrToken(qrToken);
      setBook(foundBook);

      if (foundBook.status === 'AVAILABLE') {
        setPhase('emprunt');
      } else {
        const activeLoan = foundBook.currentLoan ??
          foundBook.loans?.find(l => l.status === 'ACTIVE' || l.status === 'LATE') ?? null;
        setLoan(activeLoan);
        setPhase('retour');
      }
    } catch (err: any) {
      setScanError(`Livre introuvable pour le code : ${qrToken}`);
    } finally {
      setScanning(false);
    }
  };

  const handleSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setPhase('success');
  };

  const reset = () => {
    setPhase('scan');
    setBook(null);
    setLoan(null);
    setSuccessMsg('');
    setScanError('');
  };

  return (
    <div className={styles.page}>
      {scanError && (
        <div className={styles.scanErrorBanner}>
          <AlertTriangle size={16} />
          {scanError}
          <button onClick={() => setScanError('')}>✕</button>
        </div>
      )}

      {phase === 'scan'    && <ScanFrame onScan={handleScan} />}
      {phase === 'emprunt' && book && <EmpruntForm book={book} onBack={reset} onSuccess={handleSuccess} />}
      {phase === 'retour'  && book && <RetourForm book={book} loan={loan} onBack={reset} onSuccess={handleSuccess} />}
      {phase === 'success' && <SuccessScreen message={successMsg} onReset={reset} />}
    </div>
  );
}