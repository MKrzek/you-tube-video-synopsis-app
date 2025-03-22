import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="public/manifest.json" />
        <link rel="icon" href="public/icons/icon_192x192.png" />
        <meta name="theme-color" content="#f3eded" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
