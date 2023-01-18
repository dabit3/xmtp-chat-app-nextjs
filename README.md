## XMTP Next.js basic example

This is a rough example of how you might implement encrypted real-time messaging into a web application using XMTP, React, and Next.js

This example shows how to implement messages specific to Lens apps, but the codebase can be made agnostic to any particular app by modifying this code in `create.tsx` to use any prefix you'd like (or none at all):

```js
const PREFIX = 'lens.dev/dm'
const buildConversationId = (profileIdA: string, profileIdB: string) => {
  const profileIdAParsed = parseInt(profileIdA, 16)
  const profileIdBParsed = parseInt(profileIdB, 16)
  return profileIdAParsed < profileIdBParsed
    ? `${PREFIX}/${profileIdA}-${profileIdB}`
    : `${PREFIX}/${profileIdB}-${profileIdA}`
}
```

[XMTP](https://xmtp.org/)

[XMTP Docs](https://xmtp.org/docs/client-sdk/javascript/concepts/intro-to-sdk)

### To build this app

1. Clone the repo

```sh
git clone git@github.com:dabit3/xmtp-chat-app-nextjs.git
```

2. Change into the directory and install the dependencies:

```sh
cd xmtp-chat-app-nextjs

npm install # or yarn, pnpm, etc..
```

3. Run the app

```sh
npm run dev
```
