# Desktop SSO using the default browser

Login and logout open the operating system's default browser. Electron listens on
`http://127.0.0.1:43821/oauth2/callback` for the active attempt, then closes the listener.
Each requested redirect URI includes a random `attempt` query parameter. The SSO
service must preserve it when adding `code`, `error`, or `state` to the callback.
If the authorization URL has `state`, the callback must return the same value.

Configure the Smart-SSO service/client to permit this loopback redirect, including
the per-attempt query parameter. This repository does not configure the SSO server.
The existing access-token exchange API still receives the authorization code.

Electron's embedded login window is used only if opening the default browser fails.
A login error or a five-minute timeout does not open another login window. An occupied
callback port reports an error before launching the browser. Cancel in the app closes
the listener; an already opened browser tab remains available for the user to close.

After restarting Electron, verify against the actual SSO deployment:

1. Sign in: default browser opens, successful login returns control to the app.
2. Sign out: the browser SSO session ends and the app returns to login.
3. Cancel and retry: callbacks from the previous attempt are ignored.
4. With no working browser handler, verify the embedded fallback on the target OS.

Run `node tools/check-sso-browser.js` for local HTTP tests covering callback isolation,
state matching, fallback, cancellation, timeout, logout, and an occupied port.
These tests mock browser launch and do not verify the remote SSO configuration.
