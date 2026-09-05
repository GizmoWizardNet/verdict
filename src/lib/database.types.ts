export interface Database {
	public: {
		Tables: {
			sites: {
				Row: {
					id: string;
					url: string;
					domain: string;
					title: string | null;
					description: string | null;
					og_image: string | null;
					indexed_by: string | null;
					is_manual: boolean;
					upvotes: number;
					downvotes: number;
					created_at: string;
				};
				Insert: {
					id?: string;
					url: string;
					domain: string;
					title?: string | null;
					description?: string | null;
					og_image?: string | null;
					indexed_by?: string | null;
					is_manual?: boolean;
					upvotes?: number;
					downvotes?: number;
					created_at?: string;
				};
				Update: Partial<Database['public']['Tables']['sites']['Insert']>;
				Relationships: [];
			};
			votes: {
				Row: {
					id: string;
					site_id: string;
					user_id: string;
					value: 1 | -1;
					voter_name: string | null;
					voter_avatar: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					site_id: string;
					user_id: string;
					value: 1 | -1;
					voter_name?: string | null;
					voter_avatar?: string | null;
					created_at?: string;
				};
				Update: Partial<Database['public']['Tables']['votes']['Insert']>;
				Relationships: [
					{
						foreignKeyName: 'votes_site_id_fkey';
						columns: ['site_id'];
						isOneToOne: false;
						referencedRelation: 'sites';
						referencedColumns: ['id'];
					}
				];
			};
			search_log: {
				Row: {
					id: string;
					query: string;
					user_id: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					query: string;
					user_id?: string | null;
					created_at?: string;
				};
				Update: Partial<Database['public']['Tables']['search_log']['Insert']>;
				Relationships: [];
			};
		};
		Views: Record<string, never>;
		Functions: {
			autocomplete_queries: {
				Args: { prefix: string; limit_count?: number };
				Returns: { query: string; hits: number }[];
			};
		};
	};
}

export type SiteRow = Database['public']['Tables']['sites']['Row'];
export type VoteRow = Database['public']['Tables']['votes']['Row'];