/* Tradies funnel (DTB-TRADIES-001): privacy-friendly event tracking, the free
   website-check form, offer preselection and UTM preservation.
   No automatic submission, no form content stored — events carry event names
   and page context only, never field values. */
(function () {
    'use strict';

    /* ------------------------------------------------------------------ *
     * Event tracking — pushes to window.dataLayer (GTM/GA-compatible).
     * If no tag manager is present the events are buffered on the array
     * so a future analytics integration can pick them up.
     * ------------------------------------------------------------------ */
    window.dataLayer = window.dataLayer || [];

    function dtbTrack(eventName, context) {
        var payload = { event: eventName, page: 'tradies' };
        if (context) payload.context = context;
        window.dataLayer.push(payload);
    }

    // Delegated click tracking for elements carrying data-track attributes.
    document.addEventListener('click', function (event) {
        var el = event.target.closest('[data-track]');
        if (!el) return;
        dtbTrack(el.getAttribute('data-track'), el.getAttribute('data-track-context') || null);
    });

    /* ------------------------------------------------------------------ *
     * UTM preservation — carry campaign parameters from this page through
     * to the contact page so the journey stays attributable.
     * ------------------------------------------------------------------ */
    var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    var utmParams = (function () {
        var found = new URLSearchParams(window.location.search);
        var kept = new URLSearchParams();
        UTM_KEYS.forEach(function (key) {
            var value = found.get(key);
            if (value) kept.set(key, value);
        });
        return kept;
    })();

    function hrefWithUtm(href) {
        if (!utmParams.toString()) return href;
        // Insert before any #fragment so parameters stay in the query string.
        var hashIndex = href.indexOf('#');
        var base = hashIndex > -1 ? href.slice(0, hashIndex) : href;
        var hash = hashIndex > -1 ? href.slice(hashIndex) : '';
        var separator = base.indexOf('?') > -1 ? '&' : '?';
        return base + separator + utmParams.toString() + hash;
    }

    function preserveUtmOnLinks() {
        document.querySelectorAll('a[data-utm-preserve]').forEach(function (link) {
            link.setAttribute('href', hrefWithUtm(link.getAttribute('href')));
        });
    }

    /* ------------------------------------------------------------------ *
     * Offer preselection — offer CTAs scroll to the form and preselect
     * the matching option.
     * ------------------------------------------------------------------ */
    function bindOfferPreselect() {
        var offerSelect = document.getElementById('tradie-offer');
        if (!offerSelect) return;
        document.querySelectorAll('[data-select-offer]').forEach(function (trigger) {
            trigger.addEventListener('click', function () {
                var offer = trigger.getAttribute('data-select-offer');
                var match = Array.prototype.some.call(offerSelect.options, function (option) {
                    return option.value === offer;
                });
                if (match) offerSelect.value = offer;
            });
        });
        // Deep link support: /tradies?offer=Website%20Rescue#website-check
        var requested = new URLSearchParams(window.location.search).get('offer');
        if (requested && Array.prototype.some.call(offerSelect.options, function (option) {
            return option.value === requested;
        })) {
            offerSelect.value = requested;
        }
    }

    /* ------------------------------------------------------------------ *
     * Free website-check form — validates, then prepares a message the
     * visitor reviews and sends themselves (WhatsApp, email or clipboard).
     * ------------------------------------------------------------------ */
    function initWebsiteCheckForm() {
        var form = document.getElementById('dtb-tradies-check-form');
        if (!form) return;

        var status = document.getElementById('dtb-tradies-status');
        var noWebsite = document.getElementById('tradie-no-website');
        var websiteInput = document.getElementById('tradie-website');
        var startFired = false;

        function markStartOnce() {
            if (startFired) return;
            startFired = true;
            dtbTrack('tradies_website_check_start');
        }
        form.addEventListener('focusin', markStartOnce);
        form.addEventListener('submit', markStartOnce);

        // "I don't have a website yet" disables and clears the URL field.
        noWebsite.addEventListener('change', function () {
            websiteInput.disabled = noWebsite.checked;
            if (noWebsite.checked) {
                websiteInput.value = '';
                clearError(websiteInput, 'tradie-website-error');
            }
        });

        function setError(input, errorId, message) {
            var error = document.getElementById(errorId);
            input.setAttribute('aria-invalid', 'true');
            if (error) {
                error.textContent = message;
                error.classList.remove('hidden');
            }
        }

        function clearError(input, errorId) {
            var error = document.getElementById(errorId);
            input.removeAttribute('aria-invalid');
            if (error) error.classList.add('hidden');
        }

        function validateField(input, errorId, message) {
            if (!input.checkValidity()) {
                setError(input, errorId, message);
                return false;
            }
            clearError(input, errorId);
            return true;
        }

        function validate() {
            var valid = true;
            valid = validateField(document.getElementById('tradie-name'), 'tradie-name-error', 'Please enter your name.') && valid;
            valid = validateField(document.getElementById('tradie-trade'), 'tradie-trade-error', 'Please select your trade or service.') && valid;
            valid = validateField(document.getElementById('tradie-contact'), 'tradie-contact-error', 'Please choose a preferred contact method.') && valid;
            valid = validateField(document.getElementById('tradie-problem'), 'tradie-problem-error', 'Please describe your biggest problem (at least 10 characters).') && valid;
            if (!noWebsite.checked) {
                valid = validateField(websiteInput, 'tradie-website-error', "Please enter a valid website address, or tick the box below if you don't have one.") && valid;
            }
            if (!valid) {
                status.textContent = 'Please check the highlighted fields and try again.';
            }
            return valid;
        }

        // Clear a field's error as soon as it becomes valid again.
        ['tradie-name', 'tradie-trade', 'tradie-contact', 'tradie-problem', 'tradie-website'].forEach(function (id) {
            var input = document.getElementById(id);
            var errorId = id + '-error';
            input.addEventListener('input', function () {
                if (input.checkValidity()) clearError(input, errorId);
            });
            input.addEventListener('change', function () {
                if (input.checkValidity()) clearError(input, errorId);
            });
        });

        function read(id) {
            return document.getElementById(id).value.trim();
        }

        function buildMessage() {
            return [
                "Hello DTB Technologies, I'd like a free website check.",
                '',
                'Name: ' + read('tradie-name'),
                'Business: ' + (read('tradie-business') || 'Not specified'),
                'Trade: ' + read('tradie-trade'),
                'Current website: ' + (noWebsite.checked ? 'None yet' : (read('tradie-website') || 'Not provided')),
                'Service area: ' + (read('tradie-area') || 'Not specified'),
                'Interested in: ' + read('tradie-offer'),
                'Preferred contact: ' + read('tradie-contact'),
                ...(document.getElementById('dtb-tradies-email-address')?.value.trim() ? ['Email: ' + document.getElementById('dtb-tradies-email-address').value.trim()] : []),
                ...(document.getElementById('dtb-tradies-phone-number')?.value.trim() ? ['Phone: ' + document.getElementById('dtb-tradies-phone-number').value.trim()] : []),
                '',
                'Biggest problem:',
                read('tradie-problem'),
                '',
                'Source: dtbtech.org/tradies'
            ].join('\n');
        }

        function whatsappUrl() {
            return 'https://wa.me/61450275013?text=' + encodeURIComponent(buildMessage());
        }

        function emailUrl() {
            var subject = 'Free Website Check - ' + read('tradie-trade');
            return 'mailto:dtbbuildsoffice@gmail.com?subject=' +
                encodeURIComponent(subject) + '&body=' + encodeURIComponent(buildMessage());
        }

        // Status text is set as text nodes; the fallback link is built with the
        // DOM API so nothing from the form is ever placed into HTML.
        function setStatus(beforeText, linkUrl, linkText, afterText) {
            status.textContent = beforeText;
            if (linkUrl) {
                var link = document.createElement('a');
                link.href = linkUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.className = 'text-blue-200 underline rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400';
                link.textContent = linkText;
                status.appendChild(link);
                if (afterText) status.appendChild(document.createTextNode(afterText));
            }
        }

        async function copyText(text) {
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(text);
                    return true;
                } catch (_) { /* fall through to the legacy path */ }
            }
            try {
                var helper = document.createElement('textarea');
                helper.value = text;
                helper.setAttribute('readonly', '');
                helper.style.position = 'fixed';
                helper.style.opacity = '0';
                document.body.appendChild(helper);
                helper.select();
                var ok = document.execCommand('copy');
                document.body.removeChild(helper);
                return ok;
            } catch (_) {
                return false;
            }
        }

        document.getElementById('dtb-tradies-whatsapp').addEventListener('click', function () {
            if (!validate()) return;
            var url = whatsappUrl();
            window.open(url, '_blank', 'noopener,noreferrer');
            // With noopener, window.open() returns null even when the tab opens
            // successfully, so the result is never treated as a popup error.
            setStatus('WhatsApp should have opened with your website check ready to review and send. If the tab did not open, ', url, 'open WhatsApp directly', ' or use Copy Details and paste it into your chat.');
            dtbTrack('tradies_website_check_complete', { channel: 'whatsapp' });
        });

        document.getElementById('dtb-tradies-email').addEventListener('click', function () {
            if (!validate()) return;
            window.location.href = emailUrl();
            setStatus('Your email application should open with the draft ready to review and send. If nothing opened, use Copy Details and email it to dtbbuildsoffice@gmail.com.');
            dtbTrack('tradies_website_check_complete', { channel: 'email' });
        });

        document.getElementById('dtb-tradies-copy').addEventListener('click', async function () {
            if (!validate()) return;
            var copied = await copyText(buildMessage());
            if (copied) {
                setStatus('Details copied. Paste them into WhatsApp or an email and send them to DTB.');
            } else {
                setStatus('Copying is unavailable in this browser. Use the WhatsApp or email option instead.');
            }
        });
    }

    function init() {
        preserveUtmOnLinks();
        bindOfferPreselect();
        initWebsiteCheckForm();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
