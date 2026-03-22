export type ReservationResponseDto = {
  id: string;
  desiredFrom: string | null;
  createdAt: string;

  book: { id: string; title: string; qrToken: string };
  student: { id: string; firstName: string; lastName: string };
};
