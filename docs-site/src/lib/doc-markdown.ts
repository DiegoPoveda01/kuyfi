/**
 * Canonical Markdown for Agents — plain Markdown documents (NOT MDX).
 * MDX = Markdown + JSX components. This layer is token-efficient Markdown
 * for LLMs/agents: Copy as Markdown, /md/<slug>.md, llms.txt.
 */

export type DocMarkdown = {
	slug: string;
	title: string;
	description: string;
	body: string;
};

function page(slug: string, title: string, description: string, body: string): DocMarkdown {
	return {slug, title, description, body: body.trim() + '\n'};
}

export const DOC_MARKDOWN: DocMarkdown[] = [
	page(
		'index',
		'KUYFI',
		'Black-box security for Soroban.',
		`# KUYFI

> v0.1.0 · OPEN SOURCE · Before the Breach.

Kuyfi analyzes deployed Soroban contracts from their on-chain interface, so you can inspect their attack surface, exercise inputs and review execution traces without requiring the source code.

## Install

\`\`\`bash
npm install -g @kuyfi/kuyfi
kuyfi
\`\`\`

## What it is

Automated **black-box** security terminal for Soroban. Layer *before* a formal audit — not a certification.

## Pipeline

1. Contract ID
2. OSINT Scanner — fetch WASM / contractspecv0
3. Reconstruct attack surface
4. Chaos Monkey — type-aware vectors
5. Simulate and classify
6. JSON / PDF SecurityReport

## Hard constraints

- Stellar **Testnet only**
- No private key persistence
- Findings are **signals**, not proven exploits
- Only test authorized contracts

## Docs map

| Page | URL |
|------|-----|
| Installation | /docs/installation |
| Quickstart | /docs/quickstart |
| Pipeline | /docs/pipeline |
| OSINT Scanner | /docs/osint-scanner |
| Chaos Monkey | /docs/chaos-monkey |
| Attack vectors | /docs/vectors |
| Findings | /docs/findings |
| Reports | /docs/reports |
| Report schema | /docs/report-schema |
| Agent setup | /docs/agent-setup |
| llms.txt | /docs/llms.txt |
`,
	),
	page(
		'installation',
		'Installation',
		'Install the kuyfi CLI globally, or run from a source checkout.',
		`# Installation

## Requirements

- Node.js ≥ 20
- npm
- Internet access to Stellar Testnet (\`https://soroban-testnet.stellar.org\`)

## Global install

\`\`\`bash
npm install -g @kuyfi/kuyfi
kuyfi
kuyfi --help
kuyfi <CONTRACT_ID> --json --pdf
\`\`\`

Package: \`@kuyfi/kuyfi\` · Command: \`kuyfi\`

## Windows / PowerShell

If \`.ps1\` is blocked:

\`\`\`powershell
kuyfi.cmd
npm.cmd install -g @kuyfi/kuyfi
\`\`\`

## From source

\`\`\`bash
git clone https://github.com/alex0tico/kuyfi.git
cd kuyfi && npm ci && npm run build
npm start
\`\`\`

## Paid scan server (optional)

\`\`\`bash
cp .env.example .env   # PAY_TO=G… public address only
npm run build
node --env-file=.env dist/server.js
\`\`\`
`,
	),
	page(
		'quickstart',
		'Quickstart',
		'From zero to a SecurityReport against a Testnet Contract ID.',
		`# Quickstart

1. Install: \`npm install -g @kuyfi/kuyfi\`
2. Get a Testnet Contract ID (\`C\` + 55 chars)
3. Interactive: \`kuyfi\` → OSINT Scanner → Chaos Monkey
4. Headless: \`kuyfi <CONTRACT_ID> --json --pdf\`

**Authorization required.** Chaos Monkey submits real Testnet transactions.

## Mental model

\`\`\`
Contract ID → OSINT → Chaos Monkey → classify → SecurityReport
\`\`\`
`,
	),
	page(
		'pipeline',
		'Pipeline',
		'From Contract ID to execution evidence.',
		`# Pipeline

## From Contract ID to execution evidence

1. **INPUT** — Contract ID
2. **OSINT SCANNER** — Fetch deployed WASM / specification
3. **RECONSTRUCT** — Attack surface (functions, params, UDTs)
4. **CHAOS MONKEY** — Type-aware vectors
5. **SIMULATE** — Simulate and classify DiagnosticEvent traces
6. **OUTPUT** — JSON / PDF report

The OSINT Scanner maps functions, arguments and UDTs first. Chaos Monkey generates type-aware inputs, simulates execution and classifies traces. When execution reaches the network, Kuyfi preserves transaction evidence alongside the report.

UI ≠ engine: TUI and headless CLI share \`source/modules/\`.
`,
	),
	page(
		'osint-scanner',
		'OSINT Scanner',
		'Map attack surface from WASM alone.',
		`# OSINT Scanner

Read-only. No source, no ABI file, no author cooperation.

## Steps

1. \`getContractWasmByContractId\` (read-only RPC)
2. Decode \`contractspecv0\`
3. Build UDT registry
4. List functions + typed params

## ScanResult

\`\`\`
contractId, bytecodeSize, functions[], udtRegistry
\`\`\`

## Error codes

- \`CONTRACT_NOT_FOUND\`
- \`XDR_ALIGN_FAILURE\`
- \`RPC_UNAVAILABLE\`
- \`UNKNOWN\`

Switch on \`ScanError.code\` — never parse \`message\` text.

Paid HTTP: \`GET /scan/:id\` (x402) — scanner only, never Chaos Monkey.
`,
	),
	page(
		'chaos-monkey',
		'Chaos Monkey',
		'Type-aware fuzzing — simulate first.',
		`# Chaos Monkey

Not random dumb fuzzing. Type-aware attack values; one variable at a time.

## Execution

\`\`\`
vector → simulate
  fail → classify diagnostics (nothing sent)
  ok   → sign ephemeral Friendbot key → broadcast Testnet → poll → classify
\`\`\`

**Type-correct ≠ semantically valid.** Random Address ≠ admin.

## Five families

1. Math / boundary
2. Authorization / access control
3. Call ordering
4. Fee / BPS
5. Liquidity ratio

See full catalog: /docs/vectors

Keys never persisted. Testnet only.
`,
	),
	page(
		'vectors',
		'Attack vectors reference',
		'Complete Chaos Monkey vector catalog.',
		`# Attack vectors reference

## Math / boundary (\`fuzzer_math.ts\`)

OAT mutations. Labels: \`ZERO\`, \`ONE\`, \`NEG_ONE\`, \`MAX_*\`/\`MIN_*\`, \`RANDOM_ADDR_A/B\`, \`EMPTY_BYTES\`, \`EMPTY_VEC\`, \`NONE\`, recursive UDTs. Names like \`amount::MAX_I128\`.

## Authorization (\`fuzzer_access.ts\`)

| Vector | Targets |
|--------|---------|
| \`UNAUTHORIZED_CALL\` | Admin-pattern names |
| \`REINIT_ATTACK\` | initialize / init / setup |
| \`SELF_CALL_ATTACK\` | set_admin family |
| \`UNAUTHORIZED_ADDR_CALL\` | Non-admin + Address param |

Admin substrings: pause, unpause, initialize, init, setup, upgrade, set_admin, set_pending_admin, transfer_admin, emergency.

## Call ordering

\`REINIT_SEQUENCE\`, \`REPEATED_WITHDRAW_SEQUENCE\`, \`REPEATED_CLAIM_SEQUENCE\`

## Fee / BPS

\`BPS_*\`: 0, 1, 9999, 10000, 10001, type max

## Liquidity

\`ZERO_A_MAX_B\`, \`MAX_A_MAX_B\`, … on swap/reserve-shaped names
`,
	),
	page(
		'findings',
		'Findings & signals',
		'Six-signal taxonomy.',
		`# Findings & signals

Findings are **leads**, not verdicts. Zero findings ≠ secure.

## Signals

| Signal | In findings list? |
|--------|-------------------|
| \`SECURE\` | No (counters only) |
| \`PRECONDITION_FAIL\` | No (counters only) |
| \`UNEXPECTED_ERROR\` | Yes · MEDIUM |
| \`POTENTIAL_VULN\` | Yes · CRITICAL if admin name else HIGH |
| \`UNCONTROLLED_PANIC\` | Yes · MEDIUM |
| \`TIMEOUT\` | Yes · LOW |

\`POTENTIAL_VULN\` = investigate-first, **not** a confirmed exploit.

IDs: \`KYF-NNN\`. Traces from DiagnosticEvents.
`,
	),
	page(
		'reports',
		'Reports',
		'JSON/PDF from one SecurityReport.',
		`# Reports

One \`SecurityReport\` (\`schemaVersion: "1.0.0"\`). JSON and PDF are the same object.

## Evidence

- Run-wide counters
- Per-finding simulation/broadcast + trace
- Hash, ledger, stellar.expert URL when broadcast
- \`verificationTransactions\` sample (first success + first fail)

TUI: \`[J]\` \`[P]\` \`[B]\` · CLI: \`--json\` \`--pdf\`

Schema details: /docs/report-schema
`,
	),
	page(
		'report-schema',
		'Report schema',
		'SecurityReport 1.0.0 field map.',
		`# Report schema

\`schemaVersion\` is independent of npm \`tool.version\`.

## Top-level

\`schemaVersion\`, \`reportId\`, \`generatedAt\`, \`tool\`, \`target\`, \`scan\`, \`execution\`, \`summary\`, \`findings\`

## Findings

\`id\`, \`functionName\`, \`vectorName\`, \`signal\`, \`severity\`, \`details\`, \`evidence\`

Gate parsers on \`schemaVersion === "1.0.0"\`.
Do not auto-fail CI as “CVE confirmed” on \`POTENTIAL_VULN\`.
`,
	),
	page(
		'cli',
		'CLI reference',
		'kuyfi and kuyfi-server.',
		`# CLI reference

## Binaries

- \`kuyfi\` → \`dist/cli.js\`
- \`kuyfi-server\` → \`dist/server.js\`

## Usage

\`\`\`bash
kuyfi
kuyfi <CONTRACT_ID>
kuyfi <CONTRACT_ID> --json --pdf
\`\`\`

Contract ID: \`/^C[A-Z0-9]{55}$/\`

RPC: \`https://soroban-testnet.stellar.org\` (hardcoded)
`,
	),
	page(
		'tui',
		'Interactive TUI',
		'Ink terminal UI.',
		`# Interactive TUI

1. OSINT Scanner
2. Chaos Monkey
3. System Logs
4. About

Layout: large (≥100 cols) / compact / tooSmall.
Exports: \`[J]\` JSON · \`[P]\` PDF · \`[B]\` both.
`,
	),
	page(
		'paid-api',
		'Paid scan API',
		'x402 OSINT endpoint.',
		`# Paid scan API

\`\`\`
GET /scan/<CONTRACT_ID>
  → 402 Payment Required
  → 200 OK (scan surface)
\`\`\`

**Scanner only.** Chaos Monkey never over HTTP.

Env: \`PAY_TO\` (public G…), \`PRICE\` (default \`500 CLP\`), \`NETWORK\`, \`PORT\` (4021).
`,
	),
	page(
		'architecture',
		'Architecture',
		'UI vs audit engine.',
		`# Architecture

\`\`\`
cli.tsx → TUI | headless
         ↓
source/modules/  scanner → chaos_monkey → security_report → export
\`\`\`

Security: no key storage · Testnet only · paid endpoint scan-only · simulate-before-broadcast.
`,
	),
	page(
		'glossary',
		'Glossary',
		'Soroban + Kuyfi terms.',
		`# Glossary

- **Black-box** — no source; WASM + contractspec + runtime only
- **Contract ID** — \`C\` + 55 chars
- **contractspecv0** — on-chain function/type interface
- **UDT** — user-defined type (struct/enum/union)
- **DiagnosticEvent** — RPC trace evidence
- **Friendbot** — Testnet faucet for ephemeral keys
- **SecurityReport** — schemaVersion 1.0.0 JSON/PDF
- **Finding** — filtered signal; not a CVE
- **Vector** — one named attack attempt
- **Markdown for Agents** — plain Markdown for LLMs (not MDX)
`,
	),
	page(
		'troubleshooting',
		'Troubleshooting',
		'Common failures.',
		`# Troubleshooting

## Scanner

| Code | Try |
|------|-----|
| CONTRACT_NOT_FOUND | Confirm Testnet deploy / typo |
| RPC_UNAVAILABLE | Network / retry |
| XDR_ALIGN_FAILURE | Need standard contractspecv0 |

## Chaos Monkey

Many PRECONDITION results = normal (ephemeral account not authorized).
Zero findings ≠ secure.

## Windows

Use \`kuyfi.cmd\` if PowerShell blocks \`.ps1\`.
`,
	),
	page(
		'changelog',
		'Changelog',
		'Release notes.',
		`# Changelog

## Unreleased

- kuyfi-server paid OSINT scan (x402 / Local402)

## 0.1.0 — 2026-09-20

OSINT Scanner, Chaos Monkey (5 families), SecurityReport JSON/PDF, headless CLI, npm \`@kuyfi/kuyfi\`, responsive TUI.

Canonical: https://github.com/alex0tico/kuyfi/blob/main/CHANGELOG.md
`,
	),
	page(
		'for-llms',
		'For LLMs & agents',
		'Agent ingestion guide.',
		`# For LLMs & agents

> Prefer **Markdown for Agents** (plain Markdown). This is **not** MDX.
> MDX = Markdown + JSX components — a authoring format, not an agent feed.

## Ingest order

1. \`/docs/llms.txt\`
2. \`/docs/llms-full.txt\`
3. Per-page Markdown: \`/docs/md/<slug>.md\` or **Copy as Markdown** on any HTML page
4. HTML only if you need the visual UI

## Rules

- Testnet only
- Findings = signals
- Prefer \`kuyfi <ID> --json\`
- Do not invent Mainnet or live MCP tools

See also: /docs/agent-setup
`,
	),
	page(
		'agent-setup',
		'Agent setup',
		'Markdown for Agents — how coding agents should read Kuyfi docs.',
		`# Agent setup

How Cursor, Copilot, Claude Code, and similar tools should consume Kuyfi documentation.

## Terminology (important)

| Term | Meaning |
|------|---------|
| **Markdown for Agents** | Plain Markdown optimized for LLMs — fewer tokens than HTML |
| **MDX** | Markdown **+ JSX components** (authoring/UI format). **Not** what agents should ingest |
| **llms.txt** | Site index of docs for agents ([llmstxt.org](https://llmstxt.org)) |

Kuyfi docs ship **Markdown for Agents**. We do **not** call that MDX.

## Ways to get Markdown

### 1. Copy as Markdown

On any docs HTML page, use **Copy as Markdown** (page options). Paste into your agent chat.

### 2. View / fetch \`.md\`

Every page has a Markdown twin:

\`\`\`
https://kuyfi.vercel.app/docs/md/<slug>.md
\`\`\`

Examples:

\`\`\`bash
curl -sL https://kuyfi.vercel.app/docs/md/chaos-monkey.md
curl -sL https://kuyfi.vercel.app/docs/md/index.md
\`\`\`

### 3. Site-wide feeds

| Endpoint | Use |
|----------|-----|
| \`/docs/llms.txt\` | Compact index + project card |
| \`/docs/llms-full.txt\` | Full operator manual in one file |

### 4. HTML (last resort)

Human UI at \`/docs/...\` — richer layout, worse token efficiency for models.

## Recommended agent bootstrap

\`\`\`text
Fetch https://kuyfi.vercel.app/docs/llms.txt then https://kuyfi.vercel.app/docs/llms-full.txt.
For a specific topic, fetch https://kuyfi.vercel.app/docs/md/<slug>.md
(e.g. vectors, findings, report-schema).
Kuyfi is Testnet-only black-box Soroban security CLI (@kuyfi/kuyfi).
Findings are signals, not formal audit results. MCP server not shipped yet.
\`\`\`

## MCP

**MCP Connect** → \`/docs/mcp#connect\` — path to wire agents to the Kuyfi MCP server.
Package \`@kuyfi/mcp\` may still be coming soon; the connect path and JSON stay stable.
`,
	),
	page(
		'mcp',
		'Conectar el MCP al server de Kuyfi',
		'Camino fijo: botón MCP Connect → config Cursor/Claude/HTTP.',
		`# Conectar el MCP al server de Kuyfi

Canonical button target: \`/docs/mcp#connect\`

Status: coming soon until \`@kuyfi/mcp\` publishes — config below is the stable contract.

## Quick (Cursor / Claude stdio)

\`\`\`json
{
  "mcpServers": {
    "kuyfi": {
      "command": "npx",
      "args": ["-y", "@kuyfi/mcp@latest"],
      "env": {
        "KUYFI_NETWORK": "stellar:testnet"
      }
    }
  }
}
\`\`\`

1. Paste into Cursor MCP settings or \`.cursor/mcp.json\`
2. Or Claude Desktop \`claude_desktop_config.json\`
3. Reload MCP / restart the app
4. Confirm tools \`kuyfi_*\` appear

## Remote HTTP (when hosted)

\`\`\`json
{
  "mcpServers": {
    "kuyfi": {
      "url": "https://mcp.kuyfi.vercel.app/mcp",
      "headers": {}
    }
  }
}
\`\`\`

stdio = local (Chaos Monkey opt-in). HTTP = remote read-oriented tools.

## Tools

- \`kuyfi_scan\` — OSINT surface
- \`kuyfi_audit\` — Chaos Monkey (confirm; Testnet)
- \`kuyfi_report_schema\` — SecurityReport 1.0.0
- \`kuyfi_signals\` — taxonomy

## Fallback without MCP

\`\`\`bash
npm install -g @kuyfi/kuyfi
kuyfi <CONTRACT_ID> --json
\`\`\`

Markdown for Agents: /docs/agent-setup
`,
	),
	page(
		'responsible-use',
		'Responsible use',
		'Authorization required.',
		`# Responsible use

- Only contracts you own or have written authorization to test
- Testnet only
- Findings ≠ certification
- Unauthorized fuzzing may be illegal / ToS violation

License: MIT. Not affiliated with the Stellar Development Foundation.
`,
	),
	page(
		'faq',
		'FAQ',
		'Common questions.',
		`# FAQ

**Auditor?** No — pre-audit black-box tooling.

**Need Rust source?** No.

**Mainnet?** No — Testnet only.

**POTENTIAL_VULN?** Investigate-first signal, not a confirmed exploit.

**Chaos Monkey on paid API?** No.

**Markdown vs MDX?** Agents should use plain Markdown (\`/docs/md/*.md\`, Copy as Markdown, llms.txt). MDX is JSX-in-Markdown for UI authoring — different thing.

**Agents:** /docs/agent-setup
`,
	),
];

