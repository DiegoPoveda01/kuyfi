# Kuyfi Docs — agent notes

This is the **public documentation website** for Kuyfi (`docs-site/`), not the CLI package and not the markdown notes in repo `docs/`.

## Facts

- Site path: `https://kuyfi.vercel.app/docs`
- Brand: dark UI, yellow CTAs (`#f5c518`), pink labels, Syne + Outfit + IBM Plex Mono
- LLM feeds: `/docs/llms.txt`, `/docs/llms-full.txt`
- MCP Connect button is a **stub** until `@kuyfi/mcp` ships — see `/docs/mcp`

## Commands

```bash
cd docs-site
npm install
npm run dev      # open /docs/
npm run build
npm run preview
```

## Do not

- Commit as a co-author / push unless the maintainer (`wrever`) asks
- Confuse this folder with `docs/` (demo writeups)
- Claim MCP tools are live
