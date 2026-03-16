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