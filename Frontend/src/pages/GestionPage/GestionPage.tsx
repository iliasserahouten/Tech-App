import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Plus, School, Users, UserRound, Trash2, X, CalendarDays, Loader, AlertCircle, Search } from 'lucide-react';
import { schoolsService } from '../../services/schoolsService';
import { classroomsService } from '../../services/classroomsService';
import { studentsService } from '../../services/studentsService';
import { School as SchoolType, Classroom, Student, ClassSchedule, DayOfWeek } from '../../types';
import styles from './GestionPage.module.css';
import api from '../../lib/axios';

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Lundi', TUESDAY: 'Mardi', WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi', FRIDAY: 'Vendredi', SATURDAY: 'Samedi', SUNDAY: 'Dimanche',
};
const ALL_DAYS = Object.keys(DAY_LABELS) as DayOfWeek[];

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function GestionPage() {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students,   setStudents]   = useState<Student[]>([]);
  const [schedules,  setSchedules]  = useState<ClassSchedule[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');  {/* ← NOUVEAU */}

  const [openSchools,    setOpenSchools]    = useState<string[]>([]);
  const [openClassrooms, setOpenClassrooms] = useState<string[]>([]);

  const [fabOpen, setFabOpen] = useState(false);
  const [modal,   setModal]   = useState<'school' | 'classroom' | 'student' | 'schedule' | null>(null);

  const [fSchool,    setFSchool]    = useState({ name: '', city: '' });
  const [fClassroom, setFClassroom] = useState({ name: '', grade: '', schoolId: '' });
  const [fStudent,   setFStudent]   = useState({ firstName: '', lastName: '', classroomId: '' });
  const [fSchedule,  setFSchedule]  = useState({ classroomId: '', dayOfWeek: 'MONDAY' as DayOfWeek });
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sc, cl, sched] = await Promise.all([
        schoolsService.getMySchools(),
        classroomsService.getMyClassrooms(),
        classroomsService.getMySchedule(),
      ]);
      setSchools(sc);
      setClassrooms(cl);
      setSchedules(sched);
      if (cl.length > 0) {
        setFClassroom(f => ({ ...f, schoolId: cl[0].schoolId }));
        setFStudent(f => ({ ...f, classroomId: cl[0].id }));
        setFSchedule(f => ({ ...f, classroomId: cl[0].id }));
      }
      if (sc.length > 0) setFClassroom(f => ({ ...f, schoolId: sc[0].id }));

      const allStudents: Student[] = [];
      for (const cls of cl) {
        try {
          const s = await studentsService.getStudentsByClassroom(cls.id);
          allStudents.push(...s);
        } catch {}
      }
      setStudents(allStudents);
    } catch (err) {
      console.error('Erreur chargement gestion:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSchool    = (id: string) => setOpenSchools(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const toggleClassroom = (id: string) => setOpenClassrooms(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);

  const addSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setFormError('');
    try {
      const s = await schoolsService.createSchool({ name: fSchool.name, city: fSchool.city || undefined });
      setSchools(p => [...p, s]);
      setFSchool({ name: '', city: '' });
      setModal(null);
    } catch (err: any) { setFormError(err.response?.data?.message ?? 'Erreur'); }
    finally { setSaving(false); }
  };

  const addClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setFormError('');
    try {
      const c = await classroomsService.createClassroom({ name: fClassroom.name, grade: fClassroom.grade || undefined, schoolId: fClassroom.schoolId });
      setClassrooms(p => [...p, c]);
      setFClassroom(f => ({ ...f, name: '', grade: '' }));
      setModal(null);
    } catch (err: any) { setFormError(err.response?.data?.message ?? 'Erreur'); }
    finally { setSaving(false); }
  };

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setFormError('');
    try {
      const s = await studentsService.createStudent({ firstName: fStudent.firstName, lastName: fStudent.lastName, classroomId: fStudent.classroomId });
      setStudents(p => [...p, s]);
      setFStudent(f => ({ ...f, firstName: '', lastName: '' }));
      setModal(null);
    } catch (err: any) { setFormError(err.response?.data?.message ?? 'Erreur'); }
    finally { setSaving(false); }
  };

  const deleteSchool = async (id: string) => {
    if (!window.confirm('Supprimer cette école et toutes ses classes ?')) return;
    try { await schoolsService.deleteSchool(id); setSchools(p => p.filter(s => s.id !== id)); }
    catch { alert('Erreur lors de la suppression'); }
  };

  const deleteClassroom = async (id: string) => {
    if (!window.confirm('Supprimer cette classe et tous ses élèves ?')) return;
    try { await classroomsService.deleteClassroom(id); setClassrooms(p => p.filter(c => c.id !== id)); }
    catch { alert('Erreur lors de la suppression'); }
  };

  const deleteStudent = async (id: string) => {
    try { await studentsService.deleteStudent(id); setStudents(p => p.filter(s => s.id !== id)); }
    catch { alert('Erreur lors de la suppression'); }
  };

  const addSchedule = async () => {
    if (!fSchedule.classroomId) return;
    setSaving(true); setFormError('');
    try {
      const response = await api.post('/class-schedules', {
        classroomId: fSchedule.classroomId,
        dayOfWeek: fSchedule.dayOfWeek,
      });
      const newSchedule = response.data?.data ?? response.data;
      setSchedules(prev => {
        const filtered = prev.filter(s => s.dayOfWeek !== fSchedule.dayOfWeek);
        return [...filtered, newSchedule];
      });
      setModal(null);
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message ?? 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  // ← NOUVEAU : filtrage des écoles selon la recherche
  const filteredSchools = schools.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.city?.toLowerCase().includes(search.toLowerCase()) ||
    classrooms.filter(c => c.schoolId === s.id).some(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      students.filter(st => st.classroomId === c.id).some(st =>
        `${st.firstName} ${st.lastName}`.toLowerCase().includes(search.toLowerCase())
      )
    )
  );

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader size={40} className={styles.spin} />
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestion</h1>
        <p className={styles.count}>{schools.length} école(s) · {classrooms.length} classe(s) · {students.length} élève(s)</p>
      </div>

      {/* ← NOUVEAU : Barre de recherche */}
      <div className={styles.searchWrapper}>
        <Search size={15} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Rechercher une école, classe ou élève…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Planning de la semaine */}
      <div className={styles.scheduleCard}>
        <div className={styles.scheduleHeader}>
          <h2 className={styles.sectionTitle}><CalendarDays size={16} /> Planning de la semaine</h2>
          <button className={styles.editScheduleBtn} onClick={() => { setModal('schedule'); setFabOpen(false); }}>Modifier</button>
        </div>
        <div className={styles.scheduleGrid}>
          {(['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'] as DayOfWeek[]).map(day => {
            const sched = schedules.find(s => s.dayOfWeek === day);
            const cls   = classrooms.find(c => c.id === sched?.classroomId);
            return (
              <div key={day} className={`${styles.scheduleDay} ${sched ? styles.scheduleDayActive : ''}`}>
                <p className={styles.scheduleDayName}>{DAY_LABELS[day].slice(0, 3)}</p>
                <p className={styles.scheduleDayClass}>{cls?.name ?? '—'}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accordéon Écoles > Classes > Élèves */}
      <div className={styles.accordion}>
        {/* ← MODIFIÉ : filteredSchools au lieu de schools */}
        {filteredSchools.length === 0 ? (
          <div className={styles.emptyState}>
            <School size={40} className={styles.emptyIcon} />
            <p>{search ? 'Aucun résultat pour cette recherche.' : 'Aucune école. Cliquez sur + pour en ajouter une.'}</p>
          </div>
        ) : (
          // ← MODIFIÉ : filteredSchools au lieu de schools
          filteredSchools.map(school => {
            const schoolClassrooms = classrooms.filter(c => c.schoolId === school.id);
            const isOpen = openSchools.includes(school.id);
            return (
              <div key={school.id} className={styles.schoolBlock}>
                <div className={styles.schoolRow} onClick={() => toggleSchool(school.id)}>
                  <div className={styles.schoolIcon}><School size={18} /></div>
                  <div className={styles.schoolInfo}>
                    <p className={styles.schoolName}>{school.name}</p>
                    <p className={styles.schoolMeta}>{school.city} · {schoolClassrooms.length} classe(s)</p>
                  </div>
                  <button className={styles.deleteIconBtn} onClick={e => { e.stopPropagation(); deleteSchool(school.id); }}>
                    <Trash2 size={14} />
                  </button>
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>

                {isOpen && (
                  <div className={styles.classroomsContainer}>
                    {schoolClassrooms.length === 0 ? (
                      <p className={styles.emptyClassrooms}>Aucune classe. Ajoutez-en via le bouton +</p>
                    ) : (
                      schoolClassrooms.map(cls => {
                        const clsStudents = students.filter(s => s.classroomId === cls.id);
                        const clsSchedule = schedules.find(s => s.classroomId === cls.id);
                        const isClassOpen = openClassrooms.includes(cls.id);
                        return (
                          <div key={cls.id} className={styles.classroomBlock}>
                            <div className={styles.classroomRow} onClick={() => toggleClassroom(cls.id)}>
                              <div className={styles.classroomIcon}><Users size={14} /></div>
                              <div className={styles.classroomInfo}>
                                <p className={styles.classroomName}>{cls.name} {cls.grade ? `(${cls.grade})` : ''}</p>
                                <p className={styles.classroomMeta}>
                                  {clsStudents.length} élève(s)
                                  {clsSchedule ? ` · ${DAY_LABELS[clsSchedule.dayOfWeek]}` : ''}
                                </p>
                              </div>
                              <button className={styles.deleteIconBtn} onClick={e => { e.stopPropagation(); deleteClassroom(cls.id); }}>
                                <Trash2 size={12} />
                              </button>
                              {isClassOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </div>

                            {isClassOpen && (
                              <div className={styles.studentsContainer}>
                                {clsStudents.length === 0 ? (
                                  <p className={styles.emptyStudents}>Aucun élève.</p>
                                ) : (
                                  clsStudents.map(student => (
                                    <div key={student.id} className={styles.studentRow}>
                                      <div className={styles.studentAvatar}>
                                        {student.firstName.charAt(0)}
                                      </div>
                                      <p className={styles.studentName}>{student.firstName} <strong>{student.lastName}</strong></p>
                                      <button className={styles.deleteStudentBtn} onClick={() => deleteStudent(student.id)}>
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* FAB flottant */}
      <div className={styles.fabContainer}>
        {fabOpen && (
          <div className={styles.fabMenu}>
            {[
              { label: 'Ajouter une école',   icon: School,       action: () => { setModal('school');    setFabOpen(false); } },
              { label: 'Ajouter une classe',  icon: Users,        action: () => { setModal('classroom'); setFabOpen(false); } },
              { label: 'Ajouter un élève',    icon: UserRound,    action: () => { setModal('student');   setFabOpen(false); } },
              { label: 'Planning semaine',    icon: CalendarDays, action: () => { setModal('schedule');  setFabOpen(false); } },
            ].map(({ label, icon: Icon, action }) => (
              <button key={label} className={styles.fabMenuItem} onClick={action}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        )}
        <button className={`${styles.fab} ${fabOpen ? styles.fabOpen : ''}`} onClick={() => setFabOpen(!fabOpen)}>
          <Plus size={24} />
        </button>
      </div>

      {/* ── Modales ── */}
      {modal === 'school' && (
        <Modal title="Nouvelle École" onClose={() => setModal(null)}>
          {formError && <div className={styles.formError}><AlertCircle size={14} />{formError}</div>}
          <form onSubmit={addSchool} className={styles.form}>
            <div className={styles.formGroup}><label>Nom *</label><input value={fSchool.name} onChange={e => setFSchool({ ...fSchool, name: e.target.value })} required /></div>
            <div className={styles.formGroup}><label>Ville</label><input value={fSchool.city} onChange={e => setFSchool({ ...fSchool, city: e.target.value })} /></div>
            <button type="submit" className={styles.submitBtn} disabled={saving}>{saving ? 'Création...' : 'Créer'}</button>
          </form>
        </Modal>
      )}

      {modal === 'classroom' && (
        <Modal title="Nouvelle Classe" onClose={() => setModal(null)}>
          {formError && <div className={styles.formError}><AlertCircle size={14} />{formError}</div>}
          <form onSubmit={addClassroom} className={styles.form}>
            <div className={styles.formGroup}><label>Nom *</label><input value={fClassroom.name} onChange={e => setFClassroom({ ...fClassroom, name: e.target.value })} required /></div>
            <div className={styles.formGroup}><label>Niveau (ex: CE1)</label><input value={fClassroom.grade} onChange={e => setFClassroom({ ...fClassroom, grade: e.target.value })} /></div>
            <div className={styles.formGroup}>
              <label>École *</label>
              <select value={fClassroom.schoolId} onChange={e => setFClassroom({ ...fClassroom, schoolId: e.target.value })} required>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={saving}>{saving ? 'Création...' : 'Créer'}</button>
          </form>
        </Modal>
      )}

      {modal === 'student' && (
        <Modal title="Nouvel Élève" onClose={() => setModal(null)}>
          {formError && <div className={styles.formError}><AlertCircle size={14} />{formError}</div>}
          <form onSubmit={addStudent} className={styles.form}>
            <div className={styles.formGroup}><label>Prénom *</label><input value={fStudent.firstName} onChange={e => setFStudent({ ...fStudent, firstName: e.target.value })} required /></div>
            <div className={styles.formGroup}><label>Nom *</label><input value={fStudent.lastName} onChange={e => setFStudent({ ...fStudent, lastName: e.target.value })} required /></div>
            <div className={styles.formGroup}>
              <label>Classe *</label>
              <select value={fStudent.classroomId} onChange={e => setFStudent({ ...fStudent, classroomId: e.target.value })} required>
                {classrooms.map(c => <option key={c.id} value={c.id}>{c.schoolName ? `[${c.schoolName}] ` : ''}{c.name}{c.grade ? ` - ${c.grade}` : ''}
</option>)}
              </select>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={saving}>{saving ? 'Création...' : 'Créer'}</button>
          </form>
        </Modal>
      )}

      {modal === 'schedule' && (
        <Modal title="Planning de la semaine" onClose={() => setModal(null)}>
          <p className={styles.scheduleHint}>Associez chaque jour à une classe. Un seul par jour.</p>
          {formError && <div className={styles.formError}><AlertCircle size={14} />{formError}</div>}
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label>Jour</label>
              <select value={fSchedule.dayOfWeek} onChange={e => setFSchedule({ ...fSchedule, dayOfWeek: e.target.value as DayOfWeek })}>
                {ALL_DAYS.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Classe</label>
              <select value={fSchedule.classroomId} onChange={e => setFSchedule({ ...fSchedule, classroomId: e.target.value })}>
                {classrooms.map(c => <option key={c.id} value={c.id}>{c.schoolName ? `[${c.schoolName}] ` : ''}{c.name}{c.grade ? ` - ${c.grade}` : ''}
</option>)}
              </select>
            </div>
            <button className={styles.submitBtn} onClick={addSchedule} disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
} 