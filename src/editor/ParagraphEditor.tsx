import "draft-js/dist/Draft.css";
import {useState} from "react";
import "./Styles.css";
import edit from "../assets/edit.png";
import TextEditor from "./TextEditor.tsx";
import {IEditorState, ISuggestion} from "./Types.ts";
import {getSuggestionTags} from "./Utils.ts";
import {getEditorState} from "./Utils.ts";

function getFilteredState(editorStates: IEditorState[], searchText: string)
{
  if(searchText.length === 0) return editorStates;
  return editorStates.filter(editorState =>
  {
    const plainText = editorState.state.getCurrentContent().getPlainText();
    if(!plainText) return true;
    return plainText.toLowerCase().includes(searchText.toLowerCase());
  });
}

export default function ParagraphEditor()
{
  const [editorStates, setEditorStates] = useState<IEditorState[]>([getEditorState()]);
  const [suggestionTags, setSuggestionTags] = useState<ISuggestion[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const addParagraph = () =>
  {
    setEditorStates([...editorStates, getEditorState()]);
  };

  const handleChange = (newEditorState: IEditorState, index: number) =>
  {
    console.log({editorStates});
    console.log({newEditorState});
    const newEditorStates = [...editorStates];
    newEditorStates[index] = newEditorState;
    setEditorStates(newEditorStates);
    setSuggestionTags(getSuggestionTags(newEditorStates));
  };

  const handleEditorStateDelete = (id: string) =>
  {
    console.log(id);
    const newStates = editorStates.filter(editorState => editorState.id !== id);
    setEditorStates(newStates);
  };

  const renderParagraphs = () =>
  {
    const filteredState = getFilteredState(editorStates, searchText);
    return filteredState.map((editorState, index) => (
      <div key={editorState.id}>
        <TextEditor
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
    ));
  };

  const handleSearch = (value: string) =>
  {
    setSearchText(value);
    console.log(value);
  };

  return (
    <div className={"main-container"}>
      <div className={"main-header"}>
        <input
          placeholder={"Search Notes"}
          value={searchText}
          onChange={e => handleSearch(e.target.value)}
          className={"search"}
        />
        <button className={"add-button"} onClick={addParagraph}>
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







