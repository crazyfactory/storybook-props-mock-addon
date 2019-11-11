## Only `translation` can be mocked for now

It will generate translation based on `translation` prop's keys.

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

CustomerInfo.tsx
```typescript
  import * as React from "react";
  interface IProps {
    firstName: string;
    lastName: string;
    translation: {
      firstName: string;
      lastName: string;
    }
  }
  export class CustomerInfo extends React.Component<IProps> {
    public render(): JSX.Element {
      const {firstName, lastName, translation} = this.props;
      return (
        <div>
          <div>
            {translation.firstName}: {firstName}
          </div>
          <div>
            {translation.lastName}: {lastName}
          </div>
        </div>
      );
    }
  }
```

CustomerInfo.stories.tsx
```typescript
  import * as React from "react";
  import {CustomerInfo} from "./CustomerInfo";
  
  export default {
    component: CustomerInfo,
    title: "CustomerInfo"
  }
  
  export const Simple = ({mockedTranslation}) => (
    <CustomerInfo firstName={"John"} lastName={"Lee"} translation={mockedTranslation}/>
  );
```

Then run storybook, the addon will generate translation for you by pascalizing translation keys
![image](https://user-images.githubusercontent.com/13611391/68566442-ec9d0c00-0488-11ea-9550-67ce15efa3f8.png)
