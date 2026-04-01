export type ModuleSlug =
  | 'welcome'
  | 'brand-foundation'
  | 'visual-world'
  | 'content'
  | 'launch'
  | 'playbook'

export interface BlpResponse {
  id: string
  user_id: string
  module_slug: ModuleSlug
  responses: Record<string, unknown>
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      blp_responses: {
        Row: BlpResponse
        Insert: Omit<BlpResponse, 'id' | 'updated_at'> & { id?: string; updated_at?: string }
        Update: Partial<Omit<BlpResponse, 'id'>>
      }
    }
  }
}
