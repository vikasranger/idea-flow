import "draft-js/dist/Draft.css";
import {Fragment} from "react";
import {useCallback} from "react";
import {useState} from "react";
import "./EditorStyles.css";
import edit from "../assets/edit.png";
import EditorNote from "./EditorNote.tsx";
import {IEditorState, ISuggestion} from "./Types.ts";
import {getFilteredState} from "./Utils.ts";
import {getSuggestionTags} from "./Utils.ts";
import {getEditorState} from "./Utils.ts";

export default function Editor()
{
  const [editorStates, setEditorStates] = useState<IEditorState[]>([getEditorState()]);
  const [suggestionTags, setSuggestionTags] = useState<ISuggestion[]>([]);
  const [searchText, setSearchText] = useState<string>("");

  const addParagraph = useCallback(() =>
  {
    setEditorStates([...editorStates, getEditorState()]);
  }, [editorStates]);

  const handleChange = useCallback((newEditorState: IEditorState, index: number) =>
  {
    const newEditorStates = [...editorStates];
    newEditorStates[index] = newEditorState;
    setEditorStates(newEditorStates);
    setSuggestionTags(getSuggestionTags(newEditorStates));
  }, [editorStates]);

  const handleEditorStateDelete = useCallback((id: string) =>
  {
    const newStates = editorStates.filter(editorState => editorState.id !== id);
    setEditorStates(newStates);
  }, [editorStates]);

  const handleSearch = useCallback((value: string) =>
  {
    setSearchText(value);
  }, [setSearchText]);

  const renderParagraphs = useCallback(() =>
  {
    const filteredState = getFilteredState(editorStates, searchText);
    return (
      <Fragment>
        {filteredState.map((editorState, index) => (
          <div key={editorState.id}>
            <EditorNote
              id={editorState.id}
              editorState={editorState.state}
              onChange={(newEditorState) =>
                handleChange(newEditorState, index)
              }
              placeholder={`Write your note...`}
              suggestionTags={suggestionTags}
              onClickDelete={() => handleEditorStateDelete(editorState.id)}
            />
          </div>
        ))}
      </Fragment>);
  }, [editorStates, searchText, suggestionTags, handleEditorStateDelete, handleChange]);

  return (
    <div className={"main-container"}>
      <div className={"main-header"}>
        <input
          placeholder={"Search Notes"}
          value={searchText}
          onChange={e => handleSearch(e.target.value)}
          className={"search"}
        />
        <button className={"add-button"} title={"add button"} onClick={addParagraph}>
          <img className={"edit-img"} src={edit} alt={"edit"} />
        </button>
      </div>
      <span className={"divider"} />
      <div className={"editor-container"}>
        {renderParagraphs()}
      </div>
    </div>
  );
}







