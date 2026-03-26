export type BookResponseDto = {
  id: string;
  title: string;
  universe: string | null;
  publisher: string | null;
  status: string;
  qrToken: string;
  classroomId: string;
  classroom: string | null;
  createdAt: string;
  updatedAt: string;
};
