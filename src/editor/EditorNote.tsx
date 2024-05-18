import {DraftHandleValue} from "draft-js";
import {EditorCommand} from "draft-js";
import {Editor, EditorState, getDefaultKeyBinding, Modifier} from "draft-js";
import "draft-js/dist/Draft.css";
import React, {KeyboardEvent, useEffect, useState} from "react";
import "./EditorStyles.css";
import Suggestions from "../components/Suggestions.tsx";
import {IPosition} from "./Types.ts";
import {IEditorState} from "./Types.ts";
import {ISuggestion} from "./Types.ts";

export default function EditorNote(props: {
  id: string,
  editorState: EditorState,
  onChange: (editorState: IEditorState) => void,
  onClickDelete: () => void,
  placeholder: string,
  suggestionTags: ISuggestion[]
})
{
  const {
    id,
    editorState,
    onChange,
    onClickDelete,
    placeholder,
    suggestionTags
  } = props;
  const [autoCompleteState, setAutoCompleteState] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [matchSuggestions, setMatchSuggestions] = useState<ISuggestion[]>([]);
  const [showDelete, setShowDelete] = useState(false);

  const filterSuggestion = () =>
  {
    setSelectedIndex(0);
    setMatchSuggestions(
      suggestionTags.filter(
        (tag) =>
          tag.id !== id && tag.text.toLowerCase().substring(0, autoCompleteState?.length)
          === autoCompleteState?.toLowerCase()
      )
    );
  };

  const isCurrentSelectionAnEntity = () =>
  {
    const selectionState = editorState.getSelection();
    const anchorKey = selectionState.getAnchorKey();
    const currentContent = editorState.getCurrentContent();
    const currentContentBlock = currentContent.getBlockForKey(anchorKey);
    const startOffset = selectionState.getStartOffset();
    const endOffset = selectionState.getEndOffset();
    const entityBefore = currentContentBlock.getEntityAt(startOffset - 1);
    const entityAfter = currentContentBlock.getEntityAt(endOffset);
    return entityBefore !== null || entityAfter !== null;
  };

  const getSelectionRange = () =>
  {
    const selection = window.getSelection();
    if(!selection || selection.rangeCount === 0)
    {
      return null;
    }
    return selection.getRangeAt(0);
  };

  const getTriggerRange = (trigger: string) =>
  {
    const range = getSelectionRange();
    const text = range && range.startContainer?.textContent?.substring(0, range.startOffset);
    if(!text)
    {
      return null;
    }
    const index = text.lastIndexOf(trigger);
    if(index === -1)
    {
      return null;
    }
    return {
      text: text.substring(index),
      start: index,
      end: range.startOffset
    };
  };

  const renderSuggestion = (suggestion: ISuggestion) =>
  {
    onChange({
      state: addHashTag(editorState, suggestion.label),
      id: id
    });
    setAutoCompleteState(null);
    setMatchSuggestions([]);
  };

  const addHashTag = (editorState: EditorState, hashtag: string) =>
  {
    /* 1 */
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const anchorKey = selection.getAnchorKey();
    const end = selection.getAnchorOffset();
    const block = content.getBlockForKey(anchorKey);
    const text = block.getText();

    const start = text.substring(0, end).lastIndexOf("<>");
    const currentSelection = selection.merge({
      anchorOffset: start,
      focusOffset: end
    });

    const contentStateWithEntity = content.createEntity("HASHTAG", "IMMUTABLE", {
      hashtag
    });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    const newContentState = Modifier.replaceText(
      contentStateWithEntity,
      currentSelection,
      `<>${hashtag}`,
      undefined,
      entityKey
    );

    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      `insert-characters`
    );

    return EditorState.forceSelection(
      newEditorState,
      newContentState.getSelectionAfter()
    );
  };

  const getCaretCoordinates = (): IPosition | undefined =>
  {
    const range = getSelectionRange();
    if(range)
    {
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      const {
        left: x,
        top: y
      } = range.getBoundingClientRect();
      return {
        left: x + scrollX,
        top: y + scrollY
      };
    }
  };

  useEffect(() =>
  {
    const triggerRange = getTriggerRange("<>");
    getCaretCoordinates();
    if(!triggerRange)
    {
      setAutoCompleteState(null);
    }
    else
    {
      setAutoCompleteState(triggerRange.text.slice(2, triggerRange.text.length)
      );
    }
  }, [editorState]);

  useEffect(() =>
  {
    if(!isCurrentSelectionAnEntity())
    {
      filterSuggestion();
    }
  }, [autoCompleteState]);

  const keyBindingFn = (e: KeyboardEvent) =>
  {
    if(matchSuggestions.length > 0 && e.keyCode === 13)
    {
      return "addAutoComplete";
    }
    return getDefaultKeyBinding(e);
  };

  const handleKeyCommand = (command: EditorCommand): DraftHandleValue =>
  {
    if(command === "addAutoComplete")
    {
      renderSuggestion(matchSuggestions[selectedIndex]);
      return "handled";
    }
    return "not-handled";
  };

  return (
    <React.Fragment>
      <div className="Editor" onMouseEnter={() => setShowDelete(true)} onMouseLeave={() => setShowDelete(false)}>
        {showDelete &&
          <span className={"delete-button"} onClick={onClickDelete}>&#x2715;</span>
        }
        <Editor
          editorState={editorState}
          onChange={(_editorState) => onChange({
            id: id,
            state: _editorState
          })}
          placeholder={placeholder}
          onDownArrow={(e) =>
          {
            if(autoCompleteState !== null)
            {
              e.preventDefault();
              if(selectedIndex === matchSuggestions.length - 1)
              {
                setSelectedIndex(0);
              }
              else
              {
                setSelectedIndex(selectedIndex + 1);
              }
            }
          }}
          onUpArrow={(e) =>
          {
            if(autoCompleteState !== null)
            {
              e.preventDefault();
              if(selectedIndex > 0)
              {
                setSelectedIndex(selectedIndex - 1);
              }
              else
              {
                setSelectedIndex(matchSuggestions.length - 1);
              }
            }
          }}
          onEscape={(e) =>
          {
            if(autoCompleteState !== null)
            {
              e.preventDefault();
              setAutoCompleteState(null);
            }
          }}
          keyBindingFn={keyBindingFn}
          handleKeyCommand={handleKeyCommand}
        />
      </div>
      <Suggestions
        position={getCaretCoordinates()}
        autoCompleteState={autoCompleteState}
        renderSuggestion={renderSuggestion}
        selectedIndex={selectedIndex}
        matchSuggestions={matchSuggestions}
        setSelectedIndex={setSelectedIndex}
      />

    </React.Fragment>
  );
}
