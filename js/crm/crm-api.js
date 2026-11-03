/* DTB Technologies — CRM data layer.
   Thin wrapper over Supabase: auth, staff, leads and activities.
   All row security is enforced server-side by Postgres RLS; this module
   only shapes queries and normalises errors for the UI. */
(function () {
    'use strict';

    let client = null;

    function getClient() {
        if (client) return client;
        const cfg = window.DTB_SUPABASE_CONFIG || {};
        if (!cfg.url || !cfg.publishableKey) return null;
        client = window.supabase.createClient(cfg.url, cfg.publishableKey, {
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        });
        return client;
    }

    function normaliseError(error) {
        if (!error) return 'Something went wrong. Please try again.';
        const msg = error.message || String(error);
        if (/failed to fetch|network/i.test(msg)) {
            return 'Network error — check your connection and try again.';
        }
        if (/42501|row-level security|permission denied/i.test(msg)) {
            return 'You do not have permission for that action.';
        }
        if (/invalid login credentials/i.test(msg)) {
            return 'Incorrect email or password.';
        }
        if (/email not confirmed/i.test(msg)) {
            return 'This account has not been confirmed yet.';
        }
        if (/PGRST116/i.test(msg)) {
            return 'Record not found.';
        }
        return msg.replace(/^Error:\s*/, '');
    }

    const api = {
        isConfigured() {
            const cfg = window.DTB_SUPABASE_CONFIG || {};
            return Boolean(cfg.url && cfg.publishableKey);
        },

        /* ---------- auth ---------- */

        async getSession() {
            const c = getClient();
            if (!c) return null;
            const { data, error } = await c.auth.getSession();
            if (error) throw new Error(normaliseError(error));
            return data.session || null;
        },

        onAuthChange(callback) {
            const c = getClient();
            if (!c) return () => {};
            const { data } = c.auth.onAuthStateChange((_event, session) => callback(session));
            return () => data.subscription.unsubscribe();
        },

        async signIn(email, password) {
            const c = getClient();
            const { data, error } = await c.auth.signInWithPassword({ email, password });
            if (error) throw new Error(normaliseError(error));
            return data.session;
        },

        async signOut() {
            const c = getClient();
            const { error } = await c.auth.signOut();
            if (error) throw new Error(normaliseError(error));
        },

        /* ---------- staff ---------- */

        async getMyProfile() {
            const c = getClient();
            const { data: userData, error: userErr } = await c.auth.getUser();
            if (userErr) throw new Error(normaliseError(userErr));
            if (!userData || !userData.user) return null;
            // Restrict to the authenticated user's own row: RLS lets active staff
            // see the whole staff list, so an unfiltered maybeSingle() could return
            // a colleague's profile.
            const { data, error } = await c.from('staff_members')
                .select('id, email, full_name, role, status')
                .eq('id', userData.user.id)
                .maybeSingle();
            if (error) throw new Error(normaliseError(error));
            return data; // null when the signed-in user is not DTB staff
        },

        async resetPassword(email) {
            const c = getClient();
            const { error } = await c.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + window.location.pathname
            });
            if (error) throw new Error(normaliseError(error));
        },

        async updatePassword(newPassword) {
            const c = getClient();
            const { error } = await c.auth.updateUser({ password: newPassword });
            if (error) throw new Error(normaliseError(error));
        },

        async listStaff() {
            const c = getClient();
            const { data, error } = await c.from('staff_members')
                .select('id, email, full_name, role, status')
                .eq('status', 'active')
                .order('full_name');
            if (error) throw new Error(normaliseError(error));
            return data || [];
        },

        async updateStaff(id, patch) {
            const c = getClient();
            const { error } = await c.from('staff_members').update(patch).eq('id', id);
            if (error) throw new Error(normaliseError(error));
        },

        /* ---------- leads ---------- */

        async fetchStats() {
            const c = getClient();
            const { data, error } = await c.from('leads')
                .select('id, pipeline_status, lead_source, next_followup_at, created_at');
            if (error) throw new Error(normaliseError(error));
            return data || [];
        },

        async queryLeads(opts) {
            const c = getClient();
            const o = opts || {};
            let q = c.from('leads').select('*, assigned_staff:staff_members!leads_assigned_to_fkey(full_name, email)', { count: 'exact' });

            if (o.search) {
                const term = o.search.replace(/[,%()]/g, ' ').trim();
                if (term) {
                    q = q.or('contact_name.ilike.%' + term + '%,business_name.ilike.%' + term + '%,email.ilike.%' + term + '%,phone.ilike.%' + term + '%');
                }
            }
            if (o.status) q = q.eq('pipeline_status', o.status);
            if (o.source) q = q.eq('lead_source', o.source);

            const sortMap = {
                created_desc: { col: 'created_at', asc: false },
                created_asc: { col: 'created_at', asc: true },
                name_asc: { col: 'contact_name', asc: true },
                status_asc: { col: 'pipeline_status', asc: true },
                followup_asc: { col: 'next_followup_at', asc: true, nullsFirst: false }
            };
            const s = sortMap[o.sort] || sortMap.created_desc;
            q = q.order(s.col, { ascending: s.asc, nullsFirst: Boolean(s.nullsFirst) });

            const from = (o.page || 0) * (o.pageSize || 25);
            q = q.range(from, from + (o.pageSize || 25) - 1);

            const { data, error, count } = await q;
            if (error) throw new Error(normaliseError(error));
            return { rows: data || [], total: count || 0 };
        },

        async getLead(id) {
            const c = getClient();
            const { data, error } = await c.from('leads')
                .select('*, assigned_staff:staff_members!leads_assigned_to_fkey(full_name, email)')
                .eq('id', id)
                .maybeSingle();
            if (error) throw new Error(normaliseError(error));
            return data;
        },

        async createLead(values) {
            const c = getClient();
            const { data, error } = await c.from('leads').insert(values).select('id').single();
            if (error) throw new Error(normaliseError(error));
            return data.id;
        },

        async updateLead(id, patch) {
            const c = getClient();
            const { error } = await c.from('leads').update(patch).eq('id', id);
            if (error) throw new Error(normaliseError(error));
        },

        async deleteLead(id) {
            const c = getClient();
            const { error } = await c.from('leads').delete().eq('id', id);
            if (error) throw new Error(normaliseError(error));
        },

        async changeStatus(id, newStatus) {
            const c = getClient();
            const { error } = await c.rpc('change_lead_status', { p_lead_id: id, p_new_status: newStatus });
            if (error) throw new Error(normaliseError(error));
        },

        /* ---------- activities ---------- */

        async listActivities(leadId) {
            const c = getClient();
            const { data, error } = await c.from('lead_activities')
                .select('id, activity_type, body, old_status, new_status, created_at, actor:staff_members(full_name)')
                .eq('lead_id', leadId)
                .order('created_at', { ascending: false });
            if (error) throw new Error(normaliseError(error));
            return data || [];
        },

        async addActivity(leadId, activityType, body) {
            const c = getClient();
            const { error } = await c.from('lead_activities').insert({
                lead_id: leadId,
                activity_type: activityType,
                body: body
            });
            if (error) throw new Error(normaliseError(error));
        }
    };

    window.DtbCrmApi = api;
})();
