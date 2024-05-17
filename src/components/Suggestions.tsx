import {IPosition} from "../editor/Types.ts";
import {ISuggestion} from "../editor/Types.ts";
import "./Styles.css"

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
        {matchSuggestions.map((result, index) => (
          <li
            key={index}
            id={`suggestions${index + 1}`}
            className={selectedIndex === index ? "selected" : ""}
            onMouseDown={(e) =>
            {
              e.preventDefault();
              renderSuggestion(result);
            }}
            onMouseEnter={(e) =>
            {
              e.preventDefault();
              setSelectedIndex(index);
            }}
          >
            {result.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
