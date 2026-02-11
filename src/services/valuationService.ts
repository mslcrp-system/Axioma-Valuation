import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type Company = Database['public']['Tables']['companies']['Row'];
export type Valuation = Database['public']['Tables']['valuations']['Row'];

export const valuationService = {
    // Companies
    async getCompanies() {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    },

    async createCompany(name: string, sector: string, cnpj?: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('companies')
            .insert({
                owner_id: user.id,
                name,
                sector,
                cnpj
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteCompany(id: string) {
        // First delete all valuations for this company
        const { error: valError } = await supabase
            .from('valuations')
            .delete()
            .eq('company_id', id);

        if (valError) throw valError;

        // Then delete the company
        const { error } = await supabase
            .from('companies')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Valuations
    async saveValuation(companyId: string, inputs: any, results: any) {
        const { data, error } = await supabase
            .from('valuations')
            .insert({
                company_id: companyId,
                inputs,
                results,
                version: 1
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getValuations(companyId: string) {
        const { data, error } = await supabase
            .from('valuations')
            .select('*')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async deleteValuation(id: string) {
        const { error } = await supabase
            .from('valuations')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
