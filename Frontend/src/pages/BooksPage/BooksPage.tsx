import { useEffect, useState } from 'react';
import { Plus, Trash2, Search, QrCode, X, ChevronDown, BookOpen, Loader } from 'lucide-react';
import { booksService } from '../../services/booksService';
import { classroomsService } from '../../services/classroomsService';
import { schoolsService } from '../../services/schoolsService';
import { Book, Classroom, School, BookStatus } from '../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import styles from './BooksPage.module.css';

// ── Badge statut ──
function StatusBadge({ status }: { status: BookStatus }) {
  const map = {
    AVAILABLE: { label: 'Disponible', className: styles.badgeAvailable },
    LOANED:    { label: 'Emprunté',   className: styles.badgeLoan },
    RESERVED:  { label: 'Réservé',    className: styles.badgeReserved },
  };
  const { label, className } = map[status] ?? map.AVAILABLE;
  return <span className={`${styles.badge} ${className}`}>{label}</span>;
}

// ── Modale QR ──
function QRModal({ book, onClose }: { book: Book; onClose: () => void }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Étiquette QR Code</h3>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <div className={styles.qrContent}>
          <div className={styles.qrPlaceholder}>
            <QrCode size={96} />
            <p className={styles.qrToken}>{book.qrToken}</p>
          </div>
          <p className={styles.qrBookTitle}>{book.title}</p>
          {book.publisher && <p className={styles.qrPublisher}>{book.publisher}</p>}
          {book.classroom && (
            <p className={styles.qrClassroom}>
              {book.classroom.school?.name} · {book.classroom.name}
            </p>
          )}
        </div>
        <button className={styles.printBtn} onClick={() => window.print()}>
          Imprimer l'étiquette
        </button>
      </div>
    </div>
  );
}

