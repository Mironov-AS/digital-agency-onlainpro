const { spawn } = require('child_process');
const child = spawn('/bin/sh', ['/start.sh'], { stdio: 'inherit', env: process.env });
child.on('exit', (code) => process.exit(code || 0));
['SIGTERM', 'SIGINT'].forEach((s) => process.on(s, () => child.kill(s)));
