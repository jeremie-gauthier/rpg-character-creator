---
name: create-react-component
description: Create React component that respect the architecture. Use when creating or refactoring React components.
---

When creating React components, respect the following rules:

- one and only one React component per file, NO EXCEPTION ;
- when rendering list of components via the map method, move the child component to another file ;

When creating a new file for a React component, respect the following rules:

- nest the file so that it respect a feature-based architecture ;
- each file is in a nested folder to clearly identify root components ;
- files and components inside them are ALWAYS named like their relative folder ;
- reusable components lives in a "common/" folder, scoped to the narrowest feature-level ;
- components in a deeper level of nesting cannot import the ones above (except the common components) ;

This create a natural hierarchy that flow in a one-way direction. Only the direct parent components can access the children components. The sibling ones cannot.

Example, with an hypothetic "timeline" feature that should render actors:

timeline
├── timeline.component.tsx                        <-- this is the root component. Only this one can be imported to be rendered in a page.
├── timeline-slot/
│   └── timeline-slot.component.tsx               <-- this is a child component. This one CAN ONLY be imported in timeline.component.tsx.
├── common/
│   ├── imaginary-helper.util.ts                  <-- this is a common util. This one can be imported everywhere within the "timeline" feature.
│   └── imaginary-reused-component.component.tsx  <-- this is a common component. This one can be imported everywhere within the "timeline" feature.
└── imaginary-custom-hook.hook.ts                 <-- this is a custom hook. This one CAN ONLY be imported by timeline.component.tsx.
