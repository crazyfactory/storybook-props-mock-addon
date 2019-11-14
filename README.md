## Only `translation` can be mocked for now

It will generate translation based on `translation` prop's keys. Nested translation is also supported.

### Usage

webpack.config.js
```javascript
  loader: path.resolve('./node_modules/@crazyfactory/storybook-props-mock-addon/lib/reactTypescriptTranslationLoader.js')
```

config.js
```javascript
  import {withMockedTranslation} from "@crazyfactory/storybook-props-mock-addon/lib/withMockedTranslation";
  addDecorator(withMockedTranslation());
```

story files
```typescript
  export const Simple = ({mockedTranslation}) => (
    // pass mockedTranslation to translation prop
  );
```

### Example

Age.tsx
```typescript jsx
  import * as React from "react";
  export interface AgeProps {
    age: number;
    translation: {
      age: string;
    };
  }

  export const Age = ({age, translation}: AgeProps) => (
    <div>
      {translation.age}: {age}
    </div>
  );
```

CustomerInfo.tsx
```typescript jsx
  import * as React from "react";
  import {Age, AgeProps} from "./Age";
  interface CustomerInfoProps {
    ageProps: AgeProps;
    firstName: string;
    lastName: string;
    translation: {
      firstName: string;
      lastName: string;
    };
  }
  export class CustomerInfo extends React.Component<CustomerInfoProps> {
    public render(): JSX.Element {
      const {ageProps, firstName, lastName, translation} = this.props;
      return (
        <div>
          <div>
            {translation.firstName}: {firstName}
          </div>
          <div>
            {translation.lastName}: {lastName}
          </div>
          <Age {...ageProps}/>
        </div>
      );
    }
  }
```

CustomerInfo.stories.tsx
```typescript jsx
  import * as React from "react";
  import {CustomerInfo} from "./CustomerInfo";
  
  export default {
    component: CustomerInfo,
    title: "CustomerInfo"
  };
  
  export const Simple = ({mockedTranslation}) => (
    <CustomerInfo
      ageProps={{age: 10, translation: mockedTranslation}}
      firstName={"John"}
      lastName={"Lee"}
      translation={mockedTranslation}
    />
  );
```

Then run storybook, the addon will generate translation for you by pascalizing translation keys
![image](https://user-images.githubusercontent.com/13611391/68833327-caec9080-06e5-11ea-8120-55a6c97e5f23.png)
