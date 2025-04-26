import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $createParagraphNode
} from 'lexical';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from '@lexical/list';
import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingTagType
} from '@lexical/rich-text';
import { $wrapLeafNodesInElements } from '@lexical/selection';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { 
  VscBold, 
  VscItalic, 
  VscListOrdered, 
  VscListUnordered, 
  VscCheckAll, 
  VscLink, 
  VscUndo, 
  VscRedo,
} from 'react-icons/vsc';

const ToolbarContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  background-color: var(--background-alt);
  padding: 4px 8px;
  border-bottom: 1px solid var(--border-color);

  button {
    border: 0;
    background: none;
    border-radius: 4px;
    color: var(--text-color);
    cursor: pointer;
    height: 30px;
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 2px;
    
    &:hover {
      background-color: var(--hover-color);
    }
    
    &.active {
      background-color: var(--primary-color-light);
      color: var(--primary-color);
    }
  }

  .divider {
    width: 1px;
    background-color: var(--border-color);
    margin: 0 8px;
    align-self: stretch;
  }
  
  .heading-select {
    height: 30px;
    padding: 0 8px;
    background-color: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-color);
    font-size: 14px;
    margin-right: 8px;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }
`;

export function ToolbarPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);
  const [isUnorderedList, setIsUnorderedList] = useState(false);
  const [currentHeading, setCurrentHeading] = useState<HeadingTagType | ''>('');

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Format detection
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));

      // Node type detection
      const anchorNode = selection.anchor.getNode();
      const element = anchorNode.getKey() === 'root'
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow();
      
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      // List detection
      let parentList = $isListNode(element) ? element : null;
      if (parentList === null) {
        const parentElement = element.getParent();
        if ($isListNode(parentElement)) {
          parentList = parentElement;
        }
      }

      if (parentList !== null) {
        const listType = parentList.getListType();
        setIsOrderedList(listType === 'number');
        setIsUnorderedList(listType === 'bullet');
      } else {
        setIsOrderedList(false);
        setIsUnorderedList(false);
      }

      // Heading detection
      if ($isHeadingNode(element)) {
        const tag = element.getTag();
        setCurrentHeading(tag);
      } else {
        setCurrentHeading('');
      }
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const formatHeading = (tag: HeadingTagType) => {
    if (tag === currentHeading) {
      // If it's already the selected heading, remove it (convert to paragraph)
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.getNodes().forEach(node => {
            if ($isHeadingNode(node)) {
              node.replace($createParagraphNode());
            }
          });
        }
      });
      return;
    }
    
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapLeafNodesInElements(selection, () => $createHeadingNode(tag));
      }
    });
  };

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL');
    if (url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    }
  }, [editor]);

  return (
    <ToolbarContainer>
      <select 
        className="heading-select" 
        value={currentHeading} 
        onChange={e => formatHeading(e.target.value as HeadingTagType)}
      >
        <option value="">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
      </select>
      
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
        className={isBold ? 'active' : ''}
        aria-label="Format Bold"
      >
        <VscBold />
      </button>
      
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
        className={isItalic ? 'active' : ''}
        aria-label="Format Italics"
      >
        <VscItalic />
      </button>
      
      <div className="divider" />
      
      <button
        onClick={() => {
          if (isOrderedList) {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
          } else {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
          }
        }}
        className={isOrderedList ? 'active' : ''}
        aria-label="Format Ordered List"
      >
        <VscListOrdered />
      </button>
      
      <button
        onClick={() => {
          if (isUnorderedList) {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
          } else {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
          }
        }}
        className={isUnorderedList ? 'active' : ''}
        aria-label="Format Unordered List"
      >
        <VscListUnordered />
      </button>
      
      <button
        onClick={insertLink}
        aria-label="Insert Link"
      >
        <VscLink />
      </button>
      
      <div className="divider" />
      
      <button
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        aria-label="Undo"
      >
        <VscUndo />
      </button>
      
      <button
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        aria-label="Redo"
      >
        <VscRedo />
      </button>
    </ToolbarContainer>
  );
}

