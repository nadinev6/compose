# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: This is a Tambo AI Template

**This is a template application for Tambo AI.** Before writing any new code:

1. **Check the package** - Read `node_modules/@tambo-ai/react` to understand the latest available hooks, components, and features

Always check the `@tambo-ai/react` package exports for the most up-to-date functionality. The template may not showcase all available features.

## Essential Commands

```bash
# Development
npm run dev          # Start development server (localhost:3000)
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix


## Architecture Overview

This is a Next.js 15 app with Tambo AI integration for building generative UI/UX applications. The architecture enables AI to dynamically generate and control React components.

### Core Technologies
- **Next.js 15.4.1** with App Router
- **React 19.1.0** with TypeScript
- **Tambo AI SDK**
- **Tailwind CSS v4** with dark mode support
- **Zod** for schema validation

### Key Architecture Patterns

1. **Component Registration System**
   - Components are registered in `src/lib/tambo.ts` with Zod schemas
   - AI can dynamically render these components based on user input
   - Each component has a name, description, component reference, and propsSchema

2. **Tool System**
   - External functions registered as "tools" in `src/lib/tambo.ts`
   - AI can invoke these tools to fetch data or perform actions
   - Tools have schemas defining their inputs and outputs

3. **Provider Pattern**
   - `TamboProvider` wraps the app in `src/app/layout.tsx`
   - Provides API key, registered components, and tools to the entire app

4. **Streaming Architecture**
   - Real-time streaming of AI-generated content via `useTamboStreaming` hook
   - Support for progressive UI updates during generation

### File Structure

```

src/
├── app/ # Next.js App Router pages
│ ├── chat/ # Chat interface route
│ ├── interactables/ # Interactive components demo
│ └── layout.tsx # Root layout with TamboProvider
├── components/
│ ├── tambo/ # Tambo-specific components
│ │ ├── graph.tsx # Recharts data visualization
│ │ ├── message*.tsx # Chat UI components
│ │ └── thread*.tsx # Thread management UI
│ └── ApiKeyCheck.tsx # API key validation
├── lib/
│ ├── tambo.ts # CENTRAL CONFIG: Component & tool registration
│ ├── thread-hooks.ts # Custom thread management hooks
│ └── utils.ts # Utility functions
└── services/
└── population-stats.ts # Demo data service

```

## Key Tambo Hooks

- **`useTamboRegistry`**: Component and tool registration
- **`useTamboThread`**: Thread state and message management
- **`useTamboThreadInput`**: Input handling for chat
- **`useTamboStreaming`**: Real-time content streaming
- **`useTamboSuggestions`**: AI suggestion management
- **`withInteractable`**: Interactable component wrapper

## When Working on This Codebase

1. **Adding New Components for AI Control**
   - Define component in `src/components/tambo/`
   - Create Zod schema for props validation
   - use z.infer<typeof schema> to type the props
   - Register in `src/lib/tambo.ts` components array

2. **Adding New Tools**
   - Implement tool function in `src/services/`
   - Define Zod schema for inputs/outputs
   - Register in `src/lib/tambo.ts` tools array

3. **Styling Guidelines**
   - Use Tailwind CSS classes
   - Follow existing dark mode patterns using CSS variables
   - Components should support variant and size props

4. **TypeScript Requirements**
   - Strict mode is enabled
   - All components and tools must be fully typed
   - Use Zod schemas for runtime validation

5. **Testing Approach**
   - No test framework is currently configured
   - Manual testing via development server
   - Verify AI can properly invoke components and tools

---

# Tambo AI Integration Rules

## Critical Constraints

**⚠️ THESE RULES MUST BE FOLLOWED AT ALL TIMES ⚠️**

Tambo AI provides pre-built components that are essential to this application. Violating these rules will break the application and require significant rework.

### Rule 1: Never Modify Tambo Components

**DO NOT:**
- Modify Tambo component source code
- Fork or recreate Tambo components
- Override Tambo component internals
- Access private properties or methods
- Monkey-patch Tambo components
- Use `!important` to override Tambo styles directly

**WHY:** Tambo components are third-party black boxes. Modifications will break on updates and cause unpredictable behavior.

**EXAMPLE - WRONG:**
```typescript
// ❌ NEVER DO THIS
import { TamboMessageThread } from '@tambo-ai/react';

// Trying to modify internals
TamboMessageThread.prototype.customMethod = function() { ... };

// Trying to override styles directly on Tambo elements
<TamboMessageThread className="override-tambo-styles" />
```

**EXAMPLE - CORRECT:**
```typescript
// ✅ DO THIS INSTEAD
import { TamboMessageThread } from '@tambo-ai/react';

// Wrap in a container and style the container
export function TamboMessageThreadWrapper({ user, onTemplateCreate }) {
  return (
    <div className="tambo-message-thread-container">
      <TamboMessageThread
        apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
        userId={user.id}
        onTemplateGenerated={onTemplateCreate}
      />
    </div>
  );
}
```

### Rule 2: Always Use the Wrapper Pattern

**REQUIRED APPROACH:**
- Create wrapper components for all Tambo integrations
- Handle state management in wrappers
- Implement business logic in wrappers
- Use wrappers for styling containers

**WRAPPER COMPONENT TEMPLATE:**
```typescript
// components/tambo/[TamboComponent]Wrapper.tsx

import { TamboComponent } from '@tambo-ai/react';
import { useState, useEffect } from 'react';

interface WrapperProps {
  // Your custom props
  user: User;
  onDataChange?: (data: any) => void;
}

