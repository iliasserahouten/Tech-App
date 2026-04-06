import { useState, useEffect, useRef } from 'react';
import {
  Camera, Keyboard, CheckCircle, XCircle, AlertTriangle,
  ArrowLeft, User, Users, Calendar, Loader, BookOpen,
  UserCheck, Zap,
} from 'lucide-react';
import { booksService } from '../../services/booksService';
import { studentsService } from '../../services/studentsService';
import { Book, Student, Loan} from '../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import styles from './ScanPage.module.css';
import { Html5Qrcode } from 'html5-qrcode';

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// Scanner QR 
function ScanFrame({ onScan }: { onScan: (code: string) => void }) {
  const [manual, setManual]             = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError]   = useState('');
  const [scanning, setScanning]         = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  //  Démarrer la caméra 
  const startCamera = async () => {
    setCameraError('');
    setScanning(false);
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 240, height: 240 },
          disableFlip: false,
        },
        (decodedText) => {
          if ('vibrate' in navigator) navigator.vibrate(80);
          stopCamera();
          onScan(decodedText.trim().toUpperCase());
        },
        () => { /* erreurs de décodage ignorées */ }
      );
      setCameraActive(true);
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        setCameraError('Accès à la caméra refusé. Autorisez l\'accès dans les paramètres de votre navigateur.');
      } else if (err?.name === 'NotFoundError') {
        setCameraError('Aucune caméra détectée sur cet appareil.');
      } else {
        setCameraError('Impossible d\'accéder à la caméra. Utilisez la saisie manuelle.');
      }
    }
  };

  // Arrêter la caméra 
  const stopCamera = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch { /* ignoré */ }
      scannerRef.current = null;
    }
    setCameraActive(false);
  };

  // Nettoyage au démontage du composant
  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  //  Démarrage automatique de la caméra 
  // Sur mobile (PWA), la caméra s'ouvre automatiquement
  useEffect(() => {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile) {
      // Petit délai pour que le DOM soit prêt
      const timer = setTimeout(() => startCamera(), 400);
      return () => clearTimeout(timer);
    }
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
        <p>Pointez la caméra vers le QR code du livre</p>
      </div>

      {/* Zone vidéo — html5-qrcode injecte le flux caméra ici */}
      <div
        id="qr-reader"
        className={styles.qrReaderContainer}
        style={{ minHeight: cameraActive ? '280px' : '0' }}
      />

      {/* Viewfinder animé (affiché si caméra inactive) */}
      {!cameraActive && (
        <div className={styles.viewfinder}>
          <div className={styles.viewfinderInner}>
            <Camera size={48} className={styles.cameraIcon} />
            <div className={`${styles.corner} ${styles.cornerTL}`} />
            <div className={`${styles.corner} ${styles.cornerTR}`} />
            <div className={`${styles.corner} ${styles.cornerBL}`} />
            <div className={`${styles.corner} ${styles.cornerBR}`} />
            <div className={styles.scanLine} />
          </div>
          <p className={styles.viewfinderHint}>Positionnez le QR code dans le cadre</p>
        </div>
      )}

      {/* Message d'erreur caméra */}
      {cameraError && (
        <div className={styles.cameraError}>
          <AlertTriangle size={14} /> {cameraError}
        </div>
      )}

      {/* Bouton caméra */}
      <button
        className={`${styles.cameraBtn} ${cameraActive ? styles.cameraBtnActive : ''}`}
        onClick={cameraActive ? stopCamera : startCamera}
        disabled={scanning}
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
            // Sur mobile : clavier numérique/alphanumérique, majuscules auto
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
          />
          <button type="submit" className={styles.manualBtn}>
            <Zap size={14} /> Valider
          </button>
        </form>
      </div>
    </div>
  );
}

