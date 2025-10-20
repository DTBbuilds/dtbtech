/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",                 // Root HTML files
    "./auth/**/*.html",        // Auth HTML files
    "./components/**/*.html",  // Components HTML files (if any)
    "./dashboard/**/*.html",   // Dashboard HTML files
    "./services/**/*.html",   // Services HTML files
    "./tech-lab/**/*.html",  // Tech Lab HTML files (including subdirs like skills)
    "./js/**/*.js",           // Root JS files
    "./components/**/*.js"    // Components JS files
  ],
  theme: {
    extend: {},
  }
}