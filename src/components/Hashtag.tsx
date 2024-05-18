import React from "react";
import "./ComponentStyles.css";

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
