/*
  Warnings:

  - You are about to drop the `Book` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClassSchedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Classroom` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Loan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reservation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `School` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_classroomId_fkey";

-- DropForeignKey
ALTER TABLE "ClassSchedule" DROP CONSTRAINT "ClassSchedule_classroomId_fkey";

-- DropForeignKey
ALTER TABLE "ClassSchedule" DROP CONSTRAINT "ClassSchedule_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "Classroom" DROP CONSTRAINT "Classroom_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "Loan" DROP CONSTRAINT "Loan_bookId_fkey";

-- DropForeignKey
ALTER TABLE "Loan" DROP CONSTRAINT "Loan_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Loan" DROP CONSTRAINT "Loan_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_bookId_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "School" DROP CONSTRAINT "School_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_classroomId_fkey";

-- DropTable
DROP TABLE "Book";

-- DropTable
DROP TABLE "ClassSchedule";

-- DropTable
DROP TABLE "Classroom";

-- DropTable
DROP TABLE "Loan";

-- DropTable
DROP TABLE "Reservation";

-- DropTable
DROP TABLE "School";

-- DropTable
DROP TABLE "Student";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "enseignant" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mot_de_passe" TEXT NOT NULL,
    "prenom" TEXT,
    "nom" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enseignant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecole" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "ville" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "enseignant_id" TEXT NOT NULL,

    CONSTRAINT "ecole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classe" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "niveau" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ecole_id" TEXT NOT NULL,

    CONSTRAINT "classe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enseignant_classe" (
    "enseignant_id" TEXT NOT NULL,
    "classe_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enseignant_classe_pkey" PRIMARY KEY ("enseignant_id","classe_id")
);

-- CreateTable
CREATE TABLE "eleve" (
    "id" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "classe_id" TEXT NOT NULL,

    CONSTRAINT "eleve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livre" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "univers" TEXT,
    "editeur" TEXT,
    "statut" "BookStatus" NOT NULL DEFAULT 'AVAILABLE',
    "qr_token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "classe_id" TEXT NOT NULL,

    CONSTRAINT "livre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emprunt" (
    "id" TEXT NOT NULL,
    "statut" "LoanStatus" NOT NULL DEFAULT 'ACTIVE',
    "date_emprunt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_retour_prevue" TIMESTAMP(3),
    "date_retour_effectif" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "livre_id" TEXT NOT NULL,
    "eleve_id" TEXT NOT NULL,
    "enseignant_id" TEXT NOT NULL,

    CONSTRAINT "emprunt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation" (
    "id" TEXT NOT NULL,
    "date_souhaitee" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "livre_id" TEXT NOT NULL,
    "eleve_id" TEXT NOT NULL,
    "enseignant_id" TEXT NOT NULL,

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planning_semaine" (
    "id" TEXT NOT NULL,
    "jour_semaine" "DayOfWeek" NOT NULL,
    "enseignant_id" TEXT NOT NULL,
    "classe_id" TEXT NOT NULL,

    CONSTRAINT "planning_semaine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "enseignant_email_key" ON "enseignant"("email");

-- CreateIndex
CREATE INDEX "ecole_enseignant_id_idx" ON "ecole"("enseignant_id");

-- CreateIndex
CREATE UNIQUE INDEX "ecole_enseignant_id_nom_key" ON "ecole"("enseignant_id", "nom");

-- CreateIndex
CREATE INDEX "classe_ecole_id_idx" ON "classe"("ecole_id");

-- CreateIndex
CREATE UNIQUE INDEX "classe_ecole_id_nom_key" ON "classe"("ecole_id", "nom");

-- CreateIndex
CREATE INDEX "enseignant_classe_enseignant_id_idx" ON "enseignant_classe"("enseignant_id");

-- CreateIndex
CREATE INDEX "enseignant_classe_classe_id_idx" ON "enseignant_classe"("classe_id");

-- CreateIndex
CREATE INDEX "eleve_classe_id_idx" ON "eleve"("classe_id");

-- CreateIndex
CREATE UNIQUE INDEX "eleve_classe_id_prenom_nom_key" ON "eleve"("classe_id", "prenom", "nom");

-- CreateIndex
CREATE UNIQUE INDEX "livre_qr_token_key" ON "livre"("qr_token");

-- CreateIndex
CREATE INDEX "livre_classe_id_idx" ON "livre"("classe_id");

-- CreateIndex
CREATE INDEX "livre_statut_idx" ON "livre"("statut");

-- CreateIndex
CREATE INDEX "emprunt_livre_id_idx" ON "emprunt"("livre_id");

-- CreateIndex
CREATE INDEX "emprunt_eleve_id_idx" ON "emprunt"("eleve_id");

-- CreateIndex
CREATE INDEX "emprunt_enseignant_id_idx" ON "emprunt"("enseignant_id");

-- CreateIndex
CREATE INDEX "emprunt_statut_idx" ON "emprunt"("statut");

-- CreateIndex
CREATE INDEX "reservation_enseignant_id_idx" ON "reservation"("enseignant_id");

-- CreateIndex
CREATE INDEX "reservation_livre_id_idx" ON "reservation"("livre_id");

-- CreateIndex
CREATE UNIQUE INDEX "reservation_livre_id_eleve_id_key" ON "reservation"("livre_id", "eleve_id");

-- CreateIndex
CREATE INDEX "planning_semaine_classe_id_idx" ON "planning_semaine"("classe_id");

-- CreateIndex
CREATE UNIQUE INDEX "planning_semaine_enseignant_id_jour_semaine_key" ON "planning_semaine"("enseignant_id", "jour_semaine");

-- AddForeignKey
ALTER TABLE "ecole" ADD CONSTRAINT "ecole_enseignant_id_fkey" FOREIGN KEY ("enseignant_id") REFERENCES "enseignant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classe" ADD CONSTRAINT "classe_ecole_id_fkey" FOREIGN KEY ("ecole_id") REFERENCES "ecole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enseignant_classe" ADD CONSTRAINT "enseignant_classe_enseignant_id_fkey" FOREIGN KEY ("enseignant_id") REFERENCES "enseignant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enseignant_classe" ADD CONSTRAINT "enseignant_classe_classe_id_fkey" FOREIGN KEY ("classe_id") REFERENCES "classe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eleve" ADD CONSTRAINT "eleve_classe_id_fkey" FOREIGN KEY ("classe_id") REFERENCES "classe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livre" ADD CONSTRAINT "livre_classe_id_fkey" FOREIGN KEY ("classe_id") REFERENCES "classe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emprunt" ADD CONSTRAINT "emprunt_livre_id_fkey" FOREIGN KEY ("livre_id") REFERENCES "livre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emprunt" ADD CONSTRAINT "emprunt_eleve_id_fkey" FOREIGN KEY ("eleve_id") REFERENCES "eleve"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emprunt" ADD CONSTRAINT "emprunt_enseignant_id_fkey" FOREIGN KEY ("enseignant_id") REFERENCES "enseignant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_livre_id_fkey" FOREIGN KEY ("livre_id") REFERENCES "livre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_eleve_id_fkey" FOREIGN KEY ("eleve_id") REFERENCES "eleve"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_enseignant_id_fkey" FOREIGN KEY ("enseignant_id") REFERENCES "enseignant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planning_semaine" ADD CONSTRAINT "planning_semaine_enseignant_id_fkey" FOREIGN KEY ("enseignant_id") REFERENCES "enseignant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planning_semaine" ADD CONSTRAINT "planning_semaine_classe_id_fkey" FOREIGN KEY ("classe_id") REFERENCES "classe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
