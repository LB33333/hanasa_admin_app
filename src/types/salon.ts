export type Salon = {
  id: string;
  phoneNumber: string;
  name: string | null;
  address: string | null;
  restDay: string | null;
  isApproved: boolean;
  initialOutstandingAmount: number;
  outstandingAmount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type AdminUpdateSalonPayload = {
  isApproved?: boolean;
  initialOutstandingAmount?: number;
};
