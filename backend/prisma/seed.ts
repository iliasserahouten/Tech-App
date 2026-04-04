import { PrismaClient, BookStatus, LoanStatus, DayOfWeek } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Début du seed...');

  await prisma.reservation.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.book.deleteMany();
  await prisma.classSchedule.deleteMany();
  await prisma.teacherClassroom.deleteMany();
  await prisma.student.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.school.deleteMany();
  console.log('Base nettoyée');

  const passwordHash = await bcrypt.hash('demo1234', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@bibliotheque.fr' },
    update: {},
    create: {
      email: 'demo@bibliotheque.fr',
      passwordHash,
      firstName: 'Marie',
      lastName: 'Dupont',
    },
  });
  console.log(`User créé : ${user.email}`);

  const schoolFerry = await prisma.school.create({
    data: { name: 'École Jules Ferry', city: 'Paris', teacherId: user.id },
  });
  const schoolHugo = await prisma.school.create({
    data: { name: 'École Victor Hugo', city: 'Lyon', teacherId: user.id },
  });
  console.log('Écoles créées');

  const cpA = await prisma.classroom.create({
    data: { name: 'CP A', schoolId: schoolFerry.id },
  });
  const ce1B = await prisma.classroom.create({
    data: { name: 'CE1 B', schoolId: schoolFerry.id },
  });
  const cm1A = await prisma.classroom.create({
    data: { name: 'CM1 A', schoolId: schoolFerry.id },
  });
  const cm2B = await prisma.classroom.create({
    data: { name: 'CM2 B', schoolId: schoolHugo.id },
  });
  console.log('Classes créées');

  await prisma.teacherClassroom.createMany({
    data: [
      { teacherId: user.id, classroomId: cpA.id  },
      { teacherId: user.id, classroomId: ce1B.id },
      { teacherId: user.id, classroomId: cm1A.id },
      { teacherId: user.id, classroomId: cm2B.id },
    ],
  });
  console.log('Liaisons enseignant-classes créées');

  await prisma.classSchedule.createMany({
    data: [
      { dayOfWeek: DayOfWeek.MONDAY,    classroomId: cpA.id,  teacherId: user.id },
      { dayOfWeek: DayOfWeek.TUESDAY,   classroomId: ce1B.id, teacherId: user.id },
      { dayOfWeek: DayOfWeek.WEDNESDAY, classroomId: cm1A.id, teacherId: user.id },
      { dayOfWeek: DayOfWeek.THURSDAY,  classroomId: cm2B.id, teacherId: user.id },
      { dayOfWeek: DayOfWeek.FRIDAY,    classroomId: cpA.id,  teacherId: user.id },
    ],
  });
  console.log(' Planning créé');

  const [lucas, emma, noah, lea, tom, ines, louis, jade] = await Promise.all([
    prisma.student.create({ data: { firstName: 'Lucas', lastName: 'Martin',  classroomId: cpA.id  } }),
    prisma.student.create({ data: { firstName: 'Emma',  lastName: 'Bernard', classroomId: cpA.id  } }),
    prisma.student.create({ data: { firstName: 'Noah',  lastName: 'Petit',   classroomId: ce1B.id } }),
    prisma.student.create({ data: { firstName: 'Léa',   lastName: 'Durand',  classroomId: ce1B.id } }),
    prisma.student.create({ data: { firstName: 'Tom',   lastName: 'Simon',   classroomId: cm1A.id } }),
    prisma.student.create({ data: { firstName: 'Inès',  lastName: 'Laurent', classroomId: cm1A.id } }),
    prisma.student.create({ data: { firstName: 'Louis', lastName: 'Michel',  classroomId: cm2B.id } }),
    prisma.student.create({ data: { firstName: 'Jade',  lastName: 'Garcia',  classroomId: cm2B.id } }),
  ]);
  console.log(' Élèves créés');

  const [petitPrince, charlotteWeb, harryPotter, matilda, miserables, voyage, lion, james] =
    await Promise.all([
      prisma.book.create({ data: { title: "Le Petit Prince",                universe: "Classiques",  publisher: "Gallimard",     status: BookStatus.AVAILABLE, qrToken: "LIV-0001", classroomId: cpA.id  } }),
      prisma.book.create({ data: { title: "Charlotte's Web",                universe: "Jeunesse",    publisher: "HarperCollins", status: BookStatus.LOANED,    qrToken: "LIV-0002", classroomId: cpA.id  } }),
      prisma.book.create({ data: { title: "Harry Potter T1",                universe: "Fantastique", publisher: "Gallimard",     status: BookStatus.LOANED,    qrToken: "LIV-0003", classroomId: ce1B.id } }),
      prisma.book.create({ data: { title: "Matilda",                        universe: "Jeunesse",    publisher: "Gallimard",     status: BookStatus.AVAILABLE, qrToken: "LIV-0004", classroomId: ce1B.id } }),
      prisma.book.create({ data: { title: "Les Misérables (abrégé)",        universe: "Classiques",  publisher: "Hachette",      status: BookStatus.AVAILABLE, qrToken: "LIV-0005", classroomId: cm1A.id } }),
      prisma.book.create({ data: { title: "Voyage au Centre de la Terre",   universe: "Aventure",    publisher: "Hetzel",        status: BookStatus.AVAILABLE, qrToken: "LIV-0006", classroomId: cm1A.id } }),
      prisma.book.create({ data: { title: "Le Lion et la Sorcière Blanche", universe: "Fantastique", publisher: "Gallimard",     status: BookStatus.RESERVED,  qrToken: "LIV-0007", classroomId: cm2B.id } }),
      prisma.book.create({ data: { title: "James et la Grosse Pêche",       universe: "Jeunesse",    publisher: "Gallimard",     status: BookStatus.AVAILABLE, qrToken: "LIV-0008", classroomId: cm2B.id } }),
    ]);
  console.log(' Livres créés');

  const now = new Date();
  const daysAgo  = (n: number) => new Date(now.getTime() - n * 86400000);
  const daysFrom = (n: number) => new Date(now.getTime() + n * 86400000);

  await prisma.loan.createMany({
    data: [
      {
        status: LoanStatus.ACTIVE,
        borrowedAt: daysAgo(10),
        dueAt: daysFrom(5),
        bookId: charlotteWeb.id,
        studentId: lucas.id,
        teacherId: user.id,
      },
      {
        status: LoanStatus.LATE,
        borrowedAt: daysAgo(30),
        dueAt: daysAgo(10),
        bookId: harryPotter.id,
        studentId: noah.id,
        teacherId: user.id,
      },
      {
        status: LoanStatus.RETURNED,
        borrowedAt: daysAgo(20),
        dueAt: daysAgo(5),
        returnedAt: daysAgo(6),
        bookId: petitPrince.id,
        studentId: emma.id,
        teacherId: user.id,
      },
    ],
  });
  console.log(' Emprunts créés');

  await prisma.reservation.create({
    data: {
      bookId:      lion.id,
      studentId:   jade.id,
      teacherId:   user.id,
      desiredFrom: daysFrom(7),
    },
  });
  console.log(' Réservation créée');

  console.log('\n Seed terminé avec succès !');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email    : demo@bibliotheque.fr');
  console.log(' Password : demo1234');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error(' Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });