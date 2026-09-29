# Meet Chat Blocker

A Chrome extension (Manifest V3, TypeScript) that does one thing: it turns off in-call chat in Google Meet for you.

- **No incoming-message popups.** The toast that shows the sender and text never appears.
- **No unread badge.** The dot on the chat button is hidden.
- **Chat button greyed out.** It can't be clicked, tabbed to, or opened with the `⌘+Ctrl+C` / `Ctrl+Alt+C` shortcut.
- **Chat panel locked.** If the panel is open anyway, its contents are blurred, greyed and made `inert`, under a "Chat is disabled" overlay with a button to close it.
- **No screen-reader chat alerts.** Meet's "*name* says in chat: …" announcements are cleared.

Other people in the meeting are unaffected. You can turn blocking on or off from the toolbar popup at any time, with no page reload.

## Install

```sh
npm install
npm run build
```

Then open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and select the `dist/` folder.

`npm run package` type-checks, builds and zips `dist/` into `meet-chat-blocker.zip`.

## How it works

The Meet UI hooks were found by driving a live meeting with Playwright: two signed-in accounts, one sending chat messages to the other, with a `MutationObserver` recording what changed on the receiving side.

| Chat UI | Hook | Handling |
| --- | --- | --- |
| Chat toolbar button | `button[data-panel-id="2"]` | greyed out; trusted clicks, keys and the shortcut are swallowed |
| Unread dot | sibling of the button's `span[data-is-tooltip-wrapper]` | hidden |
| Message popup | `[jsname="JDWQFb"]` | hidden |
| Chat panel | `aside` inside the element named by the button's `aria-controls`, while `aria-expanded="true"` | contents `inert` and blurred, with an overlay |
| Screen-reader alert | `[data-mdc-dom-announce]` containing "says in chat" | cleared |

Static hiding lives in `public/content.css`, which is injected at `document_start` so nothing flashes on screen. `src/content.ts` handles the rest.

Meet's class names are obfuscated and change often, so the hooks use `data-*`, `aria-*` and `jsname` attributes instead. If a Meet update breaks something, `src/selectors.ts` (and the matching rules in `public/content.css`) is the place to fix it.

## Limitations

- Only the in-call chat UI is affected. Messages are still delivered to your account, and Meet may show them in chat history after the call if continuous chat is on.
- The screen-reader filter matches Meet's English announcement text only. All visual blocking works in any language.

## License

MIT
