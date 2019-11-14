import * as React from "react";

export interface SimpleTranslation {
  a: string;
  b: string;
  c: string;
}

interface IProps {
  something: string;
  somethingElse: number;
  translation: SimpleTranslation;
}

export class Simple extends React.Component<IProps> {}
