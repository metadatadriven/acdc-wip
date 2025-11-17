import { EmptyFileSystem } from 'langium';
import { parseDocument } from 'langium/test';
import { createThunderstruckServices } from '../thunderstruck-module';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const services = createThunderstruckServices({ ...EmptyFileSystem }).thunderstruck;

describe('Example Files Parsing', () => {
  const examplesDir = resolve(__dirname, '../../../../examples');
  const exampleFiles = glob.sync(`${examplesDir}/*.tsk`);

  if (exampleFiles.length === 0) {
    it('should find example files', () => {
      throw new Error(`No example files found in ${examplesDir}`);
    });
  }

  exampleFiles.forEach(filePath => {
    const fileName = filePath.split('/').pop() || filePath;

    it(`should parse ${fileName} without errors`, async () => {
      const content = readFileSync(filePath, 'utf-8');
      const document = await parseDocument(services, content);

      expect(document.parseResult.lexerErrors).toHaveLength(0);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });
  });
});
