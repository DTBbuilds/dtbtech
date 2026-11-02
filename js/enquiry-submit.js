/* Secure enquiry submission for the DTB project brief (DTB-CONVERT-001B).
   Posts to /api/enquiry — the same handler runs on Vercel and the local
   Express dev server. Success is only ever shown when the server confirms
   the enquiry was persisted and returns a reference. WhatsApp, email and
   Copy Brief remain as fallbacks that store nothing. */
(function () {
    'use strict';

    var CONSENT_TEXT = 'I agree to DTB Technologies storing these details so the team can respond to my enquiry.';
    var SUBMIT_TIMEOUT_MS = 12000;

    function init() {
        var form = document.getElementById('dtb-project-brief-form');
        var sendBtn = document.getElementById('dtb-brief-send');
        var result = document.getElementById('dtb-enquiry-result');
        if (!form || !sendBtn || !result) return;

        var byId = function (id) { return document.getElementById(id); };
        var val = function (id) { var el = byId(id); return el ? el.value.trim() : ''; };
        var sendLabel = byId('dtb-brief-send-label');
        var briefStatus = byId('dtb-brief-status');

        var idempotencyKey = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
            : 'k-' + Date.now() + '-' + Math.random().toString(36).slice(2);
        var loadedAt = Date.now();

        function newKey() {
            idempotencyKey = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
                : 'k-' + Date.now() + '-' + Math.random().toString(36).slice(2);
        }

        function utm() {
            var p = new URLSearchParams(window.location.search);
            var out = {};
            ['source', 'medium', 'campaign'].forEach(function (k) {
                var v = p.get('utm_' + k);
                if (v) out[k] = v.slice(0, 100);
            });
            return out;
        }

        function show(kind, nodes) {
            result.hidden = false;
            result.textContent = '';
            result.className = 'rounded-xl border p-4 sm:p-5 ' + (kind === 'success'
                ? 'border-green-500/40 bg-green-500/10 text-green-200'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-200');
            nodes.forEach(function (n) { result.appendChild(n); });
            result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }

        function line(text, strong) {
            var el = document.createElement(strong ? 'strong' : 'span');
            el.textContent = text;
            el.className = 'block';
            return el;
        }

        function hideResult() {
            result.hidden = true;
            result.textContent = '';
        }

        function clientValidate() {
            var errs = [];
            if (!val('project-service')) errs.push('choose a service');
            if (val('project-goal').length < 15) errs.push('describe your project (15+ characters)');
            if (!val('project-name')) errs.push('your name');
            var email = val('project-email');
            var phone = val('project-phone');
            var pref = val('project-preferred') || 'email';
            if (pref === 'email' && !email) errs.push('your email');
            if ((pref === 'phone' || pref === 'whatsapp') && !phone) errs.push('a phone / WhatsApp number');
            if (!email && !phone) errs.push('an email or phone number');
            if (!byId('project-consent').checked) errs.push('consent to store your details');
            return errs;
        }

        function markInvalid(id) {
            var el = byId(id);
            if (el) el.classList.add('border-red-400');
        }
        ['project-name', 'project-email', 'project-phone', 'project-consent', 'project-goal', 'project-service']
            .forEach(function (id) {
                var el = byId(id);
                if (el) el.addEventListener('input', function () { el.classList.remove('border-red-400'); });
            });

        sendBtn.addEventListener('click', function () {
            hideResult();
            var errs = clientValidate();
            if (errs.length) {
                if (!val('project-name')) markInvalid('project-name');
                if (!val('project-email')) markInvalid('project-email');
                if (!val('project-phone') && !val('project-email')) markInvalid('project-phone');
                if (!byId('project-consent').checked) markInvalid('project-consent');
                show('error', [
                    line('To send your enquiry we still need: ' + errs.join(', ') + '.'),
                    line('Nothing was stored — WhatsApp, email or Copy Brief still work without these details.')
                ]);
                return;
            }

            sendBtn.disabled = true;
            sendLabel.textContent = 'Sending…';
            if (briefStatus) briefStatus.textContent = '';

            var payload = {
                name: val('project-name'),
                business: val('project-business'),
                email: val('project-email'),
                phone: val('project-phone'),
                preferredContact: val('project-preferred') || 'email',
                service: val('project-service'),
                description: val('project-goal'),
                budget: val('project-budget'),
                timeframe: val('project-timeline'),
                region: val('project-region'),
                consentGiven: byId('project-consent').checked === true,
                consentText: CONSENT_TEXT,
                emailConsent: byId('project-email-consent').checked === true,
                sourcePage: 'dtbtech.org/contact',
                website: val('project-website'),          // honeypot
                elapsedMs: Date.now() - loadedAt,
                idempotencyKey: idempotencyKey,
                utm: utm()
            };

            var controller = new AbortController();
            var timer = setTimeout(function () { controller.abort(); }, SUBMIT_TIMEOUT_MS);

            fetch('/api/enquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            }).then(function (res) {
                return res.json().then(function (data) { return { status: res.status, data: data }; });
            }).then(function (r) {
                var d = r.data || {};
                if (d.ok && d.reference) {
                    var nodes = [
                        line('Enquiry received — thank you.', true),
                        line('Your reference: ' + d.reference, true),
                        line('We reply during business hours via your preferred channel'
                            + (d.notification === 'sent' ? ' — a confirmation email is on its way.' : '.'))
                    ];
                    if (d.duplicate) nodes.push(line('This is the same enquiry you already sent — no duplicate was created.'));
                    show('success', nodes);
                    newKey();           // a genuinely new enquiry gets a fresh key
                    loadedAt = Date.now();
                    return;
                }
                if (d.error === 'not_configured') {
                    show('error', [
                        line('Secure send is not switched on yet — nothing was stored.'),
                        line('Please use WhatsApp or the email option below; your brief is still ready to send.')
                    ]);
                    return;
                }
                if (d.error === 'rate_limited') {
                    show('error', [
                        line('Too many attempts — please wait a little and try again.'),
                        line('Nothing was stored. WhatsApp and email still work right now.')
                    ]);
                    return;
                }
                if (r.status === 400 && d.error === 'validation') {
                    show('error', [
                        line('Some details need attention — please check the highlighted fields and try again.'),
                        line('Nothing was stored.')
                    ]);
                    return;
                }
                show('error', [
                    line('Your enquiry could not be saved just now — nothing was stored.'),
                    line('Please try again, or use WhatsApp / email below and mention your project directly.')
                ]);
            }).catch(function () {
                show('error', [
                    line('Network problem — we could not reach the server. Nothing was stored.'),
                    line('Check your connection and try again, or use WhatsApp / email below.')
                ]);
            }).finally(function () {
                clearTimeout(timer);
                sendBtn.disabled = false;
                sendLabel.textContent = 'Send Enquiry Securely';
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
