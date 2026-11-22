---
"create-adr": patch
---

`main` is now declared as a `const` arrow function in the type declarations (`export declare const main: (argv?: string[]) => void`). Calling it is unchanged, and the CLI output and generated ADR files are byte-identical; only merging a namespace into `main` stops working.
