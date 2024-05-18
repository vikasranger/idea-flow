import {IPosition} from "../editor/Types.ts";
import {ISuggestion} from "../editor/Types.ts";
import "./ComponentStyles.css";

export default function Suggestions(props: {
  autoCompleteState: string | null,
  renderSuggestion: (suggestion: ISuggestion) => void,
  position?: IPosition,
  selectedIndex: number,
  matchSuggestions: ISuggestion[],
  setSelectedIndex: (index: number) => void
})
{
  const {
    autoCompleteState,
    renderSuggestion,
    position,
    selectedIndex,
    matchSuggestions,
    setSelectedIndex
  } = props;

  if(autoCompleteState === null) return null;

  return (
    <div className="suggestions" style={position}>
      <ul>
        {matchSuggestions.map((suggestion, index) => (
          <li
            key={index}
            id={suggestion.id}
            className={selectedIndex === index ? "selected" : ""}
            onMouseDown={(e) =>
            {
              e.preventDefault();
              renderSuggestion(suggestion);
            }}
            onMouseEnter={(e) =>
            {
              e.preventDefault();
              setSelectedIndex(index);
            }}
          >
            {suggestion.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