const bySlug = new Map(DOC_MARKDOWN.map((d) => [d.slug, d]));

export function getDocMarkdown(slug: string): DocMarkdown | undefined {
	const key = slug.replace(/^\//, '').replace(/\/$/, '') || 'index';
	return bySlug.get(key);
}

export function listDocMarkdown(): DocMarkdown[] {
	return DOC_MARKDOWN;
}

/** Full Markdown document with YAML-ish header for agents. */
export function renderDocMarkdownFile(doc: DocMarkdown): string {
	return [
		'---',
		`title: ${JSON.stringify(doc.title)}`,
		`description: ${JSON.stringify(doc.description)}`,
		`slug: ${JSON.stringify(doc.slug)}`,
		'source: kuyfi-docs',
		'format: markdown-for-agents',
		'note: "Plain Markdown for LLMs/agents — NOT MDX (Markdown+JSX)."',
		'---',
		'',
		doc.body,
	].join('\n');
}

/** Slug from a docs pathname (with or without /docs base). */
export function slugFromPathname(pathname: string, base = '/docs'): string {
	let path = pathname;
	const b = base.replace(/\/$/, '');
	if (path.startsWith(b)) path = path.slice(b.length) || '/';
	path = path.replace(/\/$/, '') || '/';
	if (path === '/' || path === '') return 'index';
	return path.replace(/^\//, '');
}
