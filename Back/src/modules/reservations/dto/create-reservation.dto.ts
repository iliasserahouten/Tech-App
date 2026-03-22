export type CreateReservationDto = {
  qrToken: string;
  studentId: string;
  desiredFrom?: string; // ISO
};
