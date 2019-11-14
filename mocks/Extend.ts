import * as React from "react";
import {SimpleTranslation} from "./Simple";

interface ExtendTranslation extends SimpleTranslation {
  d: string;
  e: string;
}

interface IProps {
  something: string;
  somethingElse: number;
  translation: ExtendTranslation;
}

export class Extend extends React.Component<IProps> {}
