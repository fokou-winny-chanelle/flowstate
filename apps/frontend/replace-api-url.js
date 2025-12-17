// Script to replace API URL in environment.prod.ts before build
const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, 'src/environments/environment.prod.ts');
const apiUrl = process.env.API_URL || 'https://flowstate-backend-fptr.onrender.com/api';

console.log(`[Build] Replacing API URL with: ${apiUrl}`);

try {
  let content = fs.readFileSync(envFile, 'utf8');
  
  // Replace the apiUrl line
  content = content.replace(
    /apiUrl:\s*['"][^'"]*['"]/,
    `apiUrl: '${apiUrl}'`
  );
  
  fs.writeFileSync(envFile, content, 'utf8');
  console.log(`[Build] Successfully updated ${envFile}`);
  
  // Verify the replacement
  const updatedContent = fs.readFileSync(envFile, 'utf8');
  const match = updatedContent.match(/apiUrl:\s*['"]([^'"]*)['"]/);
  if (match) {
    console.log(`[Build] Verified API URL in file: ${match[1]}`);
  }
} catch (error) {
  console.error(`[Build] Error updating environment file:`, error);
  process.exit(1);
}

