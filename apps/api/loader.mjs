/**
 * ESM Loader for resolving @copyzen/* path aliases at runtime
 * Allows Node.js to resolve TypeScript path aliases without TypeScript compilation
 */

export async function resolve(specifier, context, nextResolve) {
  // Handle @copyzen/shared/* imports
  if (specifier.startsWith('@copyzen/shared/')) {
    // Map @copyzen/shared/repositories → ./node_modules/@copyzen/shared/dist/repositories
    const modulePath = specifier.replace('@copyzen/shared/', '');
    const resolvedSpecifier = `file://${process.cwd()}/node_modules/@copyzen/shared/dist/${modulePath}/index.js`;

    return nextResolve(resolvedSpecifier, context);
  }

  // Handle @copyzen/shared import (main export)
  if (specifier === '@copyzen/shared') {
    const resolvedSpecifier = `file://${process.cwd()}/node_modules/@copyzen/shared/dist/index.js`;
    return nextResolve(resolvedSpecifier, context);
  }

  // For all other imports, use default resolution
  return nextResolve(specifier, context);
}
