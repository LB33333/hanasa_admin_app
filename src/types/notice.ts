export const NOTICE_TOPICS = [
  '새 상품',
  '가격 변동',
  '이벤트',
  '안내사항',
  '점검/장애',
  '기타',
] as const;
export type NoticeTopic = (typeof NOTICE_TOPICS)[number];

export type NoticeListItem = {
  id: string;
  topic: NoticeTopic;
  title: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NoticeDetail = NoticeListItem & {
  content: string;
};

export type CreateNoticePayload = {
  topic: NoticeTopic;
  title: string;
  content: string;
  isPinned?: boolean;
};

export type UpdateNoticePayload = Partial<CreateNoticePayload>;