export function TamboComponentWrapper({ user, onDataChange }: WrapperProps) {
  // State management happens here
  const [localState, setLocalState] = useState();

  // Business logic happens here
  const handleTamboCallback = (data: any) => {
    // Process data
    // Save to database
    // Update local state
    onDataChange?.(data);
  };

  // Error handling happens here
  useEffect(() => {
    // Setup/cleanup
  }, []);

  return (
    <div className="tambo-wrapper">
      {/* Style this container, not Tambo internals */}
      <TamboComponent
        // Only use Tambo's documented props
        apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
        userId={user.id}
        onCallback={handleTamboCallback}
      />
    </div>
  );
}
```

### Rule 3: Style Using globals.css and Container Classes

**STYLING APPROACH:**
- Define global styles in `app/globals.css`
- Use CSS custom properties for theming
- Apply styles to wrapper containers only
- Test that custom styles don't conflict with Tambo

**EXAMPLE - CORRECT STYLING:**
```css
/* app/globals.css */

/* Define theme variables */
:root {
  --tambo-container-bg: #ffffff;
  --tambo-container-border: #e5e7eb;
  --tambo-container-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Style the wrapper container, NOT Tambo internals */
.tambo-message-thread-container {
  background: var(--tambo-container-bg);
  border: 1px solid var(--tambo-container-border);
  border-radius: 8px;
  box-shadow: var(--tambo-container-shadow);
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.tambo-canvas-container {
  background: var(--tambo-container-bg);
  border: 1px solid var(--tambo-container-border);
  border-radius: 8px;
  min-height: 600px;
}

/* DO NOT target Tambo internal classes */
/* ❌ .tambo-internal-class { ... } */
```

### Rule 4: Use Only Documented Tambo Props and Callbacks

**INTEGRATION POINTS:**
- Only use props documented in Tambo's official documentation
- Only use callbacks provided by Tambo
- Store Tambo-generated data in application state
- Sync Tambo state with Supabase when needed

**DOCUMENTED TAMBO COMPONENTS:**

#### TamboMessageThread
```typescript
interface TamboMessageThreadProps {
  apiKey: string;              // Required: Your Tambo API key
  userId: string;              // Required: Current user ID
  conversationId?: string;     // Optional: Resume conversation
  onMessageSent?: (message: Message) => void;
  onTemplateGenerated?: (template: EmailTemplate) => void;
  theme?: 'light' | 'dark';    // Optional: UI theme
}
```

#### TamboCanvas
```typescript
interface TamboCanvasProps {
  content: string;             // Required: HTML content to display
  onContentChange?: (content: string) => void;
  readOnly?: boolean;          // Optional: Disable editing
  theme?: 'light' | 'dark';    // Optional: UI theme
}
```

**EXAMPLE - USING CALLBACKS:**
```typescript
export function TamboMessageThreadWrapper({ user }) {
  const handleTemplateGenerated = async (template: EmailTemplate) => {
    // Save to Supabase
    const { data, error } = await supabase
      .from('templates')
      .insert({
        user_id: user.id,
        name: template.name,
        subject: template.subject,
        html: template.html,
        generation_prompt: template.prompt
      });

    if (error) {
      console.error('Failed to save template:', error);
      // Show error to user
    } else {
      // Show success message
      // Navigate to editor
    }
  };

  return (
    <TamboMessageThread
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      userId={user.id}
      onTemplateGenerated={handleTemplateGenerated}
    />
  );
}
```

### Rule 5: Always Reference Official Tambo Documentation

**DOCUMENTATION SOURCES:**
- Official Tambo Docs: https://docs.tambo.ai/
- Tambo React SDK: https://docs.tambo.ai/react
- Tambo API Reference: https://docs.tambo.ai/api-reference
- Tambo Examples: https://docs.tambo.ai/examples

**WHEN TO CONSULT DOCS:**
- Before implementing any Tambo integration
- When encountering Tambo-related errors
- When adding new Tambo features
- When updating Tambo SDK versions
- When behavior seems unexpected

**IF DOCUMENTATION IS UNCLEAR:**
1. Check Tambo's GitHub issues
2. Contact Tambo support
3. Implement a workaround in wrapper component
4. Document the workaround in code comments

### Rule 6: Handle Errors from Tambo Gracefully

**ERROR HANDLING PATTERN:**
```typescript
import { ErrorBoundary } from 'react-error-boundary';

function TamboErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="tambo-error-container">
      <h3>Something went wrong with the AI interface</h3>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export function TamboMessageThreadWrapper({ user }) {
  return (
    <ErrorBoundary
      FallbackComponent={TamboErrorFallback}
      onReset={() => {
        // Reset state
      }}
    >
      <TamboMessageThread
        apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
        userId={user.id}
      />
    </ErrorBoundary>
  );
}
```

## Quick Reference Checklist

Before implementing any Tambo feature:
- [ ] Read official Tambo documentation
- [ ] Create wrapper component
- [ ] Use only documented props
- [ ] Style wrapper container, not Tambo internals
- [ ] Add error boundary
- [ ] Handle callbacks for data flow
- [ ] Test integration points
- [ ] Document any workarounds

## Support and Resources

- **Tambo Documentation:** https://docs.tambo.ai/
- **Tambo Support:** support@tambo.ai
- **Tambo GitHub:** https://github.com/tambo-ai/tambo
- **Tambo Discord:** https://discord.gg/tambo-ai

---

**Remember: When in doubt, wrap it out! Never modify Tambo components directly.**
```
