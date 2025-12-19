const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Use localhost instead of LAN IP to avoid firewall issues
// This works with USB connection or ADB reverse tunneling
const apiUrl = 'http://localhost:5000';
const envPath = path.join(__dirname, '..', '.env');

console.log('[Dev Start] Using localhost for API connection');
console.log('[Dev Start] Make sure you have:');
console.log('  - Android: Run "adb reverse tcp:5000 tcp:5000" before starting the app');
console.log('  - iOS: USB connection automatically tunnels localhost');
console.log(`[Dev Start] Updating .env with EXPO_PUBLIC_API_URL=${apiUrl}`);

// Update or create .env
let envContent = '';
if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
}

// Replace or append EXPO_PUBLIC_API_URL
if (envContent.includes('EXPO_PUBLIC_API_URL=')) {
    envContent = envContent.replace(/EXPO_PUBLIC_API_URL=.*\n?/, `EXPO_PUBLIC_API_URL=${apiUrl}\n`);
} else {
    envContent += `\nEXPO_PUBLIC_API_URL=${apiUrl}\n`;
}

fs.writeFileSync(envPath, envContent.trim() + '\n');

// Run expo start
console.log('[Dev Start] Starting Expo...');
const args = process.argv.slice(2);
const expo = spawn('npx', ['expo', 'start', ...args], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..')
});

expo.on('close', (code) => {
    process.exit(code);
});
