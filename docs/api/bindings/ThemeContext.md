# ThemeContext

ThemeContext is the internal instance of `React.createContext` that is provided by the new [Context API](https://facebook.github.io/react/docs/context.html). It is exposed to be used with React's new [useContext API](https://reactjs.org/docs/hooks-reference.html#usecontext).

> **Note**: Although it is exposed for react-fela as well as preact-fela and inferno-fela, there are no useContext equivalents for the latter yet.

## Imports
```javascript
import { ThemeContext } from 'react-fela'
import { ThemeContext } from 'preact-fela'
import { ThemeContext } from 'inferno-fela'
```

## Example
```javascript
import { useContext } from 'react'
import { ThemeContext } from 'react-fela'

function Button() {
  const theme = useContext(ThemeContext)
  // do something with the theme
}
```