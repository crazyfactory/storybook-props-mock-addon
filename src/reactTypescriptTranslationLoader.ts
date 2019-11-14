import * as fs from "fs";
import * as path from "path";
import {ComponentDoc, FileParser, withDefaultConfig} from "react-docgen-typescript";
import * as ts from "typescript";
import * as webpack from "webpack";
import {visitReactComponent} from "./visitReactComponent";

interface TSFile {
  text?: string;
  version: number;
}

let languageService: ts.LanguageService | null = null;
const files: Map<string, TSFile> = new Map<string, TSFile>();

export default function loader(
  this: webpack.loader.LoaderContext,
  source: string,
) {
  const callback = this.async();

  try {
    const newSource = processResource(this, source);

    if (!callback) return newSource;
    callback(null, newSource);
    return;
  } catch (e) {
    if (callback) {
      callback(e);
      return;
    }
    throw e;
  }
}

function processResource(context: webpack.loader.LoaderContext, source: string) {
  context.cacheable(true);

  const tsConfigFile = ts.parseJsonConfigFileContent({}, ts.sys, path.dirname(context.context), {});
  loadFiles(tsConfigFile.fileNames);

  if (!languageService) {
    const servicesHost = createServiceHost({allowJs: true, jsx: ts.JsxEmit.React}, files);
    languageService = ts.createLanguageService(
      servicesHost,
      ts.createDocumentRegistry(),
    );
  }
  const program = languageService.getProgram();
  const checker = program.getTypeChecker();
  const componentTranslationsMap: Map<string, Set<string>> = new Map<string, Set<string>>();
  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      visitReactComponent(sourceFile, checker, componentTranslationsMap);
    }
  }

  const parser: FileParser = withDefaultConfig();
  const componentDocs = parser.parseWithProgramProvider(context.resourcePath, () => languageService.getProgram());
  const codeBlocks = componentDocs.map((componentDoc) => {
    const translationProperties: string[] = Array.from(componentTranslationsMap.get(componentDoc.displayName) || []);
    if (translationProperties.length) {
      return getTranslationPropertiesStatement(componentDoc, translationProperties);
    }
  });
  const sourceFile = ts.createSourceFile(context.resourcePath, source, ts.ScriptTarget.ESNext);
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

function loadFiles(filesToLoad: string[]): void {
  filesToLoad.forEach(filePath => {
    const normalizedFilePath = path.normalize(filePath);
    const file = files.get(normalizedFilePath);
    const text = fs.readFileSync(normalizedFilePath, "utf-8");

    if (!file) {
      files.set(normalizedFilePath, {
        text,
        version: 0,
      });
    } else if (file.text !== text) {
      files.set(normalizedFilePath, {
        text,
        version: file.version + 1,
      });
    }
  });
}

function createServiceHost(
  compilerOptions: ts.CompilerOptions,
  files: Map<string, TSFile>,
): ts.LanguageServiceHost {
  return {
    getScriptFileNames: () => {
      return Array.from(files.keys());
    },
    getScriptVersion: fileName => {
      const file = files.get(fileName);
      return (file && file.version.toString()) || "";
    },
    getScriptSnapshot: fileName => {
      if (!fs.existsSync(fileName)) {
        return undefined;
      }

      let file = files.get(fileName);

      if (file === undefined) {
        const text = fs.readFileSync(fileName).toString();

        file = { version: 0, text };
        files.set(fileName, file);
      }

      return ts.ScriptSnapshot.fromString(file!.text!);
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => compilerOptions,
    getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
  };
}
