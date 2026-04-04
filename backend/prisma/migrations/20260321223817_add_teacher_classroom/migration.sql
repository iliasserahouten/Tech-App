/*
  Warnings:

  - You are about to drop the `classe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ecole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `eleve` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `emprunt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `enseignant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `enseignant_classe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `livre` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `planning_semaine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reservation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "classe" DROP CONSTRAINT "classe_ecole_id_fkey";

-- DropForeignKey
ALTER TABLE "ecole" DROP CONSTRAINT "ecole_enseignant_id_fkey";

-- DropForeignKey
ALTER TABLE "eleve" DROP CONSTRAINT "eleve_classe_id_fkey";

-- DropForeignKey
ALTER TABLE "emprunt" DROP CONSTRAINT "emprunt_eleve_id_fkey";

-- DropForeignKey
ALTER TABLE "emprunt" DROP CONSTRAINT "emprunt_enseignant_id_fkey";

-- DropForeignKey
ALTER TABLE "emprunt" DROP CONSTRAINT "emprunt_livre_id_fkey";

-- DropForeignKey
ALTER TABLE "enseignant_classe" DROP CONSTRAINT "enseignant_classe_classe_id_fkey";

-- DropForeignKey
ALTER TABLE "enseignant_classe" DROP CONSTRAINT "enseignant_classe_enseignant_id_fkey";

-- DropForeignKey
ALTER TABLE "livre" DROP CONSTRAINT "livre_classe_id_fkey";

-- DropForeignKey
ALTER TABLE "planning_semaine" DROP CONSTRAINT "planning_semaine_classe_id_fkey";

-- DropForeignKey
ALTER TABLE "planning_semaine" DROP CONSTRAINT "planning_semaine_enseignant_id_fkey";

-- DropForeignKey
ALTER TABLE "reservation" DROP CONSTRAINT "reservation_eleve_id_fkey";

-- DropForeignKey
ALTER TABLE "reservation" DROP CONSTRAINT "reservation_enseignant_id_fkey";

-- DropForeignKey
ALTER TABLE "reservation" DROP CONSTRAINT "reservation_livre_id_fkey";

-- DropTable
DROP TABLE "classe";

-- DropTable
DROP TABLE "ecole";

-- DropTable
DROP TABLE "eleve";

-- DropTable
DROP TABLE "emprunt";

-- DropTable
DROP TABLE "enseignant";

-- DropTable
DROP TABLE "enseignant_classe";

-- DropTable
DROP TABLE "livre";

-- DropTable
DROP TABLE "planning_semaine";

-- DropTable
DROP TABLE "reservation";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classroom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "schoolId" TEXT NOT NULL,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherClassroom" (
    "teacherId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherClassroom_pkey" PRIMARY KEY ("teacherId","classroomId")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "classroomId" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "universe" TEXT,
    "publisher" TEXT,
    "status" "BookStatus" NOT NULL DEFAULT 'AVAILABLE',
    "qrToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "classroomId" TEXT NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'ACTIVE',
    "borrowedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "desiredFrom" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSchedule" (
    "id" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "teacherId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,

    CONSTRAINT "ClassSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "School_teacherId_idx" ON "School"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "School_teacherId_name_key" ON "School"("teacherId", "name");

-- CreateIndex
CREATE INDEX "Classroom_schoolId_idx" ON "Classroom"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_schoolId_name_key" ON "Classroom"("schoolId", "name");

-- CreateIndex
CREATE INDEX "TeacherClassroom_teacherId_idx" ON "TeacherClassroom"("teacherId");

-- CreateIndex
CREATE INDEX "TeacherClassroom_classroomId_idx" ON "TeacherClassroom"("classroomId");

-- CreateIndex
CREATE INDEX "Student_classroomId_idx" ON "Student"("classroomId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_classroomId_firstName_lastName_key" ON "Student"("classroomId", "firstName", "lastName");

-- CreateIndex
CREATE UNIQUE INDEX "Book_qrToken_key" ON "Book"("qrToken");

-- CreateIndex
CREATE INDEX "Book_classroomId_idx" ON "Book"("classroomId");

-- CreateIndex
CREATE INDEX "Book_status_idx" ON "Book"("status");

-- CreateIndex
CREATE INDEX "Loan_bookId_idx" ON "Loan"("bookId");

-- CreateIndex
CREATE INDEX "Loan_studentId_idx" ON "Loan"("studentId");

-- CreateIndex
CREATE INDEX "Loan_teacherId_idx" ON "Loan"("teacherId");

-- CreateIndex
CREATE INDEX "Loan_status_idx" ON "Loan"("status");

-- CreateIndex
CREATE INDEX "Reservation_teacherId_idx" ON "Reservation"("teacherId");

-- CreateIndex
CREATE INDEX "Reservation_bookId_idx" ON "Reservation"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_bookId_studentId_key" ON "Reservation"("bookId", "studentId");

-- CreateIndex
CREATE INDEX "ClassSchedule_classroomId_idx" ON "ClassSchedule"("classroomId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSchedule_teacherId_dayOfWeek_key" ON "ClassSchedule"("teacherId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherClassroom" ADD CONSTRAINT "TeacherClassroom_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherClassroom" ADD CONSTRAINT "TeacherClassroom_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSchedule" ADD CONSTRAINT "ClassSchedule_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSchedule" ADD CONSTRAINT "ClassSchedule_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
