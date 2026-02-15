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
import { requireAuth } from "./middlewares/auth.middleware";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// public
app.use("/api", authRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "OK" });
});

// protected
app.use("/api/schools", requireAuth, schoolRoutes);
app.use("/api/schools", requireAuth, classroomRoutes); // si tu les as montées ici
app.use("/api", requireAuth, studentRoutes);
app.use("/api", requireAuth, bookRoutes);
app.use("/api", requireAuth, loanRoutes);
app.use("/api", requireAuth, reservationRoutes);
app.use("/api", requireAuth, qrcodeRoutes);

// error handler LAST
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
