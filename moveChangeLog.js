const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

const changeLogStart = '            {/* Project Change Log Section */}';
const changeLogEnd = '            {/* Earned Value Management Section - Lump Sum Only */}';
const targetStart = '            {/* Task Breakdown & Forecast Distribution */}';

let startIdx = content.indexOf(changeLogStart);
let endIdx = content.indexOf(changeLogEnd);
let targetIdx = content.indexOf(targetStart);

if (startIdx !== -1 && endIdx !== -1 && targetIdx !== -1) {
    const changeLogBlock = content.substring(startIdx, endIdx);
    
    // remove the old one
    content = content.substring(0, startIdx) + content.substring(endIdx);
    
    // re-find target since offset changed
    targetIdx = content.indexOf(targetStart);
    
    // insert it
    content = content.substring(0, targetIdx) + changeLogBlock + '\n' + content.substring(targetIdx);
    
    fs.writeFileSync('src/App.jsx', content);
    console.log("Moved successfully.");
} else {
    console.log("Could not find blocks.");
}
