import * as React from "react";

interface Customer {
  age: number;
  firstName: string;
  lastName: string;
}

interface IProps {
  something: string;
  somethingElse: number;
  translation: Record<keyof Customer, string>;
}

export class Infer extends React.Component<IProps> {}
