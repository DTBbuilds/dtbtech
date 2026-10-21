/* DTB Technologies — CRM application UI.
   Renders the internal lead management interface on dashboard/leads.html.
   All user-supplied values are rendered through DOM APIs (el()); nothing
   from the database is ever placed into innerHTML. */
(function () {
    'use strict';

    const api = window.DtbCrmApi;

    const STATUSES = [
        { key: 'new', label: 'New', badge: 'bg-blue-500/15 border-blue-500/30 text-blue-300', dot: 'bg-blue-400' },
        { key: 'contacted', label: 'Contacted', badge: 'bg-slate-600/30 border-slate-500/30 text-slate-200', dot: 'bg-slate-300' },
        { key: 'qualified', label: 'Qualified', badge: 'bg-violet-500/15 border-violet-500/30 text-violet-300', dot: 'bg-violet-400' },
        { key: 'proposal_sent', label: 'Proposal Sent', badge: 'bg-amber-500/15 border-amber-500/30 text-amber-300', dot: 'bg-amber-400' },
        { key: 'won', label: 'Won', badge: 'bg-green-500/15 border-green-500/30 text-green-300', dot: 'bg-green-400' },
        { key: 'lost', label: 'Lost', badge: 'bg-red-500/15 border-red-500/30 text-red-300', dot: 'bg-red-400' }
    ];
    const SOURCES = [
        { key: 'website_brief', label: 'Website brief' },
        { key: 'whatsapp', label: 'WhatsApp' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'referral', label: 'Referral' },
        { key: 'other', label: 'Other' }
    ];
    const COUNTRIES = ['Australia', 'Kenya', 'Other'];
    const SERVICES = [
        'Business website', 'Website redesign or repair', 'Online store or booking website',
        'Custom web or mobile application', 'POS or business software',
        'Hosting, maintenance or IT support', 'Other / not sure'
    ];
    const TIMEFRAMES = ['Flexible / not sure', 'As soon as practical', 'Within 1–2 months', 'Planning for later'];
    const PAGE_SIZE = 25;

    const state = {
        session: null,
        profile: null,
        staff: [],
        filters: { search: '', status: '', source: '', sort: 'created_desc', page: 0 },
        stats: null,
        currentLead: null,
        drawerOpen: false,
        lastFocus: null
    };

    /* ---------- tiny DOM helpers ---------- */

    function el(tag, attrs, children) {
        const node = document.createElement(tag);
        if (attrs) {
            for (const [k, v] of Object.entries(attrs)) {
                if (v === null || v === undefined || v === false) continue;
                if (k === 'class') node.className = v;
                else if (k === 'text') node.textContent = v;
                else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
                else if (k === 'dataset') Object.assign(node.dataset, v);
                else node.setAttribute(k, v === true ? '' : v);
            }
        }
        (children || []).forEach((c) => { if (c) node.appendChild(c); });
        return node;
    }

    const root = () => document.getElementById('crm-root');
    const header = () => document.getElementById('crm-header');

    function statusMeta(key) { return STATUSES.find((s) => s.key === key) || STATUSES[0]; }
    function sourceLabel(key) { const s = SOURCES.find((x) => x.key === key); return s ? s.label : (key || '—'); }

    function badge(statusKey) {
        const m = statusMeta(statusKey);
        return el('span', { class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold whitespace-nowrap ' + m.badge },
            [el('span', { class: 'w-1.5 h-1.5 rounded-full ' + m.dot, 'aria-hidden': 'true' }), el('span', { text: m.label })]);
    }

    function fmtDate(value) {
        if (!value) return '—';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return value;
        return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function fmtDateTime(value) {
        if (!value) return '—';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return value;
        return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) + ', ' +
            d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' });
    }

    function toast(message, kind) {
        const wrap = document.getElementById('crm-toast-root');
        const ok = kind !== 'error';
        const t = el('div', {
            class: 'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm ' +
                (ok ? 'bg-slate-800 border-green-500/30 text-slate-200' : 'bg-slate-800 border-red-500/40 text-slate-200'),
            role: 'status'
        }, [
            el('i', { class: (ok ? 'fas fa-circle-check text-green-400' : 'fas fa-circle-exclamation text-red-400') + ' mt-0.5', 'aria-hidden': 'true' }),
            el('p', { class: 'flex-1', text: message })
        ]);
        wrap.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.4s'; }, 4200);
        setTimeout(() => t.remove(), 4800);
    }

    /* ---------- header ---------- */

    function renderHeader() {
        const h = header();
        h.textContent = '';
        const left = el('div', { class: 'flex items-center gap-3' }, [
            el('img', { src: '../assets/dtb-logo.png', alt: 'DTB Technologies', class: 'w-8 h-8 rounded-full' }),
            el('div', {}, [
                el('p', { class: 'text-white font-semibold text-sm leading-tight', text: 'DTB Technologies' }),
                el('p', { class: 'text-slate-500 text-[11px] leading-tight', text: 'Lead Management · Internal' })
            ])
        ]);
        h.appendChild(el('div', { class: 'container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3' }, [left]));
    }

    function renderHeaderUser() {
        const bar = header().firstElementChild;
        const old = document.getElementById('crm-user-box');
        if (old) old.remove();
        if (!state.session) return;
        const box = el('div', { id: 'crm-user-box', class: 'flex items-center gap-3' }, [
            el('span', { class: 'hidden sm:block text-slate-400 text-xs', text: state.profile ? state.profile.email : (state.session.user.email || '') }),
            el('button', {
                class: 'px-3 py-2 min-h-[40px] rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
                text: 'Sign out',
                onclick: () => api.signOut().catch((e) => toast(e.message, 'error'))
            })
        ]);
        bar.appendChild(box);
    }

    /* ---------- views ---------- */

    function renderNotConfigured() {
        renderHeader();
        root().textContent = '';
        root().appendChild(el('div', { class: 'max-w-lg mx-auto mt-10 bg-slate-800/60 border border-amber-500/30 rounded-2xl p-6 sm:p-8 text-center' }, [
            el('div', { class: 'w-12 h-12 mx-auto rounded-xl bg-amber-500/15 flex items-center justify-center mb-4' },
                [el('i', { class: 'fas fa-plug text-amber-400 text-xl', 'aria-hidden': 'true' })]),
            el('h1', { class: 'text-xl font-bold text-white mb-2', text: 'CRM not configured yet' }),
            el('p', { class: 'text-slate-400 text-sm leading-relaxed mb-4', text: 'The Supabase environment variables are not set for this deployment. The lead management system stays disabled until SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are configured.' }),
            el('p', { class: 'text-slate-500 text-xs', text: 'Setup steps: docs/crm-setup.md' })
        ]));
    }

    function renderSetPassword() {
        renderHeader();
        root().textContent = '';
        const err = el('p', { class: 'hidden text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2', role: 'alert' });
        const passIn = el('input', {
            type: 'password', id: 'crm-new-password', autocomplete: 'new-password', required: true, minlength: 8,
            placeholder: 'New password (min. 8 characters)',
            class: 'crm-input w-full rounded-xl border border-slate-600 bg-slate-800 text-white placeholder-slate-500 px-4 py-3 min-h-[48px] focus:outline-none focus:border-blue-400'
        });
        const confirmIn = el('input', {
            type: 'password', id: 'crm-confirm-password', autocomplete: 'new-password', required: true, minlength: 8,
            placeholder: 'Confirm new password',
            class: 'crm-input w-full rounded-xl border border-slate-600 bg-slate-800 text-white placeholder-slate-500 px-4 py-3 min-h-[48px] focus:outline-none focus:border-blue-400'
        });
        const submit = el('button', {
            type: 'submit',
            class: 'w-full inline-flex items-center justify-center min-h-[48px] px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400'
        }, [el('span', { text: 'Save password and continue' })]);

        const isRecovery = window.__dtbAuthFlow === 'recovery';
        const form = el('form', { class: 'space-y-4', novalidate: true, onsubmit: async (ev) => {
            ev.preventDefault();
            err.classList.add('hidden');
            const p1 = passIn.value, p2 = confirmIn.value;
            if (p1.length < 8) {
                err.textContent = 'Use at least 8 characters for your password.';
                err.classList.remove('hidden');
                return;
            }
            if (p1 !== p2) {
                err.textContent = 'The two passwords do not match.';
                err.classList.remove('hidden');
                return;
            }
            submit.disabled = true;
            submit.classList.add('opacity-60', 'pointer-events-none');
            try {
                await api.updatePassword(p1);
                toast('Password saved.');
                window.__dtbAuthFlow = null;
                await boot();
            } catch (e) {
                err.textContent = e.message;
                err.classList.remove('hidden');
            } finally {
                submit.disabled = false;
                submit.classList.remove('opacity-60', 'pointer-events-none');
            }
        } }, [
            el('div', {}, [el('label', { for: 'crm-new-password', class: 'block text-sm font-medium text-slate-200 mb-2', text: 'New password' }), passIn]),
            el('div', {}, [el('label', { for: 'crm-confirm-password', class: 'block text-sm font-medium text-slate-200 mb-2', text: 'Confirm password' }), confirmIn]),
            err,
            submit
        ]);

        root().appendChild(el('div', { class: 'max-w-md mx-auto mt-8 sm:mt-14' }, [
            el('div', { class: 'bg-slate-800/60 border border-slate-700/30 rounded-2xl p-6 sm:p-8' }, [
                el('div', { class: 'text-center mb-6' }, [
                    el('img', { src: '../assets/dtb-logo.png', alt: '', class: 'w-12 h-12 rounded-full mx-auto mb-4' }),
                    el('h1', { class: 'text-xl font-bold text-white', text: isRecovery ? 'Choose a New Password' : 'Set Your Password' }),
                    el('p', { class: 'text-slate-400 text-sm mt-1', text: isRecovery
                        ? 'Your password reset link was verified. Choose a new password for your staff account.'
                        : 'Your staff invitation was verified. Choose a password to secure your account.' })
                ]),
                form
            ])
        ]));
        passIn.focus();
    }

    function renderSignIn(prefillEmail, initialError) {
        renderHeader();
        root().textContent = '';
        const err = el('p', { id: 'crm-signin-error', class: 'hidden text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2', role: 'alert' });
        const emailIn = el('input', {
            type: 'email', id: 'crm-email', autocomplete: 'username', required: true,
            placeholder: 'you@dtbtech.org', value: prefillEmail || '',
            class: 'crm-input w-full rounded-xl border border-slate-600 bg-slate-800 text-white placeholder-slate-500 px-4 py-3 min-h-[48px] focus:outline-none focus:border-blue-400'
        });
        const passIn = el('input', {
            type: 'password', id: 'crm-password', autocomplete: 'current-password', required: true,
            placeholder: 'Password',
            class: 'crm-input w-full rounded-xl border border-slate-600 bg-slate-800 text-white placeholder-slate-500 px-4 py-3 min-h-[48px] focus:outline-none focus:border-blue-400'
        });
        const submit = el('button', {
            type: 'submit',
            class: 'w-full inline-flex items-center justify-center min-h-[48px] px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400'
        }, [el('i', { class: 'fas fa-lock mr-2 text-xs', 'aria-hidden': 'true' }), el('span', { text: 'Sign in' })]);
        const forgotEmail = el('input', {});
        const forgotBox = el('div', { class: 'hidden' });

        const form = el('form', { class: 'space-y-4', novalidate: true, onsubmit: async (ev) => {
            ev.preventDefault();
            err.classList.add('hidden');
            const email = emailIn.value.trim();
            const password = passIn.value;
            if (!email || !password) {
                err.textContent = 'Enter your email and password.';
                err.classList.remove('hidden');
                return;
            }
            submit.disabled = true;
            submit.classList.add('opacity-60', 'pointer-events-none');
            try {
                await api.signIn(email, password);
                await boot();
            } catch (e) {
                err.textContent = e.message;
                err.classList.remove('hidden');
            } finally {
                submit.disabled = false;
                submit.classList.remove('opacity-60', 'pointer-events-none');
            }
        } }, [
            el('div', {}, [el('label', { for: 'crm-email', class: 'block text-sm font-medium text-slate-200 mb-2', text: 'Work email' }), emailIn]),
            el('div', {}, [el('label', { for: 'crm-password', class: 'block text-sm font-medium text-slate-200 mb-2', text: 'Password' }), passIn]),
            err,
            submit
        ]);

        root().appendChild(el('div', { class: 'max-w-md mx-auto mt-8 sm:mt-14' }, [
            el('div', { class: 'bg-slate-800/60 border border-slate-700/30 rounded-2xl p-6 sm:p-8' }, [
                el('div', { class: 'text-center mb-6' }, [
                    el('img', { src: '../assets/dtb-logo.png', alt: '', class: 'w-12 h-12 rounded-full mx-auto mb-4' }),
                    el('h1', { class: 'text-xl font-bold text-white', text: 'Staff Sign In' }),
                    el('p', { class: 'text-slate-400 text-sm mt-1', text: 'Internal lead management — authorised DTB staff only.' })
                ]),
                form,
                el('div', { class: 'text-center mt-4' }, [
                    el('button', {
                        type: 'button', id: 'crm-forgot-link',
                        class: 'text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 rounded-sm',
                        text: 'Forgot password?',
                        onclick: () => {
                            forgotBox.classList.remove('hidden');
                            forgotEmail.value = emailIn.value;
                            forgotEmail.focus();
                        }
                    })
                ]),
                (() => {
                    forgotBox.id = 'crm-forgot-box';
                    forgotBox.className = 'hidden mt-4 border-t border-slate-700/40 pt-4';
                    forgotEmail.id = 'crm-forgot-email';
                    forgotEmail.type = 'email';
                    forgotEmail.placeholder = 'you@dtbtech.org';
                    forgotEmail.className = 'crm-input flex-1 rounded-xl border border-slate-600 bg-slate-800 text-white placeholder-slate-500 px-3 py-2.5 min-h-[44px] focus:outline-none focus:border-blue-400 text-sm';
                    forgotBox.appendChild(el('p', { class: 'text-slate-400 text-xs mb-2', text: 'Enter your work email and we will send you a password reset link.' }));
                    forgotBox.appendChild(el('div', { class: 'flex gap-2' }, [
                        forgotEmail,
                        el('button', {
                            type: 'button',
                            class: 'px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
                            text: 'Send reset link',
                            onclick: async () => {
                                const email = forgotEmail.value.trim();
                                if (!email) { toast('Enter your email first.', 'error'); return; }
                                try {
                                    await api.resetPassword(email);
                                    toast('Password reset email sent to ' + email + '. Check your inbox.');
                                    forgotBox.classList.add('hidden');
                                } catch (e) {
                                    toast(e.message, 'error');
                                }
                            }
                        })
                    ]));
                    return forgotBox;
                })(),
                el('p', { class: 'text-slate-500 text-xs text-center mt-6 leading-relaxed', text: 'Accounts are created by an owner. There is no self-registration.' })
            ])
        ]));
        if (initialError) {
            err.textContent = initialError;
            err.classList.remove('hidden');
        }
        emailIn.focus();
    }

    function renderDenied(message) {
        renderHeader();
        root().textContent = '';
        root().appendChild(el('div', { class: 'max-w-lg mx-auto mt-10 bg-slate-800/60 border border-red-500/30 rounded-2xl p-6 sm:p-8 text-center' }, [
            el('div', { class: 'w-12 h-12 mx-auto rounded-xl bg-red-500/15 flex items-center justify-center mb-4' },
                [el('i', { class: 'fas fa-user-lock text-red-400 text-xl', 'aria-hidden': 'true' })]),
            el('h1', { class: 'text-xl font-bold text-white mb-2', text: 'Access restricted' }),
            el('p', { class: 'text-slate-400 text-sm leading-relaxed mb-6', text: message }),
            el('button', {
                class: 'px-5 py-2.5 min-h-[44px] rounded-xl border border-slate-600 text-slate-200 hover:bg-slate-800 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
                text: 'Sign out',
                onclick: () => api.signOut().catch(() => {})
            })
        ]));
    }

    /* ---------- overview + pipeline ---------- */

    function computeStats(rows) {
        const now = new Date();
        const in14 = new Date(now.getTime() + 14 * 86400000);
        const s = { total: 0, new: 0, active: 0, proposals: 0, won: 0, lost: 0, followups: 0, bySource: {} };
        for (const r of rows) {
            s.total++;
            if (r.pipeline_status === 'new') s.new++;
            if (r.pipeline_status === 'contacted' || r.pipeline_status === 'qualified') s.active++;
            if (r.pipeline_status === 'proposal_sent') s.proposals++;
            if (r.pipeline_status === 'won') s.won++;
            if (r.pipeline_status === 'lost') s.lost++;
            if (r.next_followup_at) {
                const f = new Date(r.next_followup_at + 'T23:59:59');
                if (f >= new Date(now.toDateString()) && f <= in14) s.followups++;
            }
            s.bySource[r.lead_source] = (s.bySource[r.lead_source] || 0) + 1;
        }
        return s;
    }

    function statCard(icon, iconBg, value, label) {
        return el('div', { class: 'bg-slate-800/60 rounded-2xl border border-slate-700/30 p-4 sm:p-5' }, [
            el('div', { class: 'flex items-center justify-between gap-2' }, [
                el('div', {}, [
                    el('p', { class: 'text-2xl sm:text-3xl font-bold text-white', text: String(value) }),
                    el('p', { class: 'text-slate-400 text-xs mt-1', text: label })
                ]),
                el('div', { class: 'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ' + iconBg, 'aria-hidden': 'true' },
                    [el('i', { class: icon + ' text-blue-300' })])
            ])
        ]);
    }

    function renderOverview() {
        const s = state.stats || { total: 0, new: 0, active: 0, proposals: 0, won: 0, followups: 0, bySource: {} };
        const grid = el('div', { class: 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4' }, [
            statCard('fas fa-users', 'bg-blue-500/10', s.total, 'Total leads'),
            statCard('fas fa-star', 'bg-blue-500/10', s.new, 'New'),
            statCard('fas fa-comments', 'bg-blue-500/10', s.active, 'Active opportunities'),
            statCard('fas fa-file-invoice', 'bg-blue-500/10', s.proposals, 'Proposals sent'),
            statCard('fas fa-trophy', 'bg-green-500/10', s.won, 'Won'),
            statCard('fas fa-bell', 'bg-amber-500/10', s.followups, 'Follow-ups (14d)')
        ]);

        const sourceRows = SOURCES
            .map((src) => ({ label: src.label, count: s.bySource[src.key] || 0 }))
            .filter((r) => r.count > 0)
            .sort((a, b) => b.count - a.count);
        const maxCount = Math.max(1, ...sourceRows.map((r) => r.count));
        const report = el('div', { class: 'bg-slate-800/60 rounded-2xl border border-slate-700/30 p-5' }, [
            el('h3', { class: 'text-white font-semibold text-sm mb-4', text: 'Leads by source' }),
            sourceRows.length === 0
                ? el('p', { class: 'text-slate-500 text-sm', text: 'No leads recorded yet.' })
                : el('div', { class: 'space-y-2.5' }, sourceRows.map((r) =>
                    el('div', { class: 'flex items-center gap-3' }, [
                        el('span', { class: 'text-slate-400 text-xs w-24 sm:w-28 flex-shrink-0', text: r.label }),
                        el('div', { class: 'flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden', 'aria-hidden': 'true' },
                            [el('div', { class: 'h-full bg-blue-500 rounded-full', style: 'width:' + Math.round(r.count / maxCount * 100) + '%' })]),
                        el('span', { class: 'text-slate-300 text-xs w-6 text-right', text: String(r.count) })
                    ])))
        ]);

        return el('div', { id: 'crm-overview', class: 'space-y-4' }, [grid, report]);
    }

    function pipelineStrip() {
        const counts = {};
        for (const r of (state.rawRows || [])) counts[r.pipeline_status] = (counts[r.pipeline_status] || 0) + 1;
        return el('div', { class: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3', role: 'group', 'aria-label': 'Pipeline' },
            STATUSES.map((st) => {
                const active = state.filters.status === st.key;
                const btn = el('button', {
                    class: 'text-left px-4 py-3 rounded-xl border transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ' +
                        (active ? 'border-blue-400/60 bg-blue-600/15' : 'border-slate-700/30 bg-slate-800/60 hover:border-slate-600'),
                    onclick: () => {
                        state.filters.status = active ? '' : st.key;
                        state.filters.page = 0;
                        refreshTable();
                        renderPipelineActive();
                    }
                }, [
                    el('p', { class: 'text-xl font-bold text-white', text: String(counts[st.key] || 0) }),
                    el('p', { class: 'text-slate-400 text-xs mt-0.5', text: st.label })
                ]);
                return btn;
            }));
    }

    function renderPipelineActive() {
        const strip = document.getElementById('crm-pipeline');
        if (!strip) return;
        strip.textContent = '';
        strip.appendChild(pipelineStrip());
    }

    /* ---------- leads table ---------- */

    function toolbar() {
        const searchIn = el('input', {
            type: 'search', id: 'crm-search', placeholder: 'Search name, business, email or phone…',
            value: state.filters.search,
            class: 'crm-input w-full sm:max-w-xs rounded-xl border border-slate-600 bg-slate-800 text-white placeholder-slate-500 px-4 py-2.5 min-h-[44px] focus:outline-none focus:border-blue-400',
            oninput: (ev) => {
                state.filters.search = ev.target.value;
                state.filters.page = 0;
                clearTimeout(toolbar._t);
                toolbar._t = setTimeout(refreshTable, 300);
            }
        });
        const statusSel = selectEl('crm-status-filter', 'All statuses', STATUSES.map((s) => ({ v: s.key, l: s.label })), state.filters.status, (v) => {
            state.filters.status = v; state.filters.page = 0; refreshTable();
        });
        const sourceSel = selectEl('crm-source-filter', 'All sources', SOURCES.map((s) => ({ v: s.key, l: s.label })), state.filters.source, (v) => {
            state.filters.source = v; state.filters.page = 0; refreshTable();
        });
        const sortSel = selectEl('crm-sort', 'Newest first', [
            { v: 'created_desc', l: 'Newest first' }, { v: 'created_asc', l: 'Oldest first' },
            { v: 'name_asc', l: 'Name A–Z' }, { v: 'status_asc', l: 'Status' },
            { v: 'followup_asc', l: 'Follow-up date' }
        ], state.filters.sort, (v) => { state.filters.sort = v; state.filters.page = 0; refreshTable(); });

        return el('div', { class: 'flex flex-col sm:flex-row sm:items-center gap-3' }, [
            searchIn,
            el('div', { class: 'grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1' }, [statusSel, sourceSel, sortSel]),
            el('button', {
                class: 'inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex-shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
                onclick: () => openLeadForm(null)
            }, [el('i', { class: 'fas fa-plus mr-2 text-xs', 'aria-hidden': 'true' }), el('span', { text: 'New Lead' })])
        ]);
    }

    function selectEl(id, placeholder, options, value, onChange) {
        const sel = el('select', {
            id, class: 'crm-input w-full rounded-xl border border-slate-600 bg-slate-800 text-white px-3 py-2.5 min-h-[44px] focus:outline-none focus:border-blue-400 text-sm',
            onchange: (ev) => onChange(ev.target.value)
        }, [
            el('option', { value: '', text: placeholder }),
            ...options.map((o) => {
                const opt = el('option', { value: o.v, text: o.l });
                if (o.v === value) opt.selected = true;
                return opt;
            })
        ]);
        return sel;
    }

    function leadsTable(rows) {
        const head = el('thead', {}, [el('tr', { class: 'text-slate-500 text-xs uppercase tracking-wider' }, [
            el('th', { class: 'text-left font-semibold px-4 py-3', text: 'Lead', scope: 'col' }),
            el('th', { class: 'text-left font-semibold px-4 py-3 hidden md:table-cell', text: 'Service', scope: 'col' }),
            el('th', { class: 'text-left font-semibold px-4 py-3', text: 'Status', scope: 'col' }),
            el('th', { class: 'text-left font-semibold px-4 py-3 hidden lg:table-cell', text: 'Source', scope: 'col' }),
            el('th', { class: 'text-left font-semibold px-4 py-3 hidden lg:table-cell', text: 'Owner', scope: 'col' }),
            el('th', { class: 'text-left font-semibold px-4 py-3', text: 'Follow-up', scope: 'col' })
        ])]);

        const body = el('tbody', { class: 'divide-y divide-slate-700/40' }, rows.map((r) => {
            const overdue = r.next_followup_at && new Date(r.next_followup_at + 'T23:59:59') < new Date() && !['won', 'lost'].includes(r.pipeline_status);
            const row = el('tr', {
                class: 'cursor-pointer hover:bg-slate-700/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
                tabindex: '0', role: 'button',
                'aria-label': 'Open lead ' + (r.contact_name || ''),
                onclick: () => openDrawer(r.id),
                onkeydown: (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openDrawer(r.id); } }
            }, [
                el('td', { class: 'px-4 py-3.5' }, [
                    el('p', { class: 'text-white text-sm font-medium', text: r.contact_name || '—' }),
                    el('p', { class: 'text-slate-500 text-xs mt-0.5', text: r.business_name || r.email || '' })
                ]),
                el('td', { class: 'px-4 py-3.5 hidden md:table-cell' }, [
                    el('p', { class: 'text-slate-300 text-sm', text: r.service_required || '—' })
                ]),
                el('td', { class: 'px-4 py-3.5' }, [badge(r.pipeline_status)]),
                el('td', { class: 'px-4 py-3.5 hidden lg:table-cell' }, [
                    el('span', { class: 'text-slate-300 text-sm', text: sourceLabel(r.lead_source) })
                ]),
                el('td', { class: 'px-4 py-3.5 hidden lg:table-cell' }, [
                    el('span', { class: 'text-slate-400 text-sm', text: (r.assigned_staff && r.assigned_staff.full_name) || 'Unassigned' })
                ]),
                el('td', { class: 'px-4 py-3.5' }, [
                    el('span', { class: 'text-sm ' + (overdue ? 'text-red-300 font-semibold' : 'text-slate-300'), text: fmtDate(r.next_followup_at) })
                ])
            ]);
            return row;
        }));

        return el('div', { class: 'bg-slate-800/60 rounded-2xl border border-slate-700/30 overflow-hidden' },
            [el('div', { class: 'overflow-x-auto crm-scroll' }, [el('table', { class: 'w-full min-w-[560px]', scope: 'group' }, [head, body])])]);
    }

    function mobileCards(rows) {
        return el('div', { class: 'space-y-3' }, rows.map((r) =>
            el('button', {
                class: 'w-full text-left bg-slate-800/60 rounded-2xl border border-slate-700/30 hover:border-blue-500/40 p-4 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
                onclick: () => openDrawer(r.id)
            }, [
                el('div', { class: 'flex items-start justify-between gap-3' }, [
                    el('div', { class: 'min-w-0' }, [
                        el('p', { class: 'text-white text-sm font-semibold truncate', text: r.contact_name || '—' }),
                        el('p', { class: 'text-slate-500 text-xs mt-0.5 truncate', text: r.business_name || r.email || '' }),
                        el('p', { class: 'text-slate-400 text-xs mt-1.5', text: r.service_required || '' })
                    ]),
                    badge(r.pipeline_status)
                ]),
                el('div', { class: 'flex items-center justify-between mt-3 pt-3 border-t border-slate-700/40 text-xs' }, [
                    el('span', { class: 'text-slate-500', text: 'Follow-up: ' + fmtDate(r.next_followup_at) }),
                    el('span', { class: 'text-blue-400 font-medium', text: 'Open' })
                ])
            ])));
    }

    function pagination(total) {
        const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        const page = Math.min(state.filters.page, pages - 1);
        const bar = el('div', { class: 'flex items-center justify-between gap-3 mt-4' }, [
            el('p', { class: 'text-slate-500 text-xs', text: total + ' lead' + (total === 1 ? '' : 's') + ' · page ' + (page + 1) + ' of ' + pages }),
            el('div', { class: 'flex gap-2' }, [
                el('button', {
                    class: 'px-4 py-2 min-h-[40px] rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-colors disabled:opacity-40 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
                    text: 'Previous', disabled: page === 0,
                    onclick: () => { state.filters.page = page - 1; refreshTable(); }
                }),
                el('button', {
                    class: 'px-4 py-2 min-h-[40px] rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-colors disabled:opacity-40 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
                    text: 'Next', disabled: page >= pages - 1,
                    onclick: () => { state.filters.page = page + 1; refreshTable(); }
                })
            ])
        ]);
        return bar;
    }

    function emptyState(filtered) {
        return el('div', { class: 'bg-slate-800/60 rounded-2xl border border-slate-700/30 p-10 text-center' }, [
            el('div', { class: 'w-12 h-12 mx-auto rounded-xl bg-blue-500/10 flex items-center justify-center mb-4' },
                [el('i', { class: 'fas fa-inbox text-blue-300 text-xl', 'aria-hidden': 'true' })]),
            el('p', { class: 'text-white font-semibold mb-1', text: filtered ? 'No leads match your filters' : 'No leads yet' }),
            el('p', { class: 'text-slate-400 text-sm mb-5', text: filtered ? 'Try clearing the search or filters.' : 'Record your first enquiry with the New Lead button.' })
        ]);
    }

    async function refreshTable() {
        const holder = document.getElementById('crm-table-area');
        if (!holder) return;
        holder.textContent = '';
        holder.appendChild(loadingBlock('Loading leads…'));
        try {
            const { rows, total } = await api.queryLeads({ ...state.filters, pageSize: PAGE_SIZE });
            holder.textContent = '';
            if (rows.length === 0) {
                holder.appendChild(emptyState(Boolean(state.filters.search || state.filters.status || state.filters.source)));
            } else {
                holder.appendChild(el('div', { class: 'hidden md:block' }, [leadsTable(rows)]));
                holder.appendChild(el('div', { class: 'md:hidden' }, [mobileCards(rows)]));
            }
            holder.appendChild(pagination(total));
        } catch (e) {
            holder.textContent = '';
            holder.appendChild(errorBlock(e.message, refreshTable));
        }
    }

    function loadingBlock(label) {
        return el('div', { class: 'flex items-center justify-center gap-3 py-16 text-slate-400 text-sm', role: 'status' }, [
            el('i', { class: 'fas fa-circle-notch fa-spin text-blue-400', 'aria-hidden': 'true' }),
            el('span', { text: label })
        ]);
    }

    function errorBlock(message, retry) {
        return el('div', { class: 'bg-slate-800/60 border border-red-500/30 rounded-2xl p-6 text-center' }, [
            el('p', { class: 'text-red-300 text-sm mb-4', text: message }),
            retry ? el('button', {
                class: 'px-5 py-2.5 min-h-[44px] rounded-xl border border-slate-600 text-slate-200 hover:bg-slate-800 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
                text: 'Try again', onclick: retry
            }) : null
        ]);
    }

    /* ---------- drawer (lead detail) ---------- */

    function closeDrawer() {
        document.getElementById('crm-drawer-root').textContent = '';
        state.drawerOpen = false;
        state.currentLead = null;
        document.removeEventListener('keydown', escListener);
        if (state.lastFocus) { state.lastFocus.focus(); state.lastFocus = null; }
    }

    function escListener(ev) {
        if (ev.key === 'Escape') {
            closeDrawer();
            closeModal();
            closeConfirm();
        }
    }

    function overlayWrap(content, onClose) {
        const overlay = el('div', {
            class: 'fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end',
            onclick: (ev) => { if (ev.target === overlay) onClose(); }
        }, [content]);
        return overlay;
    }

    async function openDrawer(id) {
        state.lastFocus = document.activeElement;
        state.drawerOpen = true;
        const drawerRoot = document.getElementById('crm-drawer-root');
        drawerRoot.textContent = '';
        const panel = el('div', { class: 'w-full max-w-xl h-full bg-slate-900 border-l border-slate-700 overflow-y-auto crm-scroll', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Lead details' }, [
            loadingBlock('Loading lead…')
        ]);
        drawerRoot.appendChild(overlayWrap(panel, closeDrawer));
        document.addEventListener('keydown', escListener);

        try {
            const lead = await api.getLead(id);
            if (!lead) { toast('Lead not found.', 'error'); closeDrawer(); return; }
            state.currentLead = lead;
            panel.textContent = '';
            panel.appendChild(drawerContent(lead));
            const first = panel.querySelector('button, input, select, textarea');
            if (first) first.focus();
        } catch (e) {
            panel.textContent = '';
            panel.appendChild(el('div', { class: 'p-6' }, [errorBlock(e.message, () => openDrawer(id))]));
        }
    }

    function drawerContent(lead) {
        const wrap = el('div', { class: 'p-5 sm:p-6 space-y-5' });

        const headRow = el('div', { class: 'flex items-start justify-between gap-3' }, [
            el('div', { class: 'min-w-0' }, [
                el('h2', { class: 'text-lg font-bold text-white truncate', text: lead.contact_name || 'Lead' }),
                el('p', { class: 'text-slate-400 text-sm', text: lead.business_name || '' })
            ]),
            el('button', {
                class: 'w-10 h-10 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 flex items-center justify-center flex-shrink-0 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
                'aria-label': 'Close lead details',
                onclick: closeDrawer
            }, [el('i', { class: 'fas fa-xmark', 'aria-hidden': 'true' })])
        ]);
        wrap.appendChild(headRow);

        const isOwner = state.profile && state.profile.role === 'owner';
        const actions = el('div', { class: 'flex flex-wrap gap-2' }, [
            el('button', {
                class: 'px-4 py-2 min-h-[40px] rounded-lg bg-blue-600/10 border border-blue-500/25 text-blue-300 hover:bg-blue-600/20 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
                text: 'Edit details', onclick: () => openLeadForm(lead)
            }),
            el('button', {
                class: 'px-4 py-2 min-h-[40px] rounded-lg bg-blue-600/10 border border-blue-500/25 text-blue-300 hover:bg-blue-600/20 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
                text: 'Change status', onclick: () => openStatusChanger(lead)
            }),
            isOwner ? el('button', {
                class: 'px-4 py-2 min-h-[40px] rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400',
                text: 'Delete lead', onclick: () => confirmDelete(lead)
            }) : null
        ]);
        wrap.appendChild(actions);

        wrap.appendChild(infoCard(lead));
        wrap.appendChild(activityCard(lead));
        wrap.appendChild(followupCard(lead));
        return wrap;
    }

    function infoRow(label, value) {
        return el('div', { class: 'flex items-start justify-between gap-4 py-2' }, [
            el('span', { class: 'text-slate-500 text-xs flex-shrink-0', text: label }),
            el('span', { class: 'text-slate-200 text-sm text-right break-words min-w-0', text: value || '—' })
        ]);
    }

    function infoCard(lead) {
        const statusRow = el('div', { class: 'flex items-start justify-between gap-4 py-2' }, [
            el('span', { class: 'text-slate-500 text-xs flex-shrink-0', text: 'Status' }),
            el('span', { class: 'flex justify-end' }, [badge(lead.pipeline_status)])
        ]);
        const card = el('div', { class: 'bg-slate-800/60 rounded-2xl border border-slate-700/30 p-5' }, [
            el('h3', { class: 'text-white font-semibold text-sm mb-2', text: 'Details' }),
            statusRow,
            infoRow('Email', lead.email),
            infoRow('Phone', lead.phone),
            infoRow('Country', lead.country),
            infoRow('Service', lead.service_required),
            infoRow('Budget', lead.budget),
            infoRow('Timeframe', lead.timeframe),
            infoRow('Source', sourceLabel(lead.lead_source)),
            infoRow('Owner', (lead.assigned_staff && lead.assigned_staff.full_name) || 'Unassigned'),
            infoRow('Created', fmtDateTime(lead.created_at))
        ]);

        const desc = el('div', { class: 'mt-3 pt-3 border-t border-slate-700/40' }, [
            el('p', { class: 'text-slate-500 text-xs mb-1', text: 'Project description' }),
            el('p', { class: 'text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words', text: lead.project_description || '—' })
        ]);
        card.appendChild(desc);
        return card;
    }

    function activityCard(lead) {
        const list = el('div', { class: 'space-y-3', id: 'crm-activity-list' }, [loadingBlock('Loading history…')]);
        const card = el('div', { class: 'bg-slate-800/60 rounded-2xl border border-slate-700/30 p-5' }, [
            el('h3', { class: 'text-white font-semibold text-sm mb-3', text: 'Activity history' }),
            list
        ]);

        const typeMeta = {
            created: { icon: 'fas fa-plus', color: 'text-blue-400' },
            note: { icon: 'fas fa-note-sticky', color: 'text-slate-300' },
            contact_attempt: { icon: 'fas fa-phone', color: 'text-blue-400' },
            follow_up: { icon: 'fas fa-bell', color: 'text-amber-400' },
            status_change: { icon: 'fas fa-arrow-right-arrow-left', color: 'text-violet-400' }
        };

        api.listActivities(lead.id).then((items) => {
            list.textContent = '';
            if (items.length === 0) {
                list.appendChild(el('p', { class: 'text-slate-500 text-sm', text: 'No activity recorded yet.' }));
                return;
            }
            for (const a of items) {
                const m = typeMeta[a.activity_type] || typeMeta.note;
                const title = a.activity_type === 'status_change'
                    ? (a.old_status || '') + ' → ' + (a.new_status || '')
                    : a.activity_type.replace('_', ' ');
                list.appendChild(el('div', { class: 'flex items-start gap-3' }, [
                    el('div', { class: 'w-8 h-8 rounded-lg bg-slate-700/40 flex items-center justify-center flex-shrink-0', 'aria-hidden': 'true' },
                        [el('i', { class: m.icon + ' ' + m.color + ' text-xs' })]),
                    el('div', { class: 'min-w-0' }, [
                        el('p', { class: 'text-slate-200 text-sm break-words', text: a.body }),
                        el('p', { class: 'text-slate-500 text-xs mt-0.5', text: title + ' · ' + ((a.actor && a.actor.full_name) || 'System') + ' · ' + fmtDateTime(a.created_at) })
                    ])
                ]));
            }
        }).catch((e) => {
            list.textContent = '';
            list.appendChild(errorBlock(e.message, () => activityCard(lead)));
        });
        return card;
    }

    function followupCard(lead) {
        const dateIn = el('input', {
            type: 'date', id: 'crm-followup-date', value: lead.next_followup_at || '',
            class: 'crm-input rounded-xl border border-slate-600 bg-slate-800 text-white px-3 py-2.5 min-h-[44px] focus:outline-none focus:border-blue-400 text-sm'
        });
        const save = el('button', {
            class: 'px-4 py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
            text: 'Schedule',
            onclick: async () => {
                const value = dateIn.value || null;
                try {
                    await api.updateLead(lead.id, { next_followup_at: value });
                    try {
                        if (value) {
                            await api.addActivity(lead.id, 'follow_up', 'Follow-up scheduled for ' + fmtDate(value) + '.');
                        }
                        toast(value ? 'Follow-up scheduled for ' + fmtDate(value) + '.' : 'Follow-up cleared.');
                    } catch (activityError) {
                        // The follow-up itself was saved; report the history gap honestly.
                        toast('Follow-up saved, but the activity note could not be recorded: ' + activityError.message, 'error');
                    }
                    await reloadStats();
                    openDrawer(lead.id);
                } catch (e) {
                    toast(e.message, 'error');
                }
            }
        });
        return el('div', { class: 'bg-slate-800/60 rounded-2xl border border-slate-700/30 p-5' }, [
            el('h3', { class: 'text-white font-semibold text-sm mb-3', text: 'Next follow-up' }),
            el('div', { class: 'flex flex-col sm:flex-row gap-3' }, [dateIn, save])
        ]);
    }

    function openStatusChanger(lead) {
        const btns = el('div', { class: 'grid grid-cols-2 gap-2' }, STATUSES.filter((s) => s.key !== lead.pipeline_status).map((s) =>
            el('button', {
                class: 'px-3 py-2.5 min-h-[44px] rounded-xl border text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ' + s.badge,
                text: s.label,
                onclick: async () => {
                    try {
                        await api.changeStatus(lead.id, s.key);
                        toast('Status changed to ' + s.label + '.');
                        closeModal();
                        await reloadStats();
                        openDrawer(lead.id);
                    } catch (e) {
                        toast(e.message, 'error');
                    }
                }
            })
        ));
        openModalShell('Change Status', [btns]);
    }

    /* ---------- lead form (new / edit) ---------- */

    function formField(labelText, input, optional) {
        return el('div', {}, [
            el('label', { for: input.id, class: 'block text-sm font-medium text-slate-200 mb-2' }, [
                el('span', { text: labelText }),
                optional ? el('span', { class: 'text-slate-500 font-normal', text: ' (optional)' }) : null
            ]),
            input
        ]);
    }

    function leadForm(lead) {
        const isEdit = Boolean(lead);
        const err = el('p', { class: 'hidden text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2', role: 'alert' });

        const mkInput = (id, type, opts) => el('input', Object.assign({
            type, id,
            class: 'crm-input w-full rounded-xl border border-slate-600 bg-slate-800 text-white placeholder-slate-500 px-4 py-3 min-h-[48px] focus:outline-none focus:border-blue-400'
        }, opts || {}));
        const mkSelect = (id, options, selected) => el('select', {
            id,
            class: 'crm-input w-full rounded-xl border border-slate-600 bg-slate-800 text-white px-4 py-3 min-h-[48px] focus:outline-none focus:border-blue-400'
        }, options.map((o) => {
            const opt = el('option', { value: o.v, text: o.l });
            if (o.v === selected) opt.selected = true;
            return opt;
        }));

        const nameIn = mkInput('lf-name', 'text', { maxlength: 120, autocomplete: 'off', value: lead ? lead.contact_name : '', placeholder: 'Contact name' });
        const bizIn = mkInput('lf-business', 'text', { maxlength: 120, autocomplete: 'off', value: lead ? (lead.business_name || '') : '', placeholder: 'Business or organisation' });
        const emailIn = mkInput('lf-email', 'email', { maxlength: 160, autocomplete: 'off', value: lead ? (lead.email || '') : '', placeholder: 'name@example.com' });
        const phoneIn = mkInput('lf-phone', 'tel', { maxlength: 40, autocomplete: 'off', value: lead ? (lead.phone || '') : '', placeholder: '+61 … or +254 …' });
        const countrySel = mkSelect('lf-country', COUNTRIES.map((c) => ({ v: c, l: c })), lead ? lead.country : 'Australia');
        const serviceSel = mkSelect('lf-service', SERVICES.map((s) => ({ v: s, l: s })), lead ? lead.service_required : '');
        const sourceSel = mkSelect('lf-source', SOURCES.map((s) => ({ v: s.key, l: s.label })), lead ? lead.lead_source : 'other');
        const budgetIn = mkInput('lf-budget', 'text', { maxlength: 60, value: lead ? (lead.budget || '') : '', placeholder: 'e.g. AUD 2,000 or not sure' });
        const timeSel = mkSelect('lf-timeframe', TIMEFRAMES.map((t) => ({ v: t, l: t })), lead ? lead.timeframe : 'Flexible / not sure');
        const descIn = el('textarea', {
            id: 'lf-desc', rows: 4, maxlength: 4000,
            placeholder: 'What does the client need?',
            class: 'crm-input w-full rounded-xl border border-slate-600 bg-slate-800 text-white placeholder-slate-500 px-4 py-3 focus:outline-none focus:border-blue-400'
        });
        descIn.value = lead ? lead.project_description : '';

        const ownerSel = mkSelect('lf-owner', [{ v: '', l: 'Unassigned' }].concat(state.staff.map((s) => ({ v: s.id, l: s.full_name }))), lead ? lead.assigned_to : '');

        const submit = el('button', {
            type: 'submit',
            class: 'inline-flex items-center justify-center min-h-[48px] px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400'
        }, [el('span', { text: isEdit ? 'Save changes' : 'Create lead' })]);

        const form = el('form', { class: 'space-y-4', novalidate: true, onsubmit: async (ev) => {
            ev.preventDefault();
            err.classList.add('hidden');
            const values = {
                contact_name: nameIn.value.trim(),
                business_name: bizIn.value.trim() || null,
                email: emailIn.value.trim() || null,
                phone: phoneIn.value.trim() || null,
                country: countrySel.value,
                service_required: serviceSel.value,
                lead_source: sourceSel.value,
                budget: budgetIn.value.trim() || null,
                timeframe: timeSel.value,
                project_description: descIn.value.trim(),
                assigned_to: ownerSel.value || null
            };
            const problems = [];
            if (values.contact_name.length < 2) problems.push('Enter the contact name.');
            if (!values.service_required) problems.push('Choose the service required.');
            if (values.project_description.length < 10) problems.push('Describe the project (at least 10 characters).');
            if (!values.email && !values.phone && values.project_description.length < 10) problems.push('Add an email, phone or a longer description so the lead is reachable.');
            if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) problems.push('The email address does not look valid.');
            if (problems.length) {
                err.textContent = problems.join(' ');
                err.classList.remove('hidden');
                return;
            }
            submit.disabled = true;
            submit.classList.add('opacity-60', 'pointer-events-none');
            try {
                if (isEdit) {
                    await api.updateLead(lead.id, values);
                    toast('Lead updated.');
                } else {
                    // The database trigger records the "created" activity, so a
                    // successful create cannot leave a missing history entry.
                    await api.createLead(values);
                    toast('Lead created.');
                }
                closeModal();
                await reloadStats();
                refreshTable();
                if (isEdit) openDrawer(lead.id);
            } catch (e) {
                err.textContent = e.message;
                err.classList.remove('hidden');
            } finally {
                submit.disabled = false;
                submit.classList.remove('opacity-60', 'pointer-events-none');
            }
        } }, [
            el('div', { class: 'grid grid-cols-1 sm:grid-cols-2 gap-4' }, [
                formField('Contact name *', nameIn),
                formField('Business or organisation', bizIn, true),
                formField('Email', emailIn, true),
                formField('Phone', phoneIn, true),
                formField('Country', countrySel),
                formField('Service required *', serviceSel),
                formField('Lead source', sourceSel),
                formField('Budget', budgetIn, true),
                formField('Timeframe', timeSel),
                formField('Assigned owner', ownerSel)
            ]),
            formField('Project description *', descIn),
            err,
            el('div', { class: 'flex justify-end gap-3' }, [
                el('button', {
                    type: 'button',
                    class: 'px-5 py-3 min-h-[48px] rounded-xl border border-slate-600 text-slate-200 hover:bg-slate-800 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
                    text: 'Cancel', onclick: closeModal
                }),
                submit
            ])
        ]);
        return form;
    }

    function openLeadForm(lead) {
        openModalShell(lead ? 'Edit Lead' : 'New Lead', [leadForm(lead)]);
        const first = document.getElementById('lf-name');
        if (first) first.focus();
    }

    /* ---------- modal + confirm ---------- */

    function openModalShell(title, contentNodes) {
        const modalRoot = document.getElementById('crm-modal-root');
        modalRoot.textContent = '';
        const panel = el('div', {
            class: 'w-full max-w-2xl max-h-[88vh] overflow-y-auto crm-scroll bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-6',
            role: 'dialog', 'aria-modal': 'true', 'aria-label': title
        }, [
            el('div', { class: 'flex items-center justify-between gap-3 mb-5' }, [
                el('h2', { class: 'text-lg font-bold text-white', text: title }),
                el('button', {
                    class: 'w-10 h-10 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
                    'aria-label': 'Close dialog', onclick: closeModal
                }, [el('i', { class: 'fas fa-xmark', 'aria-hidden': 'true' })])
            ]),
            ...contentNodes
        ]);
        const overlay = el('div', {
            class: 'fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4',
            onclick: (ev) => { if (ev.target === overlay) closeModal(); }
        }, [panel]);
        modalRoot.appendChild(overlay);
        document.addEventListener('keydown', escListener);
    }

    function closeModal() {
        document.getElementById('crm-modal-root').textContent = '';
    }

    function confirmDelete(lead) {
        const confirmRoot = document.getElementById('crm-confirm-root');
        confirmRoot.textContent = '';
        const panel = el('div', {
            class: 'w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6',
            role: 'alertdialog', 'aria-modal': 'true', 'aria-label': 'Confirm deletion'
        }, [
            el('h2', { class: 'text-lg font-bold text-white mb-2', text: 'Delete this lead?' }),
            el('p', { class: 'text-slate-400 text-sm leading-relaxed mb-5', text: 'This permanently removes ' + (lead.contact_name || 'this lead') + ' and the activity history. This action cannot be undone.' }),
            el('div', { class: 'flex justify-end gap-3' }, [
                el('button', {
                    class: 'px-5 py-2.5 min-h-[44px] rounded-xl border border-slate-600 text-slate-200 hover:bg-slate-800 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
                    text: 'Cancel', onclick: closeConfirm
                }),
                el('button', {
                    class: 'px-5 py-2.5 min-h-[44px] rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400',
                    text: 'Delete permanently',
                    onclick: async () => {
                        try {
                            await api.deleteLead(lead.id);
                            toast('Lead deleted.');
                            closeConfirm();
                            closeDrawer();
                            await reloadStats();
                            refreshTable();
                        } catch (e) {
                            closeConfirm();
                            toast(e.message, 'error');
                        }
                    }
                })
            ])
        ]);
        const overlay = el('div', {
            class: 'fixed inset-0 z-[55] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4',
            onclick: (ev) => { if (ev.target === overlay) closeConfirm(); }
        }, [panel]);
        confirmRoot.appendChild(overlay);
        document.addEventListener('keydown', escListener);
        panel.querySelector('button').focus();
    }

    function closeConfirm() {
        document.getElementById('crm-confirm-root').textContent = '';
    }

    /* ---------- app shell ---------- */

    function renderApp() {
        renderHeader();
        renderHeaderUser();
        const r = root();
        r.textContent = '';

        const overview = renderOverview();

        r.appendChild(el('div', { class: 'flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6' }, [
            el('div', {}, [
                el('h1', { class: 'text-2xl sm:text-3xl font-bold text-white', text: 'Lead Pipeline' }),
                el('p', { class: 'text-slate-400 text-sm mt-1', text: 'Client enquiries from first contact to project conversion.' })
            ]),
            el('button', {
                class: 'inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
                onclick: () => openLeadForm(null)
            }, [el('i', { class: 'fas fa-plus mr-2 text-xs', 'aria-hidden': 'true' }), el('span', { text: 'New Lead' })])
        ]));

        r.appendChild(overview);

        const strip = el('div', { id: 'crm-pipeline', class: 'mt-6' });
        strip.appendChild(pipelineStrip());
        r.appendChild(strip);

        r.appendChild(el('div', { class: 'mt-6' }, [toolbar()]));
        r.appendChild(el('div', { id: 'crm-table-area', class: 'mt-4' }));

        r.appendChild(el('footer', { class: 'mt-10 pt-6 border-t border-slate-800 text-center' }, [
            el('p', { class: 'text-slate-600 text-xs', text: 'DTB Technologies internal system · access is logged and restricted to active staff.' })
        ]));

        refreshTable();
    }

    async function reloadStats() {
        try {
            const rows = await api.fetchStats();
            state.rawRows = rows;
            state.stats = computeStats(rows);
            const holder = document.getElementById('crm-overview');
            if (holder) { holder.textContent = ''; holder.appendChild(renderOverview()); }
            renderPipelineActive();
        } catch (e) {
            toast(e.message, 'error');
        }
    }

    /* ---------- boot ---------- */

    async function boot() {
        if (!api.isConfigured()) { renderNotConfigured(); return; }
        const authError = window.__dtbAuthError || '';
        const flow = window.__dtbAuthFlow || '';
        try {
            state.session = await api.getSession();
        } catch (e) {
            renderNotConfigured();
            toast(e.message, 'error');
            return;
        }
        api.onAuthChange((session) => {
            const had = Boolean(state.session);
            state.session = session;
            if (!session && had) { renderSignIn(); }
        });
        if (!state.session) {
            const expired = flow === 'invite'
                ? 'This invitation link is no longer valid. Ask a DTB owner to resend it.'
                : flow === 'recovery'
                    ? 'This password reset link is no longer valid. Request a new one below.'
                    : '';
            renderSignIn('', (expired || authError) ? (expired ? expired + (authError ? ' (' + decodeURIComponent(authError) + ')' : '') : decodeURIComponent(authError)) : '');
            return;
        }
        if (flow === 'invite' || flow === 'recovery') {
            // Invited or resetting staff must set a password before using the CRM.
            renderSetPassword();
            return;
        }

        try {
            state.profile = await api.getMyProfile();
        } catch (e) {
            renderDenied('Your account could not be verified as DTB staff. ' + e.message);
            return;
        }
        if (!state.profile) {
            renderDenied('This account is not linked to a DTB staff record. Ask a DTB owner to link it in Supabase (Auth invite + staff insert, see docs/crm-setup.md).');
            return;
        }
        if (state.profile.status !== 'active') {
            renderDenied('This staff account is currently disabled. Contact a DTB owner.');
            return;
        }
        try {
            state.staff = await api.listStaff();
        } catch (e) {
            state.staff = [];
        }
        await reloadStats();
        renderApp();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
