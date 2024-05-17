import React from "react";
import "./Styles.css";

export default function Hashtag(props: {
  children: React.ReactNode
})
{
  return (
    <span className={"hashTag"}>
      {props.children}
    </span>
  );
}
