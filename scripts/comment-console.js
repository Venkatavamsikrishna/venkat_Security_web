const fs = require('fs');
const path = require('path');

// Directories to process
const directories = [
  '../src/components',
  '../src/services',
  '../src/utils',
  '../src'
];

function commentConsoleInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Replace console.log
    const logRegex = /(\s*)(console\.log\()/g;
    if (content.match(logRegex)) {
      content = content.replace(logRegex, '$1//$2');
      modified = true;
    }
    
    // Replace console.error
    const errorRegex = /(\s*)(console\.error\()/g;
    if (content.match(errorRegex)) {
      content = content.replace(errorRegex, '$1//$2');
      modified = true;
    }
    
    // Replace console.warn
    const warnRegex = /(\s*)(console\.warn\()/g;
    if (content.match(warnRegex)) {
      content = content.replace(warnRegex, '$1//$2');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✅ Commented console in:', path.basename(filePath));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error processing file:', filePath, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  try {
    const fullPath = path.join(__dirname, dirPath);
    
    if (!fs.existsSync(fullPath)) {
      return 0;
    }
    
    const files = fs.readdirSync(fullPath);
    let count = 0;
    
    files.forEach(file => {
      const filePath = path.join(fullPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile() && file.endsWith('.js')) {
        if (commentConsoleInFile(filePath)) {
          count++;
        }
      }
    });
    
    return count;
  } catch (error) {
    console.error('Error processing directory:', dirPath, error.message);
    return 0;
  }
}

console.log('🔧 Commenting out all console statements in React client...\n');

let totalFiles = 0;

// Process directories
directories.forEach(dir => {
  const count = processDirectory(dir);
  if (count > 0) {
    totalFiles += count;
  }
});

console.log(`\n✅ Done! Commented console statements in ${totalFiles} files`);

