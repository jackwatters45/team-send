export interface GetGroupByIdReturn {
  max_members: number;
  theme_name: string | null;
  like_icon: string | null;
  requires_approval: boolean;
  show_join_question: boolean;
  join_question: string | null; // may be wrong
  message_deletion_period: number;
  message_deletion_mode: string[];
  children_count: number;
  share_url: string;
  share_qr_code_url: string;
  directories: unknown[];
  members: object[];
  members_count: number;
  locations: unknown[];
  visibility: string;
  category_ids: unknown; //| null;
  active_call_participants: unknown; // | null;
  unread_count: unknown; // | null;
  last_read_message_id: unknown; //| null;
  last_read_at: unknown; // | null;
}
