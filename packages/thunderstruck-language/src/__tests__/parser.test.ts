import { EmptyFileSystem } from 'langium';
import { parseDocument } from 'langium/test';
import { createThunderstruckServices } from '../thunderstruck-module.js';

const services = createThunderstruckServices({ ...EmptyFileSystem }).thunderstruck;

describe('Thunderstruck Parser Tests', () => {
  describe('Cube Definitions', () => {
    it('should parse a simple cube definition', async () => {
      const text = `
        cube ADADAS {
          namespace: "http://example.org/study/xyz#",
          structure: {
            dimensions: [
              USUBJID: Identifier
            ],
            measures: [
              AVAL: Numeric
            ]
          }
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
      expect(document.parseResult.value).toBeDefined();
    });

    it('should parse cube with multiple dimensions and measures', async () => {
      const text = `
        cube ADAE {
          namespace: "http://example.org/study#",
          structure: {
            dimensions: [
              USUBJID: Identifier,
              AEDECOD: Text,
              AERELN: CodedValue
            ],
            measures: [
              AESTDY: Integer,
              AEENDY: Integer
            ],
            attributes: [
              AESER: Flag,
              AESEV: CodedValue
            ]
          }
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });

    it('should parse cube with units', async () => {
      const text = `
        cube ADVS {
          namespace: "http://example.org/study#",
          structure: {
            dimensions: [
              USUBJID: Identifier,
              PARAMCD: CodedValue
            ],
            measures: [
              AVAL: Numeric unit: "mmHg",
              CHG: Numeric unit: "mmHg"
            ]
          }
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });

    it('should parse cube with description', async () => {
      const text = `
        cube ADADAS "Analysis dataset for ADAS-Cog scores" {
          namespace: "http://example.org/study/xyz#",
          structure: {
            dimensions: [
              USUBJID: Identifier
            ],
            measures: [
              ACTOT11: Numeric
            ]
          }
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });
  });

  describe('Import Statements', () => {
    it('should parse import statement', async () => {
      const text = `
        import CDISC.ADaM.ADSL;

        cube MyCube {
          namespace: "http://example.org#",
          structure: {
            dimensions: [
              USUBJID: Identifier
            ]
          }
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });

    it('should parse import with alias', async () => {
      const text = `
        import CDISC.ADaM.ADSL as BaseDataset;
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });
  });

  describe('Comments', () => {
    it('should handle single-line comments', async () => {
      const text = `
        // This is a comment
        cube Test {
          namespace: "http://example.org#",
          structure: {
            dimensions: [
              // Another comment
              ID: Identifier
            ]
          }
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });

    it('should handle multi-line comments', async () => {
      const text = `
        /*
         * This is a multi-line comment
         * describing the cube
         */
        cube Test {
          namespace: "http://example.org#",
          structure: {
            dimensions: [
              ID: Identifier
            ]
          }
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });
  });

  describe('Type System', () => {
    it('should parse all primitive types', async () => {
      const text = `
        cube TypeTest {
          namespace: "http://example.org#",
          structure: {
            dimensions: [
              D1: Numeric,
              D2: Integer,
              D3: Text,
              D4: DateTime,
              D5: Date,
              D6: Flag,
              D7: Identifier
            ]
          }
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });

    it('should parse CodedValue type', async () => {
      const text = `
        cube CodedTest {
          namespace: "http://example.org#",
          structure: {
            dimensions: [
              SEX: CodedValue,
              RACE: CodedValue<CDISC.CT.RACE>
            ]
          }
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });
  });
});
