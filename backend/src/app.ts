import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/error-handler";
import schoolRoutes from "./modules/schools/school.routes";
import classroomRoutes from "./modules/classrooms/classroom.routes";
import studentRoutes from "./modules/students/student.routes";
import bookRoutes from "./modules/books/book.routes";
import loanRoutes from "./modules/loans/loan.routes";
import reservationRoutes from "./modules/reservations/reservation.routes";
import qrcodeRoutes from "./modules/qrcodes/qrcode.routes";
import authRoutes from "./modules/auth/auth.routes";
import statsRoutes from "./modules/stats/stats.routes";
import classScheduleRoutes from "./modules/class-schedules/class-schedule.routes";
import { requireAuth } from "./middlewares/auth.middleware";

dotenv.config();

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowed = [
      "http://localhost:5173",
      "http://localhost:4173",
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[];

    if (allowed.includes(origin)) return callback(null, true);

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("/{*path}", cors(corsOptions));
app.use(express.json());

// Public routes
app.use("/api", authRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "OK" });
});

// Protected routes
app.use("/api/schools", requireAuth, schoolRoutes);
app.use("/api/schools", requireAuth, classroomRoutes);
app.use("/api", requireAuth, classroomRoutes);
app.use("/api", requireAuth, studentRoutes);
app.use("/api", requireAuth, bookRoutes);
app.use("/api", requireAuth, loanRoutes);
app.use("/api", requireAuth, reservationRoutes);
app.use("/api", requireAuth, qrcodeRoutes);
app.use("/api", requireAuth, statsRoutes);
app.use("/api", requireAuth, classScheduleRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});