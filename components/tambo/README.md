# Tambo AI Component Wrappers

This directory contains wrapper components for Tambo AI integration. These wrappers follow strict integration rules to ensure stability and maintainability.

## ⚠️ Critical Rules

**NEVER modify Tambo components directly!** All customization must happen through these wrapper components.

See `.kiro/steering/tambo-rules.md` for complete integration guidelines.

## Components

### TamboMessageThreadWrapper

Wrapper for the Tambo AI message thread component. Handles:
- Template generation callbacks
- Saving templates to Supabase
- Conversation state management
- Error handling

**Usage:**
```tsx
import { TamboMessageThreadWrapper } from '@/components/tambo';

<TamboMessageThreadWrapper
  userId={user.id}
  onTemplateCreate={(template) => {
    console.log('Template created:', template);
  }}
  onError={(error) => {
    console.error('Error:', error);
  }}
/>
```

### TamboCanvasWrapper

Wrapper for the Tambo AI canvas component. Handles:
- Content synchronization
- Real-time content updates
- Read-only mode
- Theme support

**Usage:**
```tsx
import { TamboCanvasWrapper } from '@/components/tambo';

<TamboCanvasWrapper
  content={template.html}
  onContentChange={(newContent) => {
    setTemplate({ ...template, html: newContent });
  }}
  readOnly={false}
  theme="light"
/>
```

### TamboErrorBoundary

Error boundary component for catching and handling Tambo component errors.

**Usage:**
```tsx
import { TamboErrorBoundary } from '@/components/tambo';

<TamboErrorBoundary
  onError={(error, errorInfo) => {
    console.error('Tambo error:', error);
  }}
>
  <TamboMessageThreadWrapper userId={user.id} />
</TamboErrorBoundary>
```

## Styling

All Tambo wrapper styles are defined in `app/globals.css`. Key classes:

- `.tambo-message-thread-container` - Container for message thread
- `.tambo-canvas-container` - Container for canvas
- `.tambo-wrapper` - Generic wrapper class
- `.tambo-loading-overlay` - Loading state overlay
- `.tambo-error-container` - Error state container

**DO NOT** add styles that target Tambo internal classes. Only style the wrapper containers.

## Integration Pattern

The wrapper pattern ensures:

1. **State Management** - All state is managed in the wrapper, not in Tambo components
2. **Business Logic** - All business logic (saving to database, validation) happens in wrappers
3. **Error Handling** - Errors are caught and handled gracefully
4. **Styling** - Only wrapper containers are styled, never Tambo internals

## Example: Complete Integration

```tsx
'use client';

import { useState } from 'react';
import { TamboErrorBoundary, TamboMessageThreadWrapper } from '@/components/tambo';
import { useAuth } from '@/components/auth/AuthProvider';

export function ChatPage() {
  const { user } = useAuth();
  const [error, setError] = useState<Error | null>(null);

  const handleTemplateCreate = (template) => {
    console.log('New template:', template);
    // Navigate to editor or show success message
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">AI Email Assistant</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600">{error.message}</p>
        </div>
      )}

      <TamboErrorBoundary onError={(err) => setError(err)}>
        <TamboMessageThreadWrapper
          userId={user.id}
          onTemplateCreate={handleTemplateCreate}
          onError={setError}
        />
      </TamboErrorBoundary>
    </div>
  );
}
```

## Troubleshooting

### Tambo component not rendering

1. Check that `NEXT_PUBLIC_TAMBO_API_KEY` is set in `.env.local`
2. Verify `@tambo-ai/react` package is installed
3. Check browser console for errors
4. See `TAMBO_SETUP.md` for installation instructions

### Content not updating

1. Ensure `onContentChange` callback is provided
2. Check that parent component is updating state
3. Verify content prop is being passed correctly

### Styling issues

1. Check that custom styles are only applied to wrapper containers
2. Verify CSS custom properties are defined in `app/globals.css`
3. Never use `!important` to override Tambo styles

## Resources

- [Tambo AI Documentation](https://docs.tambo.ai/)
- [Integration Rules](.kiro/steering/tambo-rules.md)
- [Setup Instructions](../../TAMBO_SETUP.md)
