"use client";

import type { messageVariants } from "@/components/tambo/message";
import {
  MessageInput,
  MessageInputError,
  MessageInputSubmitButton,
  MessageInputTextarea,
  MessageInputToolbar,
  MessageInputFileButton,
} from "@/components/tambo/message-input";
import {
  MessageSuggestions,
  MessageSuggestionsList,
  MessageSuggestionsStatus,
} from "@/components/tambo/message-suggestions";
import { ScrollableMessageContainer } from "@/components/tambo/scrollable-message-container";
import {
  ThreadContainer,
  useThreadContainerContext,
} from "@/components/tambo/thread-container";
import {
  ThreadContent,
  ThreadContentMessages,
} from "@/components/tambo/thread-content";
import {
  ThreadHistory,
  ThreadHistoryHeader,
  ThreadHistoryList,
  ThreadHistoryNewButton,
  ThreadHistorySearch,
} from "@/components/tambo/thread-history";
import { useMergedRef } from "@/lib/thread-hooks";

import type { Suggestion } from "@tambo-ai/react";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

/**
 * Props for the MessageThreadFullCustom component
 */
export interface MessageThreadFullCustomProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional context key for the thread */
  contextKey?: string;
  /**
   * Controls the visual styling of messages in the thread.
   */
  variant?: VariantProps<typeof messageVariants>["variant"];
  /** Whether the thread history sidebar should start collapsed */
  defaultCollapsed?: boolean;

}

/**
 * A full-screen chat thread component with message history, input, and suggestions
 * Custom version with configurable sidebar collapse state
 */
export const MessageThreadFullCustom = React.forwardRef<
  HTMLDivElement,
  MessageThreadFullCustomProps
>(({ className, contextKey, variant, defaultCollapsed = false, ...props }, ref) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef<HTMLDivElement | null>(ref, containerRef);

  // No editor callback needed - InteractableEditor handles updates directly

  // Always show history on the left for this layout
  const historyPosition: "left" | "right" = "left";

  const threadHistorySidebar = (
    <ThreadHistory
      contextKey={contextKey}
      position={historyPosition}
      defaultCollapsed={defaultCollapsed}
    >
      <ThreadHistoryHeader />
      <ThreadHistoryNewButton />
      <ThreadHistorySearch />
      <ThreadHistoryList />
    </ThreadHistory>
  );

  const defaultSuggestions: Suggestion[] = [
    {
      id: "suggestion-1",
      title: "Get started",
      detailedSuggestion: "What can you help me with?",
      messageId: "welcome-query",
    },
    {
      id: "suggestion-2",
      title: "Learn more",
      detailedSuggestion: "Tell me about your capabilities.",
      messageId: "capabilities-query",
    },
    {
      id: "suggestion-3",
      title: "Examples",
      detailedSuggestion: "Show me some example queries I can try.",
      messageId: "examples-query",
    },
  ];

  return (
    <div ref={mergedRef} style={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* Thread History Sidebar */}
      {threadHistorySidebar}

      <ThreadContainer className={className} {...props}>
        <ScrollableMessageContainer className="p-4">
          <ThreadContent variant={variant}>
            <ThreadContentMessages />
          </ThreadContent>
        </ScrollableMessageContainer>

        {/* Message suggestions status */}
        <MessageSuggestions>
          <MessageSuggestionsStatus />
        </MessageSuggestions>

        {/* Message input */}
        <div className="p-4">
          <MessageInput contextKey={contextKey}>
            <MessageInputTextarea placeholder="Type your message or paste images..." />
            <MessageInputToolbar>
              <MessageInputFileButton />
              <MessageInputSubmitButton />
            </MessageInputToolbar>
            <MessageInputError />
          </MessageInput>
        </div>

        {/* Message suggestions */}
        <MessageSuggestions initialSuggestions={defaultSuggestions}>
          <MessageSuggestionsList />
        </MessageSuggestions>
      </ThreadContainer>
    </div>
  );
});
MessageThreadFullCustom.displayName = "MessageThreadFullCustom";
