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

        function whatsappUrl() {
            const number = read('project-region') === 'Kenya' ? '254729983567' : '61450275013';
            return 'https://wa.me/' + number + '?text=' + encodeURIComponent(buildBrief());
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!isValid()) return;
            const opened = window.open(whatsappUrl(), '_blank', 'noopener,noreferrer');
            status.textContent = 'WhatsApp should open with your project brief. Please review it and press Send.';
            // Some browsers with strict popup settings may block the new tab.
            // Direct WhatsApp links remain available in the contact cards above.
            if (opened === null) {
                status.textContent = 'If WhatsApp did not open, use the WhatsApp contact option above or copy your brief.';
            }
        });

        emailButton.addEventListener('click', function () {
            if (!isValid()) return;
            const subject = 'DTB Project Enquiry - ' + read('project-service');
            const url = 'mailto:dtbbuildsoffice@gmail.com?subject=' +
                encodeURIComponent(subject) + '&body=' + encodeURIComponent(buildBrief());
            window.location.href = url;
            status.textContent = 'Your email application should open with a draft. Please review and send it.';
        });

        copyButton.addEventListener('click', async function () {
            if (!isValid()) return;
            try {
                await navigator.clipboard.writeText(buildBrief());
                status.textContent = 'Project brief copied. Paste it into WhatsApp or an email and send it to DTB.';
            } catch (_) {
                status.textContent = 'Clipboard access is unavailable. Use the WhatsApp or email option instead.';
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
