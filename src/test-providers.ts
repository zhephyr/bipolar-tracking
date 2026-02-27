/**
 * Global test providers for the Angular Vitest test suite.
 * These providers are automatically injected into every test.
 */
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

// Use 'as any' to satisfy the Provider[] type since EnvironmentProviders
// works at runtime but doesn't assignable to Provider at compile time
const testProviders = [
    provideHttpClient(),
    provideHttpClientTesting()
];

export default testProviders;
