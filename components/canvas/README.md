# Canvas Editor Component

The Canvas Editor is a comprehensive email template editing component with real-time validation feedback.

## Features

### ✅ Implemented (Task 13)

- **Real-time Validation Display**: Shows compatibility score (0-100) and detailed error/warning messages
- **Validation Panel**: Collapsible side panel with categorized errors and warnings
- **Error Prevention**: Prevents saving templates with critical errors
- **Visual Feedback**: Color-coded validation scores (green/yellow/red)
- **Detailed Suggestions**: Each error/warning includes actionable suggestions
- **Category Tags**: Errors organized by category (structure, CSS, images, compatibility, accessibility)

### 📝 Additional Features (Task 12)

- **Dual View Modes**: Switch between Code and Preview tabs
- **Monaco Editor Integration**: VS Code-powered HTML editing with syntax highlighting
- **Responsive Preview**: Test email templates in Desktop, Tablet, and Mobile views
- **Auto-save**: Automatically saves changes after 2 seconds of inactivity
- **Real-time Preview**: Live iframe preview of email HTML

## Usage

```tsx
import { CanvasEditor } from '@/components/canvas/CanvasEditor';
import { Template } from '@/lib/database.types';

function MyComponent() {
  const [template, setTemplate] = useState<Template>({
    // ... template data
  });

  const handleSave = async (updatedTemplate: Template) => {
    // Save to database
    await saveTemplate(updatedTemplate);
  };

  return (
    <CanvasEditor
      template={template}
      onSave={handleSave}
      onContentChange={(content) => console.log('Content changed')}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `template` | `Template` | Yes | The email template to edit |
| `onSave` | `(template: Template) => Promise<void>` | Yes | Callback when template is saved |
| `onContentChange` | `(content: string) => void` | No | Callback when content changes |

## Validation Display

The validation panel shows:

1. **Compatibility Score**: 0-100 score with color coding
   - 90-100: Green (Excellent)
   - 70-89: Yellow (Good)
   - 0-69: Red (Needs improvement)

2. **Errors**: Critical issues that prevent email compatibility
   - Missing table-based layout
   - Width exceeding 600px
   - External stylesheets
   - JavaScript code
   - Style tags

3. **Warnings**: Minor issues that may affect some email clients
   - Missing DOCTYPE
   - Missing viewport meta tag
   - Unsupported CSS properties
   - Missing image attributes
   - Accessibility concerns

## Validation Categories

- **structure**: HTML document structure issues
- **css**: CSS and styling issues
- **images**: Image-related issues
- **compatibility**: Email client compatibility issues
- **accessibility**: Accessibility and best practices

## Auto-save Behavior

- Saves automatically 2 seconds after the last edit
- Only saves if content has changed
- Prevents saving if critical errors exist
- Shows "Saving..." indicator during save

## Preview Modes

- **Desktop**: Full width preview (100%)
- **Tablet**: 768px width preview
- **Mobile**: 375px width preview

## Example

See `CanvasEditorExample.tsx` for a complete working example.

## Requirements Met

This component satisfies the following requirements:

- **Requirement 6.1**: Implements email validation engine integration
- **Requirement 6.2**: Displays 100-point compatibility score
- **Requirement 6.3**: Shows specific error messages with recommendations
- **Requirement 6.4**: Validates templates before allowing saves
- **Requirement 5.3**: Provides real-time preview
- **Requirement 5.4**: Updates preview in real-time on edits
- **Requirement 5.5**: Implements auto-save with validation

## Technical Details

- Built with React 18 and TypeScript
- Uses Monaco Editor for code editing
- Integrates with EmailValidator from `lib/email-validation.ts`
- Styled with Tailwind CSS
- Fully responsive design
- Accessible keyboard navigation
