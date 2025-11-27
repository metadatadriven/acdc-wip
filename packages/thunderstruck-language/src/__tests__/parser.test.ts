import { EmptyFileSystem } from 'langium';
import { parseDocument } from 'langium/test';
import { createThunderstruckServices } from '../thunderstruck-module';

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

  describe('Expression Language', () => {
    it('should parse arithmetic expressions', async () => {
      const text = `
        derive Test {
          input: ADADAS,
          output: Result,
          derivations: [
            CHG = AVAL - BASE,
            PCHG = (AVAL - BASE) / BASE * 100
          ]
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });

    it('should parse comparison expressions', async () => {
      const text = `
        derive Test {
          input: ADADAS,
          output: Result,
          derivations: [
            FLAG1 = AVAL > BASE,
            FLAG2 = CHG >= 10,
            FLAG3 = PARAM == "ACTOT11"
          ]
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });

    it('should parse logical expressions', async () => {
      const text = `
        derive Test {
          input: ADADAS,
          output: Result,
          derivations: [
            FLAG = EFFFL == "Y" and ITTFL == "Y",
            COND = CHG > 0 or BASE < 50
          ]
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });

    it('should parse function calls', async () => {
      const text = `
        derive Test {
          input: ADADAS,
          output: Result,
          derivations: [
            LOGVAL = log(AVAL),
            SQRTVAL = sqrt(BASE)
          ]
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });
  });

  describe('Concept Definitions', () => {
    it('should parse basic concept definition', async () => {
      const text = `
        concept SystolicBP "Systolic Blood Pressure" type_of BiomedicalConcept {
          category: VitalSign,
          definition: "Maximum blood pressure during contraction of the ventricles",
          unit: "mmHg"
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });

    it('should parse concept with code list mappings', async () => {
      const text = `
        concept SystolicBP is_a BiomedicalConcept {
          codeLists: [
            CDISC.CT.VSTESTCD: "SYSBP",
            LOINC: "8480-6",
            SNOMED: "271649006"
          ]
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });
  });

  describe('Slice Definitions', () => {
    it('should parse slice with fixed and varying dimensions', async () => {
      const text = `
        cube ADADAS {
          namespace: "http://example.org#",
          structure: {
            dimensions: [USUBJID: Identifier, AVISIT: Text, TRT01A: CodedValue],
            measures: [CHG: Numeric, AVAL: Numeric]
          }
        }

        slice Week24Efficacy from ADADAS {
          fix: {
            AVISIT: "Week 24",
            EFFFL: "Y"
          },
          vary: [USUBJID, TRT01A],
          measures: [CHG]
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });

    it('should parse slice with where clause', async () => {
      const text = `
        cube ADADAS {
          namespace: "http://example.org#",
          structure: {
            dimensions: [USUBJID: Identifier],
            measures: [CHG: Numeric]
          }
        }

        slice Efficacy from ADADAS {
          vary: [USUBJID],
          where: CHG > 0 and EFFFL == "Y"
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });
  });

  describe('Derive Definitions', () => {
    it('should parse derive with derivations', async () => {
      const text = `
        cube Input {
          namespace: "http://example.org#",
          structure: {
            dimensions: [ID: Identifier],
            measures: [VAL: Numeric, BASE: Numeric]
          }
        }

        cube Output {
          namespace: "http://example.org#",
          structure: {
            dimensions: [ID: Identifier],
            measures: [CHG: Numeric]
          }
        }

        derive ChangeFromBaseline {
          input: Input,
          output: Output,
          derivations: [
            CHG = VAL - BASE
          ]
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });
  });

  describe('Model Definitions', () => {
    it('should parse model with Wilkinson formula', async () => {
      const text = `
        cube ADADAS {
          namespace: "http://example.org#",
          structure: {
            dimensions: [USUBJID: Identifier],
            measures: [CHG: Numeric]
          }
        }

        slice Week24 from ADADAS {
          vary: [USUBJID]
        }

        model DoseResponse {
          input: Week24,
          formula: CHG ~ TRTDOSE + SITEGR1 + BASE,
          family: Gaussian,
          link: Identity
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });

    it('should parse model with interaction terms', async () => {
      const text = `
        cube Test {
          namespace: "http://example.org#",
          structure: {
            dimensions: [ID: Identifier],
            measures: [Y: Numeric]
          }
        }

        slice TestSlice from Test {
          vary: [ID]
        }

        model Interaction {
          input: TestSlice,
          formula: Y ~ TRT * AVISIT + BASE
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });

    it('should parse model with random effects', async () => {
      const text = `
        cube Test {
          namespace: "http://example.org#",
          structure: {
            dimensions: [ID: Identifier],
            measures: [Y: Numeric]
          }
        }

        slice TestSlice from Test {
          vary: [ID]
        }

        model MMRM {
          input: TestSlice,
          formula: CHG ~ TRT * AVISIT + BASE,
          random: {
            subject: USUBJID,
            structure: Unstructured(AVISIT)
          }
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });
  });

  describe('Aggregate Definitions', () => {
    it('should parse aggregate with statistics', async () => {
      const text = `
        cube Test {
          namespace: "http://example.org#",
          structure: {
            dimensions: [TRT: CodedValue, VISIT: Text],
            measures: [CHG: Numeric]
          }
        }

        slice TestSlice from Test {
          vary: [TRT, VISIT]
        }

        aggregate Summary {
          input: TestSlice,
          groupBy: [TRT, VISIT],
          statistics: [
            N = count(CHG),
            MEAN = mean(CHG),
            SD = stddev(CHG)
          ]
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });
  });

  describe('Display Definitions', () => {
    it('should parse table display', async () => {
      const text = `
        cube Results {
          namespace: "http://example.org#",
          structure: {
            dimensions: [Parameter: Text],
            measures: [Estimate: Numeric, PValue: Numeric]
          }
        }

        display table "Table 14.3.01" "Efficacy Results" {
          source: Results,
          rows: [Parameter],
          columns: [Estimate, PValue],
          footnotes: ["Population: ITT", "Model: ANCOVA"]
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });

    it('should parse figure display', async () => {
      const text = `
        cube Data {
          namespace: "http://example.org#",
          structure: {
            dimensions: [TIME: Numeric, TRT: CodedValue],
            measures: [MEAN: Numeric]
          }
        }

        display figure "Figure 1" {
          source: Data,
          xAxis: TIME,
          yAxis: MEAN,
          groupBy: TRT
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });
  });

  describe('Complex Wilkinson Formulas', () => {
    it('should parse formula with nesting', async () => {
      const text = `
        cube Test {
          namespace: "http://example.org#",
          structure: {
            dimensions: [ID: Identifier],
            measures: [Y: Numeric]
          }
        }

        slice TestSlice from Test {
          vary: [ID]
        }

        model Nested {
          input: TestSlice,
          formula: Y ~ TRT / SITE
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });

    it('should parse formula with power', async () => {
      const text = `
        cube Test {
          namespace: "http://example.org#",
          structure: {
            dimensions: [ID: Identifier],
            measures: [Y: Numeric]
          }
        }

        slice TestSlice from Test {
          vary: [ID]
        }

        model Power {
          input: TestSlice,
          formula: Y ~ (A + B + C)^2
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });

    it('should parse formula with functions', async () => {
      const text = `
        cube Test {
          namespace: "http://example.org#",
          structure: {
            dimensions: [ID: Identifier],
            measures: [Y: Numeric]
          }
        }

        slice TestSlice from Test {
          vary: [ID]
        }

        model WithFunctions {
          input: TestSlice,
          formula: log(Y) ~ poly(DOSE, 2) + ns(TIME, 3)
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });

    it('should parse formula without intercept', async () => {
      const text = `
        cube Test {
          namespace: "http://example.org#",
          structure: {
            dimensions: [ID: Identifier],
            measures: [Y: Numeric]
          }
        }

        slice TestSlice from Test {
          vary: [ID]
        }

        model NoIntercept {
          input: TestSlice,
          formula: Y ~ 0 + TRT
        }
      `;

      const document = await parseDocument(services, text);
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });
  });
});
