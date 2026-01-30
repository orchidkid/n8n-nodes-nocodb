# n8n-nodes-nocodb

Custom n8n node for NocoDB built from the Baserow trigger example. The node supports core data APIs (records, linked records, button actions, attachment upload) from the NocoDB v3 REST API.

## Why use this over the official NocoDB node?

- **Normal human filters.** Visual AND/OR groups and 20+ operators (equals, contains, starts/ends with, in/between, etc.) instead of typing `where=` by hand. The node builds the `where` string for you.
- **Selectable return fields.** Choose which columns to return for Get/Get All to trim payloads; no need to craft query params.
- **Create/Update without JSON.** Add fields via dropdowns (with duplicate-field guarding) instead of pasting raw objects.
- **Workspaces/bases/tables by name or ID.** Dynamic dropdowns with fallback to the OSS default workspace (`nc`) when meta API is disabled.
- **Better pagination & count.** Get All follows `next` automatically; Count supports the same visual filters.
- **Extra operations.** Linked records (link/unlink/list), button actions, attachment upload (binary or base64).

## Features

- Create, update, delete, get and list table records
- Count records with `where` filters and optional view
- Link, unlink and list linked records for `Link to another record` fields
- Trigger button column actions (AI / webhook buttons) for up to 25 rows
- Upload attachments (base64 or binary input) into an attachment field
- Dynamic dropdowns for bases, tables, fields (including link & button fields) via loadOptions, similar to the Baserow node

## Setup

1. In **Settings → Community Nodes** install this folder or pack it as an npm package (`n8n-nodes-nocodb`).
2. Add **NocoDB API** credentials: host (e.g. `https://app.nocodb.com`) and either API token (`xc-token`) or bearer token.
3. Drop the **NocoDB** node into your workflow, choose a resource & operation, then provide `baseId` and `tableId` (or `modelId` for attachments). Use expressions to reuse upstream data.

## Notes

- The node mirrors the endpoints available in `docs/docs-openapi.json` shipped in this repo (NocoDB API v3).
- Pagination for *Get All* auto-follows `next` tokens; set `returnAll` to false with `limit` to cap results.
- Attachment upload accepts binary items (`binary.data`) or raw base64 strings; MIME type and filename are preserved when available.