// ── Modale ajout livre ──
function AddBookModal({
  classrooms,
  onClose,
  onAdd,
}: {
  classrooms: Classroom[];
  onClose: () => void;
  onAdd: (book: Book) => void;
}) {
  const [form, setForm] = useState({
    title: '',
    universe: '',
    publisher: '',
    classroomId: classrooms[0]?.id ?? '',
    qrToken: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.classroomId) return;
    setLoading(true);
    setError('');
    try {
      const newBook = await booksService.createBook({
        title: form.title,
        universe: form.universe || undefined,
        publisher: form.publisher || undefined,
        classroomId: form.classroomId,
        qrToken: form.qrToken || undefined,
      });
      onAdd(newBook);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Nouveau Livre</h3>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>
        {error && <p className={styles.errorMsg}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Titre *</label>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Univers / Série</label>
            <input
              value={form.universe}
              onChange={e => setForm({ ...form, universe: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Éditeur</label>
            <input
              value={form.publisher}
              onChange={e => setForm({ ...form, publisher: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Classe *</label>
            <select
              value={form.classroomId}
              onChange={e => setForm({ ...form, classroomId: e.target.value })}
              required
            >
              {classrooms.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.grade ? ` - ${c.grade}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>QR Token <span className={styles.optional}>(optionnel — généré automatiquement si vide)</span></label>
            <input
              value={form.qrToken}
              onChange={e => setForm({ ...form, qrToken: e.target.value })}
              placeholder="Ex: LIV-0010"
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <Loader size={16} className={styles.spin} /> : <Plus size={16} />}
            {loading ? 'Création...' : 'Créer le livre'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Page principale ──
export default function BooksPage() {
  const [books, setBooks]           = useState<Book[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [schools, setSchools]       = useState<School[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filtreClassroom, setFiltreClassroom] = useState('');
  const [filtreStatus, setFiltreStatus]       = useState<BookStatus | ''>('');
  const [selectedBook, setSelectedBook]       = useState<Book | null>(null);
  const [showQR, setShowQR]                   = useState(false);
  const [showAdd, setShowAdd]                 = useState(false);
  const [selectedIds, setSelectedIds]         = useState<string[]>([]);
  const [deleting, setDeleting]               = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [booksData, classroomsData, schoolsData] = await Promise.all([
        booksService.getBooks(),
        classroomsService.getMyClassrooms(),
        schoolsService.getMySchools(),
      ]);
      setBooks(booksData);
      setClassrooms(classroomsData);
      setSchools(schoolsData);

      // Smart Filter: pré-sélectionner la classe du jour
      const todayClassroom = await classroomsService.getTodayClassroom();
      if (todayClassroom) setFiltreClassroom(todayClassroom.id);
    } catch (err) {
      console.error('Erreur chargement livres:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = books.filter(b => {
    const matchSearch    = !search || b.title.toLowerCase().includes(search.toLowerCase()) || (b.universe ?? '').toLowerCase().includes(search.toLowerCase());
    const matchClassroom = !filtreClassroom || b.classroomId === filtreClassroom;
    const matchStatus    = !filtreStatus    || b.status === filtreStatus;
    return matchSearch && matchClassroom && matchStatus;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Supprimer ${selectedIds.length} livre(s) ?`)) return;
    setDeleting(true);
    try {
      await Promise.all(selectedIds.map(id => booksService.deleteBook(id)));
      setBooks(prev => prev.filter(b => !selectedIds.includes(b.id)));
      setSelectedIds([]);
    } catch (err) {
      alert('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader size={40} className={styles.spin} />
        <p>Chargement des livres...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Bibliothèque</h1>
        <div className={styles.actions}>
          {selectedIds.length > 0 && (
            <button className={styles.deleteBtn} onClick={handleDelete} disabled={deleting}>
              <Trash2 size={16} />
              Supprimer ({selectedIds.length})
            </button>
          )}
          <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
            <Plus size={16} />
            Nouveau livre
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Rechercher un titre, un univers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterRow}>
          <div className={styles.selectWrapper}>
            <select
              value={filtreClassroom}
              onChange={e => setFiltreClassroom(e.target.value)}
              className={styles.select}
            >
              <option value="">Toutes les classes</option>
              {classrooms.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.grade ? ` - ${c.grade}` : ''}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className={styles.chevron} />
          </div>
          <div className={styles.selectWrapper}>
            <select
              value={filtreStatus}
              onChange={e => setFiltreStatus(e.target.value as BookStatus | '')}
              className={styles.select}
            >
              <option value="">Tous les statuts</option>
              <option value="AVAILABLE">Disponible</option>
              <option value="LOANED">Emprunté</option>
              <option value="RESERVED">Réservé</option>
            </select>
            <ChevronDown size={14} className={styles.chevron} />
          </div>
        </div>
      </div>

      <p className={styles.count}>{filtered.length} livre{filtered.length > 1 ? 's' : ''}</p>

      {/* Liste des livres */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <BookOpen size={48} className={styles.emptyIcon} />
          <p>Aucun livre ne correspond aux filtres</p>
        </div>
      ) : (
        <div className={styles.booksList}>
          {filtered.map(book => {
            const activeLoan = book.currentLoan ?? book.loans?.find(l => l.status === 'ACTIVE' || l.status === 'LATE');
            const isSelected = selectedIds.includes(book.id);
            return (
              <div
                key={book.id}
                className={`${styles.bookCard} ${isSelected ? styles.bookCardSelected : ''}`}
                onClick={() => { setSelectedBook(book); setShowQR(false); }}
              >
                <div className={styles.bookInfo}>
                  <div className={styles.bookMeta}>
                    <p className={styles.bookTitle}>{book.title}</p>
                    <p className={styles.bookSub}>
                      {book.universe ?? book.publisher ?? '—'}
                    </p>
                    <div className={styles.bookBadges}>
                      <StatusBadge status={book.status} />
                      {book.status === 'LOANED' && activeLoan?.dueAt && (
                        <span className={styles.dueDate}>
                          Retour le {format(new Date(activeLoan.dueAt), 'dd/MM/yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.bookRight}>
                  <p className={styles.bookToken}>{book.qrToken}</p>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={e => { e.stopPropagation(); toggleSelect(book.id); }}
                    onClick={e => e.stopPropagation()}
                    className={styles.checkbox}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modale détail livre */}
      {selectedBook && !showQR && (
        <div className={styles.modalOverlay} onClick={() => setSelectedBook(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Détails du livre</h3>
              <button className={styles.closeBtn} onClick={() => setSelectedBook(null)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.bookDetail}>
              <p className={styles.detailTitle}>{selectedBook.title}</p>
              {selectedBook.universe && <p className={styles.detailSub}>{selectedBook.universe}</p>}
              {selectedBook.publisher && <p className={styles.detailSub}>{selectedBook.publisher}</p>}
              <div className={styles.detailRow}>
                <span>Statut</span>
                <StatusBadge status={selectedBook.status} />
              </div>
              <div className={styles.detailRow}>
                <span>QR Code</span>
                <code className={styles.detailToken}>{selectedBook.qrToken}</code>
              </div>
              {selectedBook.classroom && (
                <div className={styles.detailRow}>
                  <span>Classe</span>
                  <span>{selectedBook.classroom.name}</span>
                </div>
              )}
              {selectedBook.status === 'LOANED' && selectedBook.currentLoan && (
                <>
                  <div className={styles.detailRow}>
                    <span>Emprunté par</span>
                    <span>
                      {selectedBook.currentLoan.student?.firstName}{' '}
                      {selectedBook.currentLoan.student?.lastName}
                    </span>
                  </div>
                  {selectedBook.currentLoan.dueAt && (
                    <div className={styles.detailRow}>
                      <span>Retour prévu</span>
                      <span className={styles.dueDateDetail}>
                        {format(new Date(selectedBook.currentLoan.dueAt), 'dd MMMM yyyy', { locale: fr })}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
            <button
              className={styles.printBtn}
              onClick={() => setShowQR(true)}
            >
              <QrCode size={16} />
              Imprimer l'étiquette QR
            </button>
          </div>
        </div>
      )}

      {/* Modale QR */}
      {selectedBook && showQR && (
        <QRModal
          book={selectedBook}
          onClose={() => { setShowQR(false); setSelectedBook(null); }}
        />
      )}

      {/* Modale ajout */}
      {showAdd && (
        <AddBookModal
          classrooms={classrooms}
          onClose={() => setShowAdd(false)}
          onAdd={book => setBooks(prev => [book, ...prev])}
        />
      )}
    </div>
  );
}