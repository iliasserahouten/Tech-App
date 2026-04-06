import prisma from "../../config/prisma";

export class ReservationRepository {

  findBookByQrForTeacher(teacherId: string, qrToken: string) {
    return prisma.book.findFirst({
      where: { qrToken, classroom: { school: { teacherId } } },
      select: {
        id: true, title: true, qrToken: true, status: true,
        classroom: {
          select: {
            id: true, name: true,
            school: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  findStudentForTeacher(teacherId: string, studentId: string) {
    return prisma.student.findFirst({
      where: { id: studentId, classroom: { school: { teacherId } } },
      select: {
        id: true, firstName: true, lastName: true,
        classroom: {
          select: {
            id: true, name: true,
            school: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  findExistingReservation(bookId: string) {
    return prisma.reservation.findFirst({
      where: { bookId },
    });
  }

  setBookStatus(bookId: string, status: "AVAILABLE" | "LOANED" | "RESERVED") {
    return prisma.book.update({ where: { id: bookId }, data: { status } });
  }

  createReservation(params: {
    teacherId: string;
    bookId: string;
    studentId: string;
    desiredFrom?: Date | null;
  }) {
    return prisma.reservation.create({
      data: {
        teacherId: params.teacherId,
        bookId: params.bookId,
        studentId: params.studentId,
        desiredFrom: params.desiredFrom ?? null,
      },
      include: {
        book: { select: { id: true, title: true, qrToken: true } },
        student: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  listByBook(teacherId: string, bookId: string) {
    return prisma.reservation.findMany({
      where: { teacherId, bookId },
      orderBy: { createdAt: "asc" },
      include: {
        book: { select: { id: true, title: true, qrToken: true } },
        student: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

findByIdForTeacher(teacherId: string, id: string) {
  return prisma.reservation.findFirst({
    where: { id, teacherId },
    select: { id: true, bookId: true },
  });
}

findActiveLoanByBook(bookId: string) {
  return prisma.loan.findFirst({
    where: { bookId, status: { in: ["ACTIVE", "LATE"] } },
  });
}

  deleteById(id: string) {
    return prisma.reservation.delete({ where: { id } });
  }
}