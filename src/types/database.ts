export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    role: 'admin' | 'analyst' | 'client'
                    created_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    role?: 'admin' | 'analyst' | 'client'
                    created_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    role?: 'admin' | 'analyst' | 'client'
                    created_at?: string
                }
            }
            companies: {
                Row: {
                    id: string
                    owner_id: string
                    name: string
                    sector: string | null
                    cnpj: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    owner_id: string
                    name: string
                    sector?: string | null
                    cnpj?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    owner_id?: string
                    name?: string
                    sector?: string | null
                    cnpj?: string | null
                    created_at?: string
                }
            }
            valuations: {
                Row: {
                    id: string
                    company_id: string
                    inputs: Json
                    results: Json
                    version: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id: string
                    inputs: Json
                    results: Json
                    version?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string
                    inputs?: Json
                    results?: Json
                    version?: number
                    created_at?: string
                }
            }
        }
    }
}
