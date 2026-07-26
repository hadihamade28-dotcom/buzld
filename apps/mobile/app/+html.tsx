import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const globalStyles = `
html, body, #root {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #121214;
}
body {
  display: flex;
  font-family: system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  overscroll-behavior: none;
}
#root {
  display: flex;
  flex: 1;
  min-height: 100dvh;
}
`;
