import {pascalizeStr} from "@crazyfactory/frontend-commons/lib/helpers/pascalize";

export function withMockedTranslation(): (
  story: (...args: any) => JSX.Element,
  context: any
) => JSX.Element {
  return (story, context) => {
    const mockedTranslation = {};
    const translationProperties = context.parameters.component.__translationProperties;
    if (translationProperties) {
      for (const translationProperty of translationProperties) {
        mockedTranslation[translationProperty] = pascalizeStr(translationProperty);
      }
    }
    return story({...context, mockedTranslation});
  };
}
