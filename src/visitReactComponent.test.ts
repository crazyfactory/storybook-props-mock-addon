import * as path from "path";
import * as ts from "typescript";
import {visitReactComponent} from "./visitReactComponent";

describe("visitReactComponent", () => {
  it("can get translation properties", () => {
    const sourceFile = path.resolve(__dirname, "../mocks/Simple.ts");
    const program = ts.createProgram([sourceFile], {jsx: ts.JsxEmit.React});
    const map = new Map();
    for (const sourceFile of program.getSourceFiles()) {
      visitReactComponent(sourceFile, program.getTypeChecker(), map);
    }
    expect(map.get("Simple")).toEqual(new Set(["a", "b", "c"]));
  });

  it("can infer utility translation properties", () => {
    const sourceFile = path.resolve(__dirname, "../mocks/Infer.ts");
    const program = ts.createProgram([sourceFile], {jsx: ts.JsxEmit.React});
    const map = new Map();
    for (const sourceFile of program.getSourceFiles()) {
      visitReactComponent(sourceFile, program.getTypeChecker(), map);
    }
    expect(map.get("Infer")).toEqual(new Set(["age", "firstName", "lastName"]));
  });

  it("can infer extended translation properties", () => {
    const sourceFile = path.resolve(__dirname, "../mocks/Extend.ts");
    const program = ts.createProgram([sourceFile], {jsx: ts.JsxEmit.React});
    const map = new Map();
    for (const sourceFile of program.getSourceFiles()) {
      visitReactComponent(sourceFile, program.getTypeChecker(), map);
    }
    expect(map.get("Extend")).toEqual(new Set(["a", "b", "c", "d", "e"]));
  });

  it("can infer nested translation properties", () => {
    const sourceFile = path.resolve(__dirname, "../mocks/Nested.ts");
    const program = ts.createProgram([sourceFile], {jsx: ts.JsxEmit.React});
    const map = new Map();
    for (const sourceFile of program.getSourceFiles()) {
      visitReactComponent(sourceFile, program.getTypeChecker(), map);
    }
    expect(map.get("Nested")).toEqual(new Set(["a", "b", "c", "d", "e", "f"]));
  });

  it("does not throw when there's no props", () => {
    const sourceFile = path.resolve(__dirname, "../mocks/NoProps.ts");
    const program = ts.createProgram([sourceFile], {jsx: ts.JsxEmit.React});
    const map = new Map();
    for (const sourceFile of program.getSourceFiles()) {
      visitReactComponent(sourceFile, program.getTypeChecker(), map);
    }
    expect(map.get("NoProps")).toBeUndefined();
  });
});
