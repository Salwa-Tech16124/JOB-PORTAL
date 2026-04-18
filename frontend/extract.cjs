const fs = require('fs');
const path = require('path');
const logPath = 'C:\\Users\\salwa\\.gemini\\antigravity\\brain\\a889f81a-7167-4f92-901b-d18f15327f31\\.system_generated\\logs\\overview.txt';
const content = fs.readFileSync(logPath, 'utf-8');

const lastReqIndex = content.lastIndexOf('<USER_REQUEST>');
const text = content.substring(lastReqIndex);

const fileNames = [
  'ai-profile-section.tsx',
  'career-coach-section.tsx',
  'dashboard-section.tsx',
  'hero-section.tsx',
  'interview-stimulator-section.tsx',
  'job-board-section.tsx',
  'sidebar.tsx',
  'theme-provider.tsx',
  'top-navbar.tsx'
];

let currentIndex = 0;
for (let i = 0; i < fileNames.length; i++) {
  const fileName = fileNames[i];
  // Match filename bounded by newlines to ensure we don't pick up string mentions
  const filePos = text.indexOf('\n' + fileName + '\n', currentIndex) !== -1 ? text.indexOf('\n' + fileName + '\n', currentIndex) : text.indexOf('\n' + fileName + '\r\n', currentIndex);
  
  let actualPos = filePos;
  if (filePos === -1) {
     // fallback
     actualPos = text.indexOf(fileName, currentIndex);
  }

  if (actualPos === -1) {
    console.log('Missing ' + fileName);
    continue;
  }
  
  const contentStart = actualPos + fileName.length + 1; // +1 for newline
  
  let contentEnd;
  const nextFile = fileNames[i+1];
  if (nextFile) {
     contentEnd = text.indexOf('\n' + nextFile + '\n', contentStart);
     if (contentEnd === -1) contentEnd = text.indexOf('\n' + nextFile + '\r\n', contentStart);
     if (contentEnd === -1) contentEnd = text.indexOf(nextFile, contentStart);
  } else {
     contentEnd = text.indexOf('</USER_REQUEST>', contentStart);
  }
  
  if (contentEnd === -1) {
    console.log('Could not find end for ' + fileName);
    continue;
  }

  let fileContent = text.substring(contentStart, contentEnd).trim();
  
  // Quick fix: user spelled interview-stimulator, output to interview-simulator
  let saveName = fileName;
  if(saveName === 'interview-stimulator-section.tsx') saveName = 'interview-simulator-section.tsx';
  
  fs.writeFileSync(path.join('s:/MyProject/frontend/src/components', saveName), fileContent);
  console.log('Wrote ' + saveName);
  currentIndex = contentEnd;
}