// Formulaire d'emprunt 
function EmpruntForm({
  book,
  onBack,
  onSuccess,
}: {
  book: Book;
  onBack: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [students, setStudents]   = useState<Student[]>([]);
  const [studentId, setStudentId] = useState('');
  const [dueAt, setDueAt]         = useState(addDays(15));
  const [loading, setLoading]     = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [error, setError]         = useState('');

  // Charger uniquement les élèves de la classe du livre
  useEffect(() => {
    studentsService.getStudentsByClassroom(book.classroomId).then(data => {
      setStudents(data);
      if (data.length > 0) setStudentId(data[0].id);
      setLoadingStudents(false);
    }).catch(() => setLoadingStudents(false));
  }, [book.classroomId]);

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

      {/* Info classe du livre */}
      {book.classroom && (
        <div className={styles.bookClassInfo}>
          <Users size={14} />
          Classe : <strong>{book.classroom.name}</strong>
          {book.classroom.school?.name && ` · ${book.classroom.school.name}`}
        </div>
      )}

      {error && <div className={styles.errorBox}><AlertTriangle size={16} />{error}</div>}

      <div className={styles.formSection}>
        {/* Sélecteur d'élève uniquement */}
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

// Formulaire de retour 
function RetourForm({
  book, loan, onBack, onSuccess,
}: {
  book: Book;
  loan: Loan | null;
  onBack: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [showReservation, setShowReservation] = useState(false);
  const [students, setStudents]           = useState<Student[]>([]);
  const [studentId, setStudentId]         = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [desiredFrom, setDesiredFrom]     = useState(addDays(1));
  const isLate = loan?.status === 'LATE';

  // Charger les élèves de la classe du livre quand on ouvre la réservation
  useEffect(() => {
    if (!showReservation) return;
    setLoadingStudents(true);
    studentsService.getStudentsByClassroom(book.classroomId).then(data => {
      setStudents(data);
      if (data.length > 0) setStudentId(data[0].id);
      setLoadingStudents(false);
    }).catch(() => setLoadingStudents(false));
  }, [showReservation, book.classroomId]);

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await booksService.returnBook(book.qrToken);
      if ('vibrate' in navigator) navigator.vibrate([80, 40, 80]);
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
      await booksService.createReservation({ qrToken: book.qrToken, studentId, desiredFrom });
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
            className={`${styles.confirmBtn} ${styles.confirmBtnBlue}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? <Loader size={18} className={styles.spin} /> : <CheckCircle size={18} />}
            {loading ? 'Enregistrement...' : 'Confirmer le retour'}
          </button>

          <button className={styles.reserveBtn} onClick={() => setShowReservation(true)}>
            <UserCheck size={16} /> Réserver pour un autre élève
          </button>
        </>
      ) : (
        <>
          <h2 className={styles.actionTitle}>Réserver ce livre</h2>
          <p className={styles.reserveHint}>Le livre sera réservé dès son retour en rayon.</p>

          {/* Info classe du livre */}
          {book.classroom && (
            <div className={styles.bookClassInfo}>
              <Users size={14} />
              Classe : <strong>{book.classroom.name}</strong>
              {book.classroom.school?.name && ` · ${book.classroom.school.name}`}
            </div>
          )}

          {error && <div className={styles.errorBox}><AlertTriangle size={16} />{error}</div>}

          <div className={styles.formSection}>
            {/* Élève uniquement */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}><User size={14} /> Élève</label>
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
                  <AlertTriangle size={14} /> Aucun élève dans cette classe.
                </p>
              )}
            </div>

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
            className={`${styles.confirmBtn} ${styles.confirmBtnBlue}`}
            onClick={handleReservation}
            disabled={loading || !studentId}
          >
            {loading ? <Loader size={18} className={styles.spin} /> : <UserCheck size={18} />}
            {loading ? 'Réservation...' : 'Confirmer la réservation'}
          </button>

          <button className={styles.reserveBtn} onClick={() => setShowReservation(false)}>
            <ArrowLeft size={16} /> Annuler
          </button>
        </>
      )}
    </div>
  );
}

function ReservedForm({
  book,
  onBack,
  onSuccess,
}: {
  book: Book;
  onBack: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [students, setStudents]     = useState<Student[]>([]);
  const [studentId, setStudentId]   = useState('');
  const [dueAt, setDueAt]           = useState(addDays(15));
  const [loading, setLoading]       = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    studentsService.getStudentsByClassroom(book.classroomId).then(data => {
      setStudents(data);
      if (data.length > 0) setStudentId(data[0].id);
      setLoadingStudents(false);
    }).catch(() => setLoadingStudents(false));
  }, [book.classroomId]);

  const handleConfirmLoan = async () => {
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
      onSuccess(`Emprunt confirmé pour ${student?.firstName} ${student?.lastName}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Erreur lors de l\'emprunt');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    setLoading(true);
    setError('');
    try {
      await booksService.cancelReservation(book.qrToken);
      onSuccess(`Réservation annulée — "${book.title}" est disponible`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Erreur lors de l\'annulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.actionPage}>
      <button className={styles.backBtn} onClick={onBack}>
        <ArrowLeft size={18} /> Retour
      </button>

      <div className={`${styles.bookCard} ${styles.bookCardReserved}`}>
        <div className={styles.bookCardIcon}>
          <UserCheck size={24} className={styles.iconPurple} />
        </div>
        <div className={styles.bookCardInfo}>
          <p className={styles.bookCardTitle}>{book.title}</p>
          <p className={styles.bookCardSub}>{book.universe ?? book.publisher ?? '—'}</p>
          <p className={styles.bookCardToken}>{book.qrToken} · Réservé</p>
        </div>
      </div>

      <h2 className={styles.actionTitle}>Livre réservé</h2>
      <p className={styles.reserveHint}>Ce livre est réservé. Confirmez l'emprunt pour l'élève concerné.</p>

      {error && <div className={styles.errorBox}><AlertTriangle size={16} />{error}</div>}

      <div className={styles.formSection}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}><User size={14} /> Élève</label>
          {loadingStudents ? (
            <div className={styles.loadingStudents}>
              <Loader size={16} className={styles.spin} /> Chargement...
            </div>
          ) : (
            <select
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              className={styles.formSelect}
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
              ))}
            </select>
          )}
        </div>

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
        className={`${styles.confirmBtn} ${styles.confirmBtnGreen}`}
        onClick={handleConfirmLoan}
        disabled={loading || !studentId}
      >
        {loading ? <Loader size={18} className={styles.spin} /> : <CheckCircle size={18} />}
        {loading ? 'Enregistrement...' : 'Confirmer l\'emprunt'}
      </button>

      <button
        className={styles.cancelReservationBtn}
        onClick={handleCancelReservation}
        disabled={loading}
      >
        <XCircle size={16} /> Annuler la réservation
      </button>
    </div>
  );
}

