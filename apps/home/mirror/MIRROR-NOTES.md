# DCI Manage Reg Mirror

- Source: http://8.145.60.215:9020/dci-manage-reg/
- Downloaded: 111 files (17704453 bytes)
- index.html rewritten to relative paths: yes
- JS/CSS files with /dci-manage-reg/ prefix rewritten: 18

## How to serve

From `apps/home/mirror`:

```powershell
npx --yes serve . -p 3333
```

Then open http://localhost:3333/

Or copy `mirror/` contents to any static file server root.

## API / runtime notes

This is a static mirror of the SPA shell and assets. Backend API calls (e.g. `/prod-api/`) still target the original server unless proxied. If the app fails to load routes or data, configure your dev server to proxy API requests to http://8.145.60.215:9020.
