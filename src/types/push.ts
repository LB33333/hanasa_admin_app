export type SendCustomPushPayload = {
  salonIds?: string[];
  title: string;
  body: string;
  url?: string;
  saveToNotifications?: boolean;
};

export type SendCustomPushResult = {
  recipientSalonCount: number;
  tokenCount: number;
  savedToNotifications: boolean;
};
