import prisma from "../../config/prisma";
import { AppError } from "../../errors/app-error";

export class StatsService {
  async getDashboardStats(teacherId: string) {
    // Vérifier que l'utilisateur existe
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new AppError("Teacher not found", 404);
    }

    // Récupérer toutes les classes de l'enseignant via ses écoles
    const schools = await prisma.school.findMany({
      where: { teacherId },
      include: {
        classrooms: {
          include: {
            books: true,
            students: true,
          },
        },
      },
    });

    // Collecter tous les IDs de classrooms
    const classroomIds = schools.flatMap(school => 
      school.classrooms.map(c => c.id)
    );

    // Compter les livres par statut
    const totalBorrowed = await prisma.book.count({
      where: {
        classroomId: { in: classroomIds },
        status: "LOANED",
      },
    });

    const totalAvailable = await prisma.book.count({
      where: {
        classroomId: { in: classroomIds },
        status: "AVAILABLE",
      },
    });

    // Compter les emprunts en retard
    const totalOverdue = await prisma.loan.count({
      where: {
        teacherId,
        status: "LATE",
      },
    });

    // Compter le total de livres et étudiants
    const totalBooks = await prisma.book.count({
      where: { classroomId: { in: classroomIds } },
    });

    const totalStudents = await prisma.student.count({
      where: { classroomId: { in: classroomIds } },
    });

    // Récupérer les emprunts actifs avec détails
    const activeLoans = await prisma.loan.findMany({
      where: {
        teacherId,
        status: { in: ["ACTIVE", "LATE"] },
      },
      include: {
        book: true,
        student: true,
      },
      orderBy: { borrowedAt: "desc" },
      take: 10,
    });

    // Récupérer les activités récentes (emprunts et retours)
    const recentLoans = await prisma.loan.findMany({
      where: { teacherId },
      include: {
        book: true,
        student: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const recentActivities = recentLoans.map(loan => ({
      id: loan.id,
      type: loan.returnedAt ? "return" : "borrow",
      studentName: `${loan.student.firstName} ${loan.student.lastName}`,
      bookTitle: loan.book.title,
      timestamp: loan.returnedAt || loan.borrowedAt,
      student: loan.student,
      book: loan.book,
    }));

    return {
      totalBorrowed,
      totalOverdue,
      totalAvailable,
      totalBooks,
      totalStudents,
      activeLoans,
      recentActivities,
    };
  }

  async getClassroomStats(teacherId: string, classroomId: string) {
    // Vérifier que la classe appartient à l'enseignant
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: classroomId,
        school: { teacherId },
      },
    });

    if (!classroom) {
      throw new AppError("Classroom not found or access denied", 404);
    }

    const totalBooks = await prisma.book.count({
      where: { classroomId },
    });

    const totalStudents = await prisma.student.count({
      where: { classroomId },
    });

    const activeLoans = await prisma.loan.count({
      where: {
        book: { classroomId },
        status: "ACTIVE",
      },
    });

    const overdueLoans = await prisma.loan.count({
      where: {
        book: { classroomId },
        status: "LATE",
      },
    });

    return {
      totalBooks,
      totalStudents,
      activeLoans,
      overdueLoans,
    };
  }
}