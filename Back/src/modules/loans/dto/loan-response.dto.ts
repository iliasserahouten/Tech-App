export type LoanResponseDto = {
  id: string;
  status: string;
  borrowedAt: string;
  dueAt: string | null;
  returnedAt: string | null;

  book: {
    id: string;
    title: string;
    qrToken: string;
  };

  student: {
    id: string;
    firstName: string;
    lastName: string;
  };
};
