/**
 * Script to fix CDN dependencies across all HTML files
 * Replaces Tailwind CDN and Font Awesome CDN with local optimized assets
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all HTML files
const htmlFiles = glob.sync('**/*.html', {
  ignore: ['node_modules/**', 'dist/**']
});

console.log(`Found ${htmlFiles.length} HTML files to update`);

const replacements = [
  {
    search: '<script src="https://cdn.tailwindcss.com"></script>',
    replace: '<link rel="stylesheet" href="./dist/output.css">'
  },
  {
    search: '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">',
    replace: '<link rel="stylesheet" href="./assets/icons/fontawesome-subset.css">'
  }
];

// Additional CSS files to add after Tailwind
const additionalCSS = [
  '<link rel="stylesheet" href="./src/css/mobile-optimized.css">',
  '<link rel="stylesheet" href="./css/common.css">',
  '<link rel="stylesheet" href="./css/animations.css">'
];

let updatedFiles = 0;

htmlFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Apply replacements
    replacements.forEach(({ search, replace }) => {
      if (content.includes(search)) {
        content = content.replace(search, replace);
        modified = true;
      }
    });
    
    // Add additional CSS files if Tailwind was replaced
    if (modified && content.includes('./dist/output.css')) {
      const tailwindLine = '<link rel="stylesheet" href="./dist/output.css">';
      const insertAfter = tailwindLine + '\n    ' + additionalCSS.join('\n    ');
      content = content.replace(tailwindLine, insertAfter);
    }
    
    // Add main.js if not present
    if (modified && !content.includes('./src/js/main.js')) {
      const headEnd = '</head>';
      const mainScript = '    <script type="module" src="./src/js/main.js"></script>\n</head>';
      content = content.replace(headEnd, mainScript);
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      updatedFiles++;
      console.log(`✅ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Successfully updated ${updatedFiles} HTML files`);
console.log('All CDN dependencies have been replaced with local optimized assets!');
