import prisma from "../../config/prisma";

export class LoanRepository {
  findBookByQrForTeacher(teacherId: string, qrToken: string) {
    return prisma.book.findFirst({
      where: { qrToken, classroom: { school: { teacherId } } },
    });
  }

  findStudentForTeacher(teacherId: string, studentId: string) {
    return prisma.student.findFirst({
      where: { id: studentId, classroom: { school: { teacherId } } },
      include: {
        classroom: { select: { id: true, name: true } },
      },
    });
  }

  findActiveLoanByBook(bookId: string) {
    return prisma.loan.findFirst({
      where: { bookId, status: "ACTIVE" },
      orderBy: { borrowedAt: "desc" },
    });
  }

  createLoan(params: { teacherId: string; bookId: string; studentId: string; dueAt?: Date | null }) {
    return prisma.loan.create({
      data: {
        teacherId: params.teacherId,
        bookId: params.bookId,
        studentId: params.studentId,
        dueAt: params.dueAt ?? null,
        status: "ACTIVE",
      },
      include: {
        book: {
          select: {
            id: true, title: true, qrToken: true,
            classroom: { select: { id: true, name: true } },
          },
        },
        student: {
          select: {
            id: true, firstName: true, lastName: true,
            // ✅ classe de l'élève incluse dans la réponse
            classroom: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  closeLoan(params: { loanId: string; status: "RETURNED" | "LATE"; returnedAt: Date }) {
    return prisma.loan.update({
      where: { id: params.loanId },
      data: {
        status: params.status,
        returnedAt: params.returnedAt,
      },
      include: {
        book: {
          select: {
            id: true, title: true, qrToken: true,
            classroom: { select: { id: true, name: true } },
          },
        },
        student: {
          select: {
            id: true, firstName: true, lastName: true,
            classroom: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  setBookStatus(bookId: string, status: "AVAILABLE" | "LOANED" | "RESERVED") {
    return prisma.book.update({
      where: { id: bookId },
      data: { status },
    });
  }

  listLoansForBook(teacherId: string, bookId: string) {
    return prisma.loan.findMany({
      where: { bookId, teacherId },
      orderBy: { borrowedAt: "desc" },
      include: {
        book: {
          select: {
            id: true, title: true, qrToken: true,
            classroom: { select: { id: true, name: true } },
          },
        },
        student: {
          select: {
            id: true, firstName: true, lastName: true,
            classroom: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  findBookByIdForTeacher(teacherId: string, bookId: string) {
    return prisma.book.findFirst({
      where: { id: bookId, classroom: { school: { teacherId } } },
      select: { id: true },
    });
  }

  listAllLoans(teacherId: string, filters: {
    status?: string;
    studentId?: string;
    bookId?: string;
    classroomId?: string;
  }) {
    const where: any = { teacherId };

    if (filters.status)      where.status    = filters.status;
    if (filters.studentId)   where.studentId = filters.studentId;
    if (filters.bookId)      where.bookId    = filters.bookId;
    // ✅ filtre sur la classe de l'ÉLÈVE, pas la classe du livre
    if (filters.classroomId) where.student   = { classroomId: filters.classroomId };

    return prisma.loan.findMany({
      where,
      orderBy: { borrowedAt: "desc" },
      include: {
        book: {
          select: {
            id: true, title: true, qrToken: true, universe: true, publisher: true,
            classroom: { select: { id: true, name: true, school: { select: { id: true, name: true } } } },
          },
        },
        student: {
          select: {
            id: true, firstName: true, lastName: true,
            // ✅ classe de l'élève — c'est ça qui s'affiche dans l'historique
            classroom: { select: { id: true, name: true } },
          },
        },
      },
    });
  }
}