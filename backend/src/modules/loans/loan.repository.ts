import prisma from "../../config/prisma";

export class LoanRepository {
  prisma = prisma;

  findBookByQrForTeacher(
    teacherId: string,
    qrToken: string,
    tx: any = prisma
  ) {
    return tx.book.findFirst({
      where: {
        qrToken,
        classroom: {
          school: { teacherId },
        },
      },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            school: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
  }

  findStudentForTeacher(
    teacherId: string,
    studentId: string,
    tx: any = prisma
  ) {
    return tx.student.findFirst({
      where: {
        id: studentId,
        classroom: {
          school: { teacherId },
        },
      },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            school: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
  }

  findActiveLoanByBook(bookId: string, tx: any = prisma) {
    return tx.loan.findFirst({
      where: { bookId, status: "ACTIVE" },
      orderBy: { borrowedAt: "desc" },
    });
  }

  createLoan(
    params: {
      teacherId: string;
      bookId: string;
      studentId: string;
      dueAt?: Date | null;
    },
    tx: any = prisma
  ) {
    return tx.loan.create({
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
            id: true,
            title: true,
            qrToken: true,
            classroom: {
              select: {
                id: true,
                name: true,
                school: { select: { id: true, name: true } },
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            classroom: {
              select: {
                id: true,
                name: true,
                school: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
  }

  closeLoan(
    params: {
      loanId: string;
      status: "RETURNED" | "LATE";
      returnedAt: Date;
    },
    tx: any = prisma
  ) {
    return tx.loan.update({
      where: { id: params.loanId },
      data: {
        status: params.status,
        returnedAt: params.returnedAt,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            qrToken: true,
            classroom: {
              select: {
                id: true,
                name: true,
                school: { select: { id: true, name: true } },
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            classroom: {
              select: {
                id: true,
                name: true,
                school: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
  }

  setBookStatus(
    bookId: string,
    status: "AVAILABLE" | "LOANED" | "RESERVED",
    tx: any = prisma
  ) {
    return tx.book.update({
      where: { id: bookId },
      data: { status },
    });
  }

  listLoansForBook(teacherId: string, bookId: string) {
    return prisma.loan.findMany({
      where: { bookId, teacherId },
      orderBy: { borrowedAt: "desc" },
    });
  }

  findBookByIdForTeacher(teacherId: string, bookId: string) {
    return prisma.book.findFirst({
      where: {
        id: bookId,
        classroom: { school: { teacherId } },
      },
      select: { id: true },
    });
  }

  listAllLoans(teacherId: string, filters: any) {
    const where: any = { teacherId };

    if (filters.status) where.status = filters.status;
    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.bookId) where.bookId = filters.bookId;

    if (filters.classroomId) {
      where.student = { classroomId: filters.classroomId };
    }

    return prisma.loan.findMany({
      where,
      orderBy: { borrowedAt: "desc" },
    });
  }
}