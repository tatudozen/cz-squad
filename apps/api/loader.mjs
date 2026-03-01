/**
 * ESM Loader for resolving @copyzen/* path aliases at runtime
 * Allows Node.js to resolve TypeScript path aliases without TypeScript compilation
 */

export async function resolve(specifier, context, nextResolve) {
  // Handle @copyzen/shared/* imports
  if (specifier.startsWith('@copyzen/shared/')) {
    // Map @copyzen/shared/repositories → @copyzen/shared/dist/repositories/index.js
    const modulePath = specifier.replace('@copyzen/shared/', '');

    // Check if it already ends with .js (explicit index import)
    let resolvedSpecifier;
    if (modulePath.endsWith('.js')) {
      // Already has .js extension, use as-is but replace with dist path
      resolvedSpecifier = specifier.replace('@copyzen/shared/', '@copyzen/shared/dist/');
    } else {
      // Add /index.js for directory imports
      resolvedSpecifier = `@copyzen/shared/dist/${modulePath}/index.js`;
    }

    return nextResolve(resolvedSpecifier, context);
  }

  // Handle @copyzen/shared import (main export)
  if (specifier === '@copyzen/shared') {
    return nextResolve('@copyzen/shared/dist/index.js', context);
  }

  // For all other imports, use default resolution
  return nextResolve(specifier, context);
}
