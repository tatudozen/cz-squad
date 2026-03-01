/**
 * ESM Loader for resolving @copyzen/* path aliases at runtime
 * Maps @copyzen/shared/* to the compiled dist folder at node_modules/@copyzen/shared/dist/*
 */
import { pathToFileURL } from 'node:url';
import { resolve as resolvePath } from 'node:path';

export async function resolve(specifier, context, nextResolve) {
  // Skip file:// URLs and already-resolved paths
  if (specifier.startsWith('file://') || specifier.includes('/dist/')) {
    return nextResolve(specifier, context);
  }

  // Handle @copyzen/shared/* imports
  if (specifier.startsWith('@copyzen/shared/')) {
    const modulePath = specifier.replace('@copyzen/shared/', '');

    // Resolve to node_modules location with /index.js for directory imports
    const nodeModulesPath = resolvePath(process.cwd(), 'node_modules', '@copyzen', 'shared', 'dist', modulePath);
    const fullPath = modulePath.endsWith('.js') ? nodeModulesPath : `${nodeModulesPath}/index.js`;
    const fileUrl = pathToFileURL(fullPath).href;

    return { url: fileUrl, shortCircuit: true };
  }

  // Handle @copyzen/shared import (main export)
  if (specifier === '@copyzen/shared') {
    const mainPath = resolvePath(process.cwd(), 'node_modules', '@copyzen', 'shared', 'dist', 'index.js');
    return { url: pathToFileURL(mainPath).href, shortCircuit: true };
  }

  // For all other imports, use default resolution
  return nextResolve(specifier, context);
}
