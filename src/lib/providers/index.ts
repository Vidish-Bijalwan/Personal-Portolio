// 'server-only' semantics: barrel for server-side provider adapters.
// Never import this barrel from client-side code.

export { FalProvider } from './fal';
export { MetaProvider } from './meta';
export { MockProvider } from './mock';
export { GenerationService, getGenerationService } from './registry';
