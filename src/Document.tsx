import { Body, Head, Html, Root } from '@modern-js/runtime/document';

// Modern.js renders this template at build time, outside the client React tree.
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <Body>
        <Root />
        <noscript>
          This election dashboard needs JavaScript to load its public data and interactive map.
        </noscript>
      </Body>
    </Html>
  );
}
