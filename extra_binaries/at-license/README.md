# AT License Windows helper

Place the Windows `lccinspector.exe` built from the internal `AT_License` repository in this directory.

The Electron main process executes:

```text
lccinspector.exe --json
```

The helper must be built from the same `AT_License` source version used by the license issuer. Fingerprint algorithms can change between library versions and are not assumed to be backward compatible.

For local development, the binary path can be overridden with `AT_LICENSE_INSPECTOR_PATH`.

