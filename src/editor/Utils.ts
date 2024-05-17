import {convertToRaw} from "draft-js";
import {EditorState} from "draft-js";
import {ContentBlock, ContentState} from "draft-js";
import {CompositeDecorator} from "draft-js";
import {v4 as uuId} from "uuid";
import Hashtag from "../components/Hashtag.tsx";
import {ISuggestion} from "./Types.ts";
import {IEditorState} from "./Types.ts";

const MAX_LENGTH_SUGGESTION = 15;
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
    const blocks = convertToRaw(editorState.state.getCurrentContent()).blocks;
    const value = blocks.map(block => (!block.text.trim() && " / ") || block.text).join(" / ");
    if(value.length > MAX_LENGTH_SUGGESTION)
    {
      const part = value.slice(0, MAX_LENGTH_SUGGESTION - 3);
      suggestionTags.push({
        id: editorState.id,
        label: part + "...",
        text: part
      });
    }
    else
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
