const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

const changeLogStartStr = '            {/* Project Change Log Section */}';
const changeLogEndStr = '            {/* Earned Value Management Section - Lump Sum Only */}';
const targetStartStr = '            {/* Task Breakdown & Forecast Distribution */}';

let startIdx = content.indexOf(changeLogStartStr);
let endIdx = content.indexOf(changeLogEndStr);

if (startIdx !== -1 && endIdx !== -1) {
    const changeLogBlock = content.substring(startIdx, endIdx);

    // remove the old one
    content = content.substring(0, startIdx) + content.substring(endIdx);

    // re-find target since offset changed
    let targetIdx = content.indexOf(targetStartStr);

    if (targetIdx !== -1) {
        // insert it
        content = content.substring(0, targetIdx) + changeLogBlock + content.substring(targetIdx);
        fs.writeFileSync('src/App.jsx', content);
        console.log("Moved successfully.");
    } else {
        console.log("Target not found!");
    }
} else {
    console.log("Change log blocks not found!");
}