// Écran de succès 
function SuccessScreen({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <div className={styles.successPage}>
      <div className={styles.successIcon}>
        <CheckCircle size={48} />
      </div>
      <h2>Opération réussie !</h2>
      <p>{message}</p>
      <button className={`${styles.confirmBtn} ${styles.confirmBtnBlue}`} onClick={onReset}>
        <BookOpen size={18} /> Scanner un autre livre
      </button>
    </div>
  );
}

// Page principale 
type Phase = 'scan' | 'emprunt' | 'retour' | 'reserved' | 'success';

export default function ScanPage() {
  const [phase, setPhase]           = useState<Phase>('scan');
  const [book, setBook]             = useState<Book | null>(null);
  const [loan, setLoan]             = useState<Loan | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [scanError, setScanError]   = useState('');
  const [, setScanning]             = useState(false);

  const handleScan = async (qrToken: string) => {
    setScanning(true);
    setScanError('');
    try {
      const foundBook = await booksService.getBookByQrToken(qrToken);
      setBook(foundBook);
      if (foundBook.status === 'AVAILABLE') {
        setPhase('emprunt');
      } else if (foundBook.status === 'RESERVED') {
        setPhase('reserved'); 
      } else {
        const activeLoan =
          foundBook.currentLoan ??
          foundBook.loans?.find(l => l.status === 'ACTIVE' || l.status === 'LATE') ??
          null;
        setLoan(activeLoan);
        setPhase('retour');
      }
    } catch {
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
      {phase === 'retour'  && book && <RetourForm  book={book} loan={loan} onBack={reset} onSuccess={handleSuccess} />}
      {phase === 'reserved' && book &&<ReservedForm book={book} onBack={reset} onSuccess={handleSuccess} />}
      {phase === 'success' && <SuccessScreen message={successMsg} onReset={reset} />}
    </div>
  );
}