// Check if user is logged in
// function checkAuth() {
//   const userName = sessionStorage.getItem('userName');
//   if (!userName) {
//     window.location.href = '../index.html';
//     return false;
//   }
//   return userName;
// }

// Handle logout
// function logout() {
//   sessionStorage.removeItem('userName');
//   window.location.href = '../index.html';
// }

// Display welcome message and check authentication
// function displayWelcome() {
//   const userName = checkAuth();
//   if (!userName) return;

//   // Get the welcome message element
//   const welcomeMessage = document.getElementById('welcomeMessage');
//   if (!welcomeMessage) return;

//   // Create the message with typing animation
//   const message = `Hey ${userName}, great to see you!`;
//   let charIndex = 0;

//   // Remove opacity-0 class to start fade in
//   welcomeMessage.classList.remove('opacity-0');

//   // Type out the message
//   const typeMessage = setInterval(() => {
//     welcomeMessage.textContent = message.slice(0, charIndex) + '|';
//     charIndex++;

//     if (charIndex > message.length) {
//       clearInterval(typeMessage);
//       welcomeMessage.textContent = message;
//       // Add a subtle pulse to the final message
//       welcomeMessage.classList.add('animate-pulse-subtle');
//     }
//   }, 100);
// }
