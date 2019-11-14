import * as React from "react";

export interface Nested {
  translation: {
    a: string;
    b: string;
  }
}

export interface DoubleNested {
  something: {
    translation: {
      c: string;
      d: string;
    }
  }
}

export interface TripNested {
  something: {
    somethingElse: {
      translation: {
        e: string;
        f: string;
      }
    }
  }
}

interface IProps {
  nested: Nested;
  doubleNested: DoubleNested;
  tripleNested: TripNested;
}

export class Nested extends React.Component<IProps> {}
