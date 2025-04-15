function promptNameAndRedirect() {
    // Create a modal overlay
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
    
    // Create the modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-700/30';
    modalContent.innerHTML = `
        <h2 class="text-2xl font-bold text-white mb-6">Welcome to Dashboard</h2>
        <div class="space-y-4">
            <div>
                <label for="userName" class="block text-sm font-medium text-gray-300 mb-2">Please enter your name</label>
                <input type="text" id="userName" class="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Your name" onkeypress="if(event.key === 'Enter') submitName()">
            </div>
            <button onclick="submitName()" class="w-full px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">
                Continue to Dashboard
            </button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Focus the input field
    setTimeout(() => {
        const input = document.getElementById('userName');
        if (input) input.focus();
    }, 100);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function submitName() {
    const nameInput = document.getElementById('userName');
    const name = nameInput.value.trim();
    
    if (name) {
        // Store the name in sessionStorage
        sessionStorage.setItem('userName', name);
        // Redirect to welcome page with correct path
        window.location.href = '/dashboard/welcome.html';
    } else {
        // Highlight the input if empty
        nameInput.classList.add('ring-2', 'ring-red-500');
        nameInput.addEventListener('input', () => {
            nameInput.classList.remove('ring-2', 'ring-red-500');
        }, { once: true });
    }
}
