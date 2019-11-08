import * as path from "path";
import {ComponentDoc, FileParser, withDefaultConfig} from "react-docgen-typescript";
import * as ts from "typescript";
import * as webpack from "webpack";

let program: ts.Program;
const componentTranslationsMap: Map<string, Set<string>> = new Map<string, Set<string>>();

function visitReactComponent(sourceFile: ts.SourceFile, checker: ts.TypeChecker) {
  visitReactComponentNode(sourceFile);

  function visitReactComponentNode(node: ts.Node) {
    if (ts.isClassDeclaration(node)) {
      node.heritageClauses.forEach((heritageClause) => {
        const propInterface = heritageClause && heritageClause.types && heritageClause.types[0].typeArguments
          ? heritageClause.types[0].typeArguments[0]
          : null;
        if (
          heritageClause.getText(sourceFile).indexOf("extends") !== -1
          && ts.isExpressionWithTypeArguments(heritageClause.types[0])
          && ts.isPropertyAccessExpression(heritageClause.types[0].expression)
          && heritageClause.types[0].expression.getText(sourceFile).indexOf("React.Component") !== -1
          && ts.isTypeReferenceNode(propInterface)
        ) {
          const componentName = node.name.getText(sourceFile);
          const properties = checker.getPropertiesOfType(checker.getTypeAtLocation(propInterface.typeName));
          properties.forEach((property) => {
            if (property.getName() === "translation") {
              const translations = checker.getPropertiesOfType(checker.getTypeAtLocation(property.valueDeclaration));
              componentTranslationsMap.set(componentName, new Set(translations.map((t) => t.getName())));
            }
          });
        }
      });
    }

    ts.forEachChild(node, visitReactComponentNode);
  }
}

export default function loader(this: webpack.loader.LoaderContext, source: string) {
  if (!program) {
    const tsConfigFile = ts.parseJsonConfigFileContent({}, ts.sys, path.dirname(this.context), {});
    program = ts.createProgram(tsConfigFile.fileNames, {jsx: ts.JsxEmit.React});
    const checker = program.getTypeChecker();
    for (const sourceFile of program.getSourceFiles()) {
      if (!sourceFile.isDeclarationFile) {
        visitReactComponent(sourceFile, checker);
      }
    }
  }
  const parser: FileParser = withDefaultConfig();
  const componentDocs = parser.parseWithProgramProvider(this.resourcePath, () => program);
  const codeBlocks = componentDocs.map((componentDoc) => {
    const translationProperties: string[] = Array.from(componentTranslationsMap.get(componentDoc.displayName) || []);
    if (translationProperties.length) {
      return getTranslationPropertiesStatement(componentDoc, translationProperties);
    }
  });
  const sourceFile = ts.createSourceFile(this.resourcePath, source, ts.ScriptTarget.ESNext);
  const printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed});
  const printNode = (sourceNode: ts.Node) => printer.printNode(ts.EmitHint.Unspecified, sourceNode, sourceFile);
  return codeBlocks.reduce((acc, node) => node ? acc + printNode(node) : acc, source);
}

function getTranslationPropertiesStatement(componentDoc: ComponentDoc, translationProperties: string[]): ts.Statement {
  return insertTsIgnoreBeforeStatement(
    ts.createExpressionStatement(
      ts.createBinary(
        ts.createPropertyAccess(
          ts.createIdentifier(componentDoc.displayName),
          ts.createIdentifier("__translationProperties")
        ),
        ts.SyntaxKind.EqualsToken,
        ts.createArrayLiteral(translationProperties.map((p) => ts.createStringLiteral(p)))
      )
    )
  )
}

function insertTsIgnoreBeforeStatement(statement: ts.Statement): ts.Statement {
  ts.setSyntheticLeadingComments(statement, [
    {
      text: " @ts-ignore", // leading space is important here
      kind: ts.SyntaxKind.SingleLineCommentTrivia,
      pos: -1,
      end: -1,
    },
  ]);
  return statement;
}
