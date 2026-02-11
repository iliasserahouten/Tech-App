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

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "OK" });
});

// API routes
app.use("/api/schools", schoolRoutes);
app.use("/api", classroomRoutes);
app.use("/api", studentRoutes);
app.use("/api", bookRoutes);
app.use("/api", loanRoutes);
app.use("/api", reservationRoutes);
app.use("/api", qrcodeRoutes);

// error handler LAST
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
