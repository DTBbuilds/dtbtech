/* Guided project brief for the static DTB website.
   No automatic submission, analytics, local storage or third-party form service. */
(function () {
    'use strict';

    function initProjectBrief() {
        const form = document.getElementById('dtb-project-brief-form');
        if (!form) return;

        const status = document.getElementById('dtb-brief-status');
        const byId = (id) => document.getElementById(id);
        const read = (id) => byId(id).value.trim();
        const emailButton = byId('dtb-brief-email');
        const copyButton = byId('dtb-brief-copy');

        function buildBrief() {
            return [
                'Hello DTB Technologies, I would like to discuss a project.',
                '',
                'Service: ' + read('project-service'),
                'Location: ' + read('project-region'),
                'Business: ' + (read('project-business') || 'Not specified'),
                'Timeline: ' + read('project-timeline'),
                'Budget: ' + (read('project-budget') || 'To discuss'),
                '',
                'Project details:',
                read('project-goal'),
                '',
                'Source: dtbtech.org/contact'
            ].join('\n');
        }

        function isValid() {
            if (!form.reportValidity()) {
                status.textContent = 'Please choose a service and describe your project.';
                return false;
            }
            status.textContent = '';
            return true;
        }

        // Status text is set as text nodes; the optional fallback link is built
        // with the DOM API so nothing from the form is ever placed into HTML.
        function setStatus(beforeText, linkUrl, linkText, afterText) {
            status.textContent = beforeText;
            if (linkUrl) {
                const link = document.createElement('a');
                link.href = linkUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.className = 'text-blue-200 underline rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400';
                link.textContent = linkText;
                status.appendChild(link);
                if (afterText) status.appendChild(document.createTextNode(afterText));
            }
        }

        function whatsappUrl() {
            const number = read('project-region') === 'Kenya' ? '254729983567' : '61450275013';
            return 'https://wa.me/' + number + '?text=' + encodeURIComponent(buildBrief());
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!isValid()) return;
            const url = whatsappUrl();
            window.open(url, '_blank', 'noopener,noreferrer');
            // With noopener, window.open() returns null even when the tab opens
            // successfully, so the result is never treated as a popup error.
            // The inline link covers strict popup settings either way.
            setStatus('WhatsApp should have opened with your brief ready to review and send. If the tab did not open, ', url, 'open WhatsApp directly', ' or use Copy Brief and paste it into your chat.');
        });

        emailButton.addEventListener('click', function () {
            if (!isValid()) return;
            const subject = 'DTB Project Enquiry - ' + read('project-service');
            const url = 'mailto:dtbbuildsoffice@gmail.com?subject=' +
                encodeURIComponent(subject) + '&body=' + encodeURIComponent(buildBrief());
            window.location.href = url;
            setStatus('Your email application should open with the draft ready to review and send. If nothing opened, use Copy Brief and email it to dtbbuildsoffice@gmail.com.');
        });

        async function copyBriefText(text) {
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(text);
                    return true;
                } catch (_) { /* fall through to the legacy path */ }
            }
            try {
                const helper = document.createElement('textarea');
                helper.value = text;
                helper.setAttribute('readonly', '');
                helper.style.position = 'fixed';
                helper.style.opacity = '0';
                document.body.appendChild(helper);
                helper.select();
                const ok = document.execCommand('copy');
                document.body.removeChild(helper);
                return ok;
            } catch (_) {
                return false;
            }
        }

        copyButton.addEventListener('click', async function () {
            if (!isValid()) return;
            const copied = await copyBriefText(buildBrief());
            if (copied) {
                setStatus('Project brief copied. Paste it into WhatsApp or an email and send it to DTB.');
            } else {
                setStatus('Copying is unavailable in this browser. Use the WhatsApp or email option instead.');
            }
        });

        // Allow campaign and service pages to preselect a known service without trusting
        // arbitrary URL values or placing them into the page as HTML.
        const requested = new URLSearchParams(window.location.search).get('service');
        const serviceSelect = byId('project-service');
        if (requested && Array.from(serviceSelect.options).some((option) => option.value === requested)) {
            serviceSelect.value = requested;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProjectBrief, { once: true });
    } else {
        initProjectBrief();
    }
})();
