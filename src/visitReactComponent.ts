import * as ts from "typescript";

export function visitReactComponent(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  map: Map<string, Set<string>> = new Map()
) {
  visitReactComponentNode(sourceFile);
  return map;

  function visitReactComponentNode(node: ts.Node) {
    if (ts.isClassDeclaration(node) && node.heritageClauses) {
      node.heritageClauses.forEach((heritageClause) => {
        const propInterface = heritageClause && heritageClause.types && heritageClause.types[0].typeArguments
          ? heritageClause.types[0].typeArguments[0]
          : null;
        if (
          propInterface
          && heritageClause.getText(sourceFile).indexOf("extends") !== -1
          && ts.isExpressionWithTypeArguments(heritageClause.types[0])
          && ts.isPropertyAccessExpression(heritageClause.types[0].expression)
          && heritageClause.types[0].expression.getText(sourceFile).indexOf("React.Component") !== -1
          && ts.isTypeReferenceNode(propInterface)
        ) {
          const componentName = node.name.getText(sourceFile);
          const properties = checker.getPropertiesOfType(checker.getTypeAtLocation(propInterface.typeName));
          const translations = getTranslationPropertiesRecursively(properties, componentName);
          map.set(componentName, new Set(translations.map((t) => t.getName())));
        }
      });
    }

    ts.forEachChild(node, visitReactComponentNode);

    function getTranslationPropertiesRecursively(properties: ts.Symbol[], componentName: string): ts.Symbol[] {
      let translations: ts.Symbol[] = [];
      properties.forEach((property) => {
        if (property.getName() === "translation") {
          translations = translations.concat(
            checker.getPropertiesOfType(checker.getTypeAtLocation(property.valueDeclaration))
          );
        }
        // type object has symbol
        else if (checker.getTypeAtLocation(property.valueDeclaration).getSymbol()){
          translations = translations.concat(getTranslationPropertiesRecursively(
            checker.getPropertiesOfType(checker.getTypeAtLocation(property.valueDeclaration)), componentName
          ));
        }
      });
      return translations;
    }
  }
}
