import { copyFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, '..');

// Create lib directory if it doesn't exist
mkdirSync(join(packageRoot, 'lib', 'grammar'), { recursive: true });

// Copy grammar file to lib directory for runtime access
copyFileSync(
  join(packageRoot, 'src', 'grammar', 'thunderstruck.langium'),
  join(packageRoot, 'lib', 'grammar', 'thunderstruck.langium')
);

console.log('Grammar file copied to lib/grammar');
