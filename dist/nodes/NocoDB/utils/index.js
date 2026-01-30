"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRequest = apiRequest;
exports.loadBases = loadBases;
exports.loadTables = loadTables;
exports.loadFields = loadFields;
exports.loadWorkspaces = loadWorkspaces;
exports.ensureBaseId = ensureBaseId;
exports.ensureTableId = ensureTableId;
exports.resolveId = resolveId;
const { NodeApiError } = require("n8n-workflow");
function resolveId(param) {
    if (param && typeof param === "object") {
        return param.value || param.id || param.name || "";
    }
    return param;
}
async function apiRequest(context, method, endpoint, body = {}, qs = {}, uri) {
    const credentials = await context.getCredentials("nocodbApi");
    const baseUrl = (credentials.host || "https://app.nocodb.com").replace(/\/+$/, "");
    const headers = { Accept: "application/json" };
    if (credentials.authMethod === "bearer") {
        if (!credentials.bearer) {
            throw new NodeApiError(context.getNode(), { message: "Bearer token is missing in credentials" });
        }
        headers.Authorization = `Bearer ${credentials.bearer}`;
    }
    else {
        if (!credentials.token) {
            throw new NodeApiError(context.getNode(), { message: "API token (xc-token) is missing in credentials" });
        }
        headers["xc-token"] = credentials.token;
    }
    const options = {
        method,
        uri: uri || `${baseUrl}${endpoint}`,
        headers,
        qs,
        body,
        json: true,
    };
    if (!Object.keys(body || {}).length) {
        delete options.body;
    }
    if (!Object.keys(qs || {}).length) {
        delete options.qs;
    }
    try {
        return await context.helpers.request(options);
    }
    catch (error) {
        throw new NodeApiError(context.getNode(), error);
    }
}
async function loadWorkspaces(context) {
    try {
        const response = await apiRequest(context, "GET", "/api/v3/meta/workspaces");
        const list = response.list || [];
        const results = list.map((ws) => ({
            name: ws.title || ws.id,
            value: ws.id,
        }));
        // Preferred single default option
        if (results.length === 0) {
            return [{ name: "Default Workspace (nc)", value: "nc" }];
        }
        return [{ name: "No Workspace", value: "" }, ...results];
    }
    catch (error) {
        // fallback: workspace API not available -> default OSS workspace 'nc'
        return [{ name: "Default Workspace (nc)", value: "nc" }];
    }
}
async function loadBases(context, workspaceId) {
    // if workspaceId provided and workspace API works, try scoped bases; else fallback to all projects
    if (workspaceId) {
        try {
            const response = await apiRequest(context, "GET", `/api/v3/meta/workspaces/${workspaceId}/bases`);
            const list = response.list || [];
            return list.map((base) => ({
                name: base.title || base.id,
                value: base.id,
            }));
        }
        catch (error) {
            // ignore and fallback
        }
    }
    const response = await apiRequest(context, "GET", "/api/v1/db/meta/projects");
    const list = response.list || [];
        return list.map((project) => ({
            name: project.title || project.id,
            value: project.id,
        }));
}
async function loadTables(context, baseId) {
    if (!baseId)
        return [];
    try {
        const response = await apiRequest(context, "GET", `/api/v3/meta/bases/${baseId}/tables`);
        const list = response.list || [];
        if (list.length) {
            return list.map((table) => ({
                name: table.title || table.table_name || table.id,
                value: table.id,
            }));
        }
    }
    catch (error) {
        console.error(error)
    }
    const response = await apiRequest(context, "GET", `/api/v1/db/meta/projects/${baseId}/tables`);
    const list = response.list || [];
    return list.map((table) => ({
        name: table.title || table.table_name || table.id,
        value: table.id,
    }));
}
async function loadFields(context, tableId, filterFn) {
    if (!tableId)
        return [];
    let columns = [];
    try {
        const baseParam = context.getNodeParameter("baseId", 0);
        const baseId = resolveId(baseParam);
        const response = await apiRequest(context, "GET", `/api/v3/meta/bases/${baseId}/tables/${tableId}`);
        columns = response.fields || response.columns || [];
    }
    catch (error) {
        const response = await apiRequest(context, "GET", `/api/v1/db/meta/tables/${tableId}`);
        columns = response.columns || [];
    }
    return columns
        .filter((col) => (filterFn ? filterFn(col) : true))
        .map((col) => ({
        name: col.title || col.column_name || col.id,
        // use display title as primary API field name (v3 expects display names)
        value: col.title || col.id || col.column_name,
        description: col.uidt,
    }));
}
async function ensureBaseId(context, baseId, workspaceId) {
    if (!baseId)
        return baseId;
    // quick positive check: try fetching base meta; if it works return as-is
    try {
        await apiRequest(context, "GET", `/api/v1/db/meta/projects/${baseId}`);
        return baseId;
    }
    catch { }
    // resolve by name from available bases
    try {
        const bases = await loadBases(context, workspaceId);
        const found = bases.find((b) => (b.name || "").toLowerCase() === String(baseId).toLowerCase());
        if (found)
            return found.value;
    }
    catch { }
    return baseId;
}
async function ensureTableId(context, baseId, tableId) {
    if (!tableId)
        return tableId;
    if (!baseId)
        return tableId;
    // direct check
    try {
        await apiRequest(context, "GET", `/api/v3/meta/bases/${baseId}/tables/${tableId}`);
        return tableId;
    }
    catch { }
    // resolve by name from list
    try {
        const tables = await loadTables(context, baseId);
        const found = tables.find((t) => (t.name || "").toLowerCase() === String(tableId).toLowerCase());
        if (found)
            return found.value;
    }
    catch { }
    return tableId;
}
exports.ensureBaseId = ensureBaseId;
exports.ensureTableId = ensureTableId;
