import prisma from "../../config/prisma";
import { AppError } from "../../errors/app-error";

type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

export class ClassScheduleService {
  private getDayOfWeek(): DayOfWeek {
    const days: DayOfWeek[] = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    const today = new Date().getDay();
    return days[today];
  }

  async getTodayClassroom(teacherId: string) {
    const dayOfWeek = this.getDayOfWeek();

    const schedule = await prisma.classSchedule.findFirst({
      where: {
        teacherId,
        dayOfWeek,
      },
      include: {
        classroom: {
          include: {
            _count: {
              select: {
                students: true,
                books: true,
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      return null;
    }

    return schedule.classroom;
  }
  async upsertSchedule(teacherId: string, classroomId: string, dayOfWeek: DayOfWeek) {
  // Vérifier que la classe appartient bien à l'enseignant
  const classroom = await prisma.classroom.findFirst({
    where: { id: classroomId, school: { teacherId } },
  });
  if (!classroom) throw new AppError("Classroom not found", 404);

  // Supprimer l'ancien planning pour ce jour s'il existe
  await prisma.classSchedule.deleteMany({
    where: { teacherId, dayOfWeek },
  });

  // Créer le nouveau
  const schedule = await prisma.classSchedule.create({
    data: { teacherId, classroomId, dayOfWeek },
    include: { classroom: true },
  });
  return schedule;
}

  async getMySchedule(teacherId: string) {
    const schedules = await prisma.classSchedule.findMany({
      where: { teacherId },
      include: {
        classroom: true,
      },
      orderBy: { dayOfWeek: "asc" },
    });

    return schedules;
  }
}