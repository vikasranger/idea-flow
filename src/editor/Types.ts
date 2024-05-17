import {EditorState} from "draft-js";

export interface IEditorState
{
  id: string,
  state: EditorState
}

export interface ISuggestion
{
  id: string,
  text: string,
  label: string
}

export interface IPosition
{
  left: number,
  top: number
}
