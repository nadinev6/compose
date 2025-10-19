# Tambo AI Setup Instructions

## Important Note

The `@tambo-ai/react` package referenced in the design document is not available in the public npm registry.

## Action Required

Before proceeding with Task 10 (Create Tambo Message Thread wrapper component), you will need to:

1. Verify the correct package name for Tambo AI React SDK
2. Check if Tambo AI requires a private npm registry or different installation method
3. Consult Tambo AI documentation at https://docs.tambo.ai/ for installation instructions
4. Install the correct package using the appropriate method

## Placeholder

For now, the project has been set up without the Tambo AI dependency. Once the correct package information is available, install it using:

```bash
npm install [correct-tambo-package-name]
```

Or if it requires a private registry:

```bash
npm config set @tambo-ai:registry [private-registry-url]
npm install @tambo-ai/react
```

## Current Status

All other dependencies have been successfully installed:
- ✅ Next.js 14 with TypeScript
- ✅ @supabase/supabase-js
- ✅ @supabase/ssr (updated from deprecated auth-helpers-nextjs)
- ✅ @monaco-editor/react
- ✅ tailwindcss
- ✅ zod
- ✅ date-fns
