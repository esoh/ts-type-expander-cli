# @esoh/ts-type-expander-cli

A CLI tool to print full expanded version of TypeScript exported types. This is useful for debugging and understanding complex TypeScript types.

## Installation

```bash
npm install -g @esoh/ts-type-expander-cli
```

## Usage

```bash
ts-type-expander <file> <typeName>
```

### Arguments

- `file`: Path to the TypeScript file containing the type
- `typeName`: Name of the exported type to expand

### Example

Given a file `types.ts`:
```typescript
export type User = {
  id: number;
  name: string;
  settings: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
};
```

Run:
```bash
ts-type-expander types.ts User
```

Output:
```
🧾 Expanded Type:

{
  id: number;
  name: string;
  settings: {
    theme: "light" | "dark";
    notifications: boolean;
  };
}
```

## Features

- Expands complex TypeScript types
- Handles nested objects, arrays, tuples, and unions
- Sorts object properties alphabetically
- Preserves type information
- Works with your project's tsconfig.json

## License

MIT 