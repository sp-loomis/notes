import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $getRoot, $insertNodes, EditorState } from 'lexical';
import { ToolbarPlugin } from './Toolbar';

const EditorWrapper = styled.div`
  position: relative;
  border-radius: 2px;
  width: 100%;
  color: var(--text-color);
  
  .editor-container {
    background: var(--background-color);
    position: relative;
    cursor: text;
    min-height: 150px;
  }
  
  .editor-inner {
    background: var(--background-color);
    position: relative;
  }
  
  .editor-input {
    min-height: 150px;
    resize: none;
    font-size: 15px;
    position: relative;
    tab-size: 1;
    outline: 0;
    padding: 15px;
    caret-color: rgb(5, 5, 5);
  }
  
  .editor-text-bold {
    font-weight: bold;
  }
  
  .editor-text-italic {
    font-style: italic;
  }
  
  .editor-text-underline {
    text-decoration: underline;
  }
  
  .editor-text-strikethrough {
    text-decoration: line-through;
  }
  
  .editor-text-underlineStrikethrough {
    text-decoration: underline line-through;
  }
  
  .editor-text-code {
    background-color: var(--background-alt);
    padding: 1px 0.25rem;
    font-family: Menlo, Consolas, Monaco, monospace;
    font-size: 94%;
  }
  
  .editor-link {
    color: var(--primary-color);
    text-decoration: none;
  }
  
  .editor-code {
    background-color: var(--background-alt);
    font-family: Menlo, Consolas, Monaco, monospace;
    display: block;
    padding: 8px 8px 8px 52px;
    line-height: 1.53;
    font-size: 13px;
    margin: 0;
    margin-top: 8px;
    margin-bottom: 8px;
    tab-size: 2;
    overflow-x: auto;
    position: relative;
  }
  
  .editor-paragraph {
    margin: 0;
    margin-bottom: 8px;
    position: relative;
  }
  
  .editor-paragraph:last-child {
    margin-bottom: 0;
  }
  
  .editor-heading-h1 {
    font-size: 24px;
    font-weight: 400;
    margin: 0;
    margin-bottom: 12px;
    padding: 0;
  }
  
  .editor-heading-h2 {
    font-size: 20px;
    font-weight: 500;
    margin: 0;
    margin-top: 10px;
    padding: 0;
    margin-bottom: 10px;
  }
  
  .editor-quote {
    margin: 0;
    margin-left: 20px;
    margin-bottom: 10px;
    font-size: 15px;
    color: var(--text-color);
    border-left-color: var(--primary-color);
    border-left-width: 4px;
    border-left-style: solid;
    padding-left: 16px;
  }
  
  .editor-list-ol {
    padding: 0;
    margin: 0;
    margin-left: 16px;
  }
  
  .editor-list-ul {
    padding: 0;
    margin: 0;
    margin-left: 16px;
  }
  
  .editor-listitem {
    margin: 8px 32px 8px 32px;
  }
  
  .editor-nested-listitem {
    list-style-type: none;
  }
`;

const Placeholder = styled.div`
  color: #999;
  overflow: hidden;
  position: absolute;
  text-overflow: ellipsis;
  top: 15px;
  left: 15px;
  font-size: 15px;
  user-select: none;
  display: inline-block;
  pointer-events: none;
`;

interface NoteEditorProps {
  initialHtml?: string;
  onChange: (html: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  initialHtml = '',
  onChange,
  placeholder = 'Enter some text...',
  autoFocus = true
}) => {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);

  const editorConfig = {
    namespace: 'NoteEditor',
    theme: {
      root: 'editor-container',
      link: 'editor-link',
      text: {
        bold: 'editor-text-bold',
        italic: 'editor-text-italic',
        underline: 'editor-text-underline',
        strikethrough: 'editor-text-strikethrough',
        underlineStrikethrough: 'editor-text-underlineStrikethrough',
        code: 'editor-text-code',
      },
      paragraph: 'editor-paragraph',
      heading: {
        h1: 'editor-heading-h1',
        h2: 'editor-heading-h2',
      },
      list: {
        ol: 'editor-list-ol',
        ul: 'editor-list-ul',
        listitem: 'editor-listitem',
        nested: {
          listitem: 'editor-nested-listitem',
        },
      },
      quote: 'editor-quote',
      code: 'editor-code',
    },
    onError: (error: Error) => {
      console.error('Lexical editor error:', error);
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      TableNode,
      TableCellNode,
      TableRowNode
    ]
  };

  const handleChange = useCallback((editorState: EditorState) => {
    editorState.read(() => {
      // Get the root node and generate HTML from it
      const root = $getRoot();
      const htmlString = $generateHtmlFromNodes(root);
      onChange(htmlString);
    });
  }, [onChange]);

  // We now handle initialization with the InitialContentPlugin

  return (
    <EditorWrapper>
      <LexicalComposer initialConfig={editorConfig}>
        <div className="editor-inner">
          <ToolbarPlugin />
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={
              <Placeholder>{placeholder}</Placeholder>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <ListPlugin />
          <LinkPlugin />
          <TabIndentationPlugin />
          <HistoryPlugin />
          {autoFocus && <AutoFocusPlugin />}
          <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
          
          {/* Add an initialization hook for loading initial content */}
          {initialHtml && <InitialContentPlugin initialContent={initialHtml} />}
        </div>
      </LexicalComposer>
    </EditorWrapper>
  );
};

// Custom plugin to initialize the editor with HTML content
function InitialContentPlugin({ initialContent }: { initialContent: string }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    if (initialContent && initialContent.trim() !== '') {
      try {
        const parser = new DOMParser();
        const dom = parser.parseFromString(initialContent, 'text/html');
        
        editor.update(() => {
          try {
            const nodes = $generateNodesFromDOM(editor, dom);
            const root = $getRoot();
            root.clear();
            $insertNodes(nodes);
          } catch (error) {
            console.error('Error inserting initial nodes:', error);
          }
        });
      } catch (error) {
        console.error('Error parsing initial HTML:', error);
      }
    }
  }, [editor, initialContent]);
  
  return null;
}

export default NoteEditor;