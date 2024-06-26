import {EditorState} from "draft-js";
import {ContentBlock, ContentState} from "draft-js";
import {CompositeDecorator} from "draft-js";
import {v4 as uuId} from "uuid";
import Hashtag from "../components/Hashtag.tsx";
import {ISuggestion} from "./Types.ts";
import {IEditorState} from "./Types.ts";

const MAX_LENGTH_SUGGESTION = 25;
export const findHashtagEntities = (contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState) =>
{
  contentBlock.findEntityRanges(
    (character) =>
    {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === "HASHTAG"
      );
    },
    callback
  );
};

export const decorator = new CompositeDecorator([
  {
    strategy: findHashtagEntities,
    component: Hashtag
  }
]);

export function getEditorState(): IEditorState
{
  return {
    id: uuId(),
    state: EditorState.createEmpty(decorator)
  };
}

export function getSuggestionTags(editorStates: IEditorState[]): ISuggestion[]
{
  const suggestionTags: ISuggestion[] = [];
  editorStates.forEach(editorState =>
  {
    const value = editorState.state.getCurrentContent().getPlainText().replace("\n", "\\ ");
    if(value.length > MAX_LENGTH_SUGGESTION)
    {
      const part = value.slice(0, MAX_LENGTH_SUGGESTION - 3);
      suggestionTags.push({
        id: editorState.id,
        label: part + "...",
        text: part
      });
    }
    else if(value.length > 0)
    {
      suggestionTags.push({
        id: editorState.id,
        label: value,
        text: value
      });
    }
  });
  return suggestionTags;
}

export function getFilteredState(editorStates: IEditorState[], searchText: string)
{
  if(searchText.length === 0) return editorStates;
  return editorStates.filter(editorState =>
  {
    const plainText = editorState.state.getCurrentContent().getPlainText();
    if(!plainText) return true;
    return plainText.toLowerCase().includes(searchText.toLowerCase());
  });
}
