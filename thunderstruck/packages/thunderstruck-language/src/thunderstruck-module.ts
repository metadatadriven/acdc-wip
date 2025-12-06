import type { Module } from 'langium';
import { inject } from 'langium';
import {
  createDefaultModule,
  createDefaultSharedModule,
  type DefaultSharedModuleContext,
  type LangiumServices,
  type LangiumSharedServices,
  type PartialLangiumServices,
} from 'langium/lsp';
import {
  ThunderstruckGeneratedModule,
  ThunderstruckGeneratedSharedModule,
} from './generated/module.js';
import { registerValidationChecks } from './thunderstruck-validator.js';
import { ThunderstruckHoverProvider } from './lsp/thunderstruck-hover-provider.js';

/**
 * Declaration of custom services for Thunderstruck
 */
export type ThunderstruckAddedServices = {
  // Add custom services here in future increments
  // Note: Langium provides default LSP services out of the box:
  // - Code completion
  // - Go-to-definition
  // - Find references
  // - Document symbols
  // - Hover information
  // - Diagnostics (via validation)
};

/**
 * Union of Langium default services and Thunderstruck custom services
 */
export type ThunderstruckServices = LangiumServices & ThunderstruckAddedServices;

/**
 * Dependency injection module that creates an instance of the Thunderstruck language services
 */
export const ThunderstruckModule: Module<
  ThunderstruckServices,
  PartialLangiumServices & ThunderstruckAddedServices
> = {
  lsp: {
    HoverProvider: (services) => new ThunderstruckHoverProvider(),
  },
};

/**
 * Create the full set of services required by Langium
 * @param context Module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createThunderstruckServices(context: DefaultSharedModuleContext): {
  shared: LangiumSharedServices;
  thunderstruck: ThunderstruckServices;
} {
  const shared = inject(
    createDefaultSharedModule(context),
    ThunderstruckGeneratedSharedModule
  );
  const thunderstruck = inject(
    createDefaultModule({ shared }),
    ThunderstruckGeneratedModule,
    ThunderstruckModule
  );
  shared.ServiceRegistry.register(thunderstruck);

  // Register validation checks
  registerValidationChecks(thunderstruck);

  return { shared, thunderstruck };
}
