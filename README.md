# n8n-nodes-nocodb

Custom n8n node for NocoDB. The node supports working with rows using the NocoDB v3 REST API.

## Why use this over the official NocoDB node?

- **Normal human filters.** Visual AND/OR groups and 20+ operators (equals, contains, starts/ends with, in/between, etc.) instead of typing `where=` by hand. The node builds the query string for you.
- **Selectable return fields.** Choose which columns to return for Get/Get All to trim payloads; no need to craft query params.
- **Better pagination & count.** Get All follows `next` automatically; Count supports the same visual filters.

## Features

- Create, update, delete, get and list table records
- Count records with `where` filters and optional view
- Upload attachments (base64 or binary input) into an attachment field

## Setup

1. In **Settings → Community Nodes** install this folder or pack it as an npm package (`n8n-nodes-nocodb`).
2. Add **NocoDB API** credentials: host (e.g. `https://app.nocodb.com`) and either API token (`xc-token`) or bearer token.
3. Drop the **NocoDB** node into your workflow, choose a resource & operation, then provide `baseId` and `tableId` (or `modelId` for attachments). Use expressions to reuse upstream data.

## Notes

- Pagination for *Get All* auto-follows `next` tokens; set `returnAll` to false with `limit` to cap results.
