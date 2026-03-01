/**
 * ESM Loader for resolving @copyzen/* path aliases at runtime
 * Maps @copyzen/shared/* to the compiled dist folder at node_modules/@copyzen/shared/dist/*
 */
import { pathToFileURL } from 'node:url';
import { resolve as resolvePath } from 'node:path';
import { existsSync } from 'node:fs';

export async function resolve(specifier, context, nextResolve) {
  // Skip file:// URLs and already-resolved paths
  if (specifier.startsWith('file://') || specifier.includes('/dist/')) {
    return nextResolve(specifier, context);
  }

  // Handle @copyzen/shared/* imports
  if (specifier.startsWith('@copyzen/shared/')) {
    const modulePath = specifier.replace('@copyzen/shared/', '');

    // Determine the full path - try .js file first, then /index.js
    const basePath = resolvePath(process.cwd(), 'node_modules', '@copyzen', 'shared', 'dist', modulePath);

    let fullPath;
    if (modulePath.endsWith('.js')) {
      // Already has .js extension
      fullPath = basePath;
    } else if (existsSync(`${basePath}.js`)) {
      // Try as .js file directly (e.g., services/brand-profile-service.js)
      fullPath = `${basePath}.js`;
    } else {
      // Otherwise treat as directory with index.js (e.g., repositories/index.js)
      fullPath = `${basePath}/index.js`;
    }

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
