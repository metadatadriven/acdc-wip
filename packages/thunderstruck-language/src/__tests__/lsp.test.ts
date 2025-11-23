import { EmptyFileSystem } from 'langium';
import { createThunderstruckServices } from '../thunderstruck-module';

describe('Language Server Protocol', () => {
  it('should create Thunderstruck services without errors', () => {
    const services = createThunderstruckServices({ ...EmptyFileSystem });

    expect(services.shared).toBeDefined();
    expect(services.thunderstruck).toBeDefined();
  });

  it('should have validation registry configured', () => {
    const services = createThunderstruckServices({ ...EmptyFileSystem });

    expect(services.thunderstruck.validation).toBeDefined();
    expect(services.thunderstruck.validation.ValidationRegistry).toBeDefined();
  });

  it('should have document builder configured', () => {
    const services = createThunderstruckServices({ ...EmptyFileSystem });

    expect(services.shared.workspace.DocumentBuilder).toBeDefined();
  });

  it('should have language server capabilities', () => {
    const services = createThunderstruckServices({ ...EmptyFileSystem });

    // Check that essential LSP services are present
    expect(services.thunderstruck.lsp).toBeDefined();
    expect(services.thunderstruck.parser).toBeDefined();
    expect(services.thunderstruck.references).toBeDefined();
  });
});
