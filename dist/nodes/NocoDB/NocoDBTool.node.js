"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NocoDBTool = void 0;
const { NodeApiError } = require("n8n-workflow");
const properties_1 = require("./properties");
const utils_1 = require("./utils");
function buildWhere(groups) {
    if (!groups || !groups.length)
        return "";
    const parts = [];
    for (const group of groups) {
        const conds = [];
        for (const cond of group.conditions || []) {
            const field = (0, utils_1.resolveId)(cond.field);
            if (!field)
                continue;
            const { op, values } = mapOperatorAndValue(cond.operator || "eq", cond.value);
            const valuePart = values.length ? `,${values.join(",")}` : ",*";
            conds.push(`(${field},${op}${valuePart})`);
        }
        if (conds.length) {
            const joined = conds.join(`~${group.logic || "and"}`);
            parts.push(joined);
        }
    }
    return parts.join("~or");
}
function mapOperatorAndValue(operator, rawValue) {
    const value = rawValue !== null && rawValue !== undefined ? String(rawValue) : "";
    const listify = (val) => val.split(",").map((v) => v.trim()).filter((v) => v !== "");
    switch (operator) {
        case "contains":
            return { op: "like", values: [`%${value}%`] };
        case "not_contains":
            return { op: "nlike", values: [`%${value}%`] };
        case "starts_with":
            return { op: "like", values: [`${value}%`] };
        case "ends_with":
            return { op: "like", values: [`%${value}`] };
        case "in":
        case "anyof":
        case "allof":
        case "nallof":
        case "nanyof":
            return { op: operator, values: listify(value) };
        case "btw":
        case "nbtw": {
            const vals = listify(value);
            return { op: operator, values: vals.slice(0, 2) };
        }
        case "is":
        case "isnot":
        case "like":
        case "nlike":
        case "gt":
        case "ge":
        case "lt":
        case "le":
        case "eq":
        case "neq":
        case "not":
        case "isWithin":
            return { op: operator === "not" ? "neq" : operator, values: value ? [value] : [] };
        default:
            return { op: "eq", values: value ? [value] : [] };
    }
}
function normalizeFieldsCollection(entries) {
    const seen = new Set();
    const payload = {};
    let list = [];
    if (!entries) {
        list = [];
    }
    else if (Array.isArray(entries)) {
        list = entries;
    }
    else if (entries && Object.prototype.hasOwnProperty.call(entries, "fieldValues")) {
        if (Array.isArray(entries.fieldValues)) {
            list = entries.fieldValues;
        }
        else if (entries.fieldValues) {
            list = [entries.fieldValues];
        }
        else {
            list = [];
        }
    }
    else if (entries.field || entries.value) {
        list = [entries];
    }
    else {
        list = [];
    }
    for (const entry of list) {
        const fv = entry.fieldValues || entry;
        const fieldId = (0, utils_1.resolveId)(fv.field);
        if (!fieldId || seen.has(fieldId))
            continue;
        seen.add(fieldId);
        payload[fieldId] = fv.value;
    }
    return payload;
}
function normalizeFilterGroups(raw) {
    if (!raw)
        return [];
    const groupsArr = Array.isArray(raw) ? raw : raw.groups || [];
    return groupsArr.map((g) => {
        const grp = g.groups || g;
        const logic = grp.logic || "and";
        const condsRaw = Array.isArray(grp.conditions)
            ? grp.conditions
            : Array.isArray(grp.conditions?.condition)
                ? grp.conditions.condition
                : grp.conditions
                    ? [grp.conditions]
                    : [];
        const conditions = condsRaw
            .map((c) => c.condition || c)
            .filter((c) => c && (c.field || c.value || c.operator));
        return { logic, conditions };
    });
}
function normalizeRecordPayload(fields, recordId, isUpdate) {
    const payload = { fields: { ...fields } };
    if (isUpdate && recordId) {
        payload.id = recordId;
    }
    return payload;
}
class NocoDBTool {
    constructor() {
        this.description = {
            displayName: "NocoDB Tool (SEO-SEN.py)",
            name: "nocodbTool",
            icon: "file:seosenpy-nocodb-2.svg",
            group: ["input"],
            version: 1,
            subtitle: '={{$parameter["operation"]}}',
            description: "AI Agent tool for NocoDB rows",
            defaults: {
                name: "NocoDB Tool",
            },
            inputs: ["main"],
            outputs: ["main"],
            usableAsTool: true,
            credentials: [
                {
                    name: "nocodbApi",
                    required: true,
                },
            ],
            properties: properties_1.nocodbNodeProperties,
        };
        this.methods = {
            listSearch: {
                async getWorkspaces(filter) {
                    const results = await (0, utils_1.loadWorkspaces)(this);
                    const term = (filter || "").toString().toLowerCase();
                    const filtered = term
                        ? results.filter((r) => r.name.toLowerCase().includes(term) || String(r.value).toLowerCase().includes(term))
                        : results;
                    return { results: filtered };
                },
                async getBases(filter) {
                    const ws = this.getNodeParameter("workspaceId", "");
                    const workspaceId = (0, utils_1.resolveId)(ws);
                    const results = await (0, utils_1.loadBases)(this, workspaceId);
                    const term = (filter || "").toString().toLowerCase();
                    const filtered = term
                        ? results.filter((r) => r.name.toLowerCase().includes(term) || String(r.value).toLowerCase().includes(term))
                        : results;
                    return { results: filtered };
                },
                async getTables(filter) {
                    const base = this.getNodeParameter("baseId", "");
                    const baseId = (0, utils_1.resolveId)(base);
                    if (!baseId)
                        return { results: [] };
                    const results = await (0, utils_1.loadTables)(this, baseId);
                    const term = (filter || "").toString().toLowerCase();
                    const filtered = term
                        ? results.filter((r) => r.name.toLowerCase().includes(term) || String(r.value).toLowerCase().includes(term))
                        : results;
                    return { results: filtered };
                },
            },
            loadOptions: {
                async getFields() {
                    const table = this.getNodeParameter("tableId", "");
                    const tableId = (0, utils_1.resolveId)(table);
                    if (!tableId)
                        return [];
                    return (0, utils_1.loadFields)(this, tableId);
                },
            },
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const resource = this.getNodeParameter("resource", 0) || "row";
        const normalizedResource = resource === "record" ? "row" : resource;
        const operation = this.getNodeParameter("operation", 0);
        for (let i = 0; i < items.length; i++) {
            try {
                if (normalizedResource === "row") {
                    const workspaceId = (0, utils_1.resolveId)(this.getNodeParameter("workspaceId", i, ""));
                    const baseParam = this.getNodeParameter("baseId", i);
                    const tableParam = this.getNodeParameter("tableId", i);
                    const baseIdResolved = await (0, utils_1.ensureBaseId)(this, (0, utils_1.resolveId)(baseParam), workspaceId);
                    const tableIdResolved = await (0, utils_1.ensureTableId)(this, baseIdResolved, (0, utils_1.resolveId)(tableParam));
                    if (operation === "create") {
                        const fieldsColl = this.getNodeParameter("fieldsCollection", i, []);
                        const fields = normalizeFieldsCollection(fieldsColl, tableIdResolved);
                        if (!Object.keys(fields).length) {
                            throw new NodeApiError(this.getNode(), { message: "Please add at least one field for Create." });
                        }
                        const payloadArray = [normalizeRecordPayload(fields, undefined, false)];
                        const response = await (0, utils_1.apiRequest)(this, "POST", `/api/v3/data/${baseIdResolved}/${tableIdResolved}/records`, payloadArray);
                        (response.records || [response]).forEach((record) => returnData.push(record));
                    }
                    if (operation === "update") {
                        const recordId = (0, utils_1.resolveId)(this.getNodeParameter("recordId", i));
                        const fieldsColl = this.getNodeParameter("fieldsCollection", i, []);
                        const fields = normalizeFieldsCollection(fieldsColl, tableIdResolved);
                        if (!Object.keys(fields).length) {
                            throw new NodeApiError(this.getNode(), { message: "Please add at least one field for Update." });
                        }
                        const payload = normalizeRecordPayload(fields, recordId, true);
                        if (!payload.id) {
                            throw new NodeApiError(this.getNode(), { message: "Record ID is required for update" });
                        }
                        const response = await (0, utils_1.apiRequest)(this, "PATCH", `/api/v3/data/${baseIdResolved}/${tableIdResolved}/records`, [payload]);
                        (response.records || [response]).forEach((record) => returnData.push(record));
                    }
                    if (operation === "delete") {
                        const recordId = (0, utils_1.resolveId)(this.getNodeParameter("recordId", i));
                        const response = await (0, utils_1.apiRequest)(this, "DELETE", `/api/v3/data/${baseIdResolved}/${tableIdResolved}/records`, [{ id: recordId }]);
                        returnData.push(response);
                    }
                    if (operation === "get") {
                        const recordId = (0, utils_1.resolveId)(this.getNodeParameter("recordId", i));
                        const options = this.getNodeParameter("recordOptions", i, {});
                        const qs = {};
                        if (options.fields && options.fields.length)
                            qs.fields = options.fields.join(",");
                        const response = await (0, utils_1.apiRequest)(this, "GET", `/api/v3/data/${baseIdResolved}/${tableIdResolved}/records/${recordId}`, {}, qs);
                        returnData.push(response);
                    }
                    if (operation === "getAll") {
                        const returnAll = this.getNodeParameter("returnAll", i);
                        const limit = this.getNodeParameter("limit", i, 0);
                        const options = this.getNodeParameter("recordOptions", i, {});
                        const rawFilterGroups = this.getNodeParameter("filterGroups", i, {})?.groups
                            ? this.getNodeParameter("filterGroups", i, {})
                            : { groups: this.getNodeParameter("filterGroups.groups", i, []) };
                        let filterGroups = normalizeFilterGroups(rawFilterGroups);
                        if (!filterGroups.length) {
                            const legacyConditions = this.getNodeParameter("filters.conditions", i, []);
                            if (legacyConditions && legacyConditions.length) {
                                filterGroups = [{ logic: "and", conditions: legacyConditions }];
                            }
                        }
                        const qsBase = {};
                        if (options.fields && options.fields.length)
                            qsBase.fields = options.fields.join(",");
                        if (options.sort && options.sort.sortFields) {
                            const sortArr = options.sort.sortFields
                                .map((s) => ({
                                direction: s.direction || "asc",
                                field: (0, utils_1.resolveId)(s.field),
                            }))
                                .filter((s) => s.field);
                            if (sortArr.length)
                                qsBase.sort = JSON.stringify(sortArr.length === 1 ? sortArr[0] : sortArr);
                        }
                        if (filterGroups && filterGroups.length) {
                            const where = buildWhere(filterGroups);
                            if (where)
                                qsBase.where = where;
                        }
                        let page = options.page || 1;
                        const pageSize = options.pageSize || 25;
                        let fetched = 0;
                        let hasMore = true;
                        while (hasMore) {
                            const qs = { ...qsBase, page, pageSize };
                            const response = await (0, utils_1.apiRequest)(this, "GET", `/api/v3/data/${baseIdResolved}/${tableIdResolved}/records`, {}, qs);
                            const records = response.records || [];
                            returnData.push(...records);
                            fetched += records.length;
                            hasMore = !!response.next;
                            page += 1;
                            if (!returnAll && fetched >= limit) {
                                break;
                            }
                        }
                        if (!returnAll && returnData.length > limit) {
                            returnData.length = limit;
                        }
                    }
                    if (operation === "count") {
                        const rawFilterGroups = this.getNodeParameter("filterGroups", i, {})?.groups
                            ? this.getNodeParameter("filterGroups", i, {})
                            : { groups: this.getNodeParameter("filterGroups.groups", i, []) };
                        let filterGroups = normalizeFilterGroups(rawFilterGroups);
                        if (!filterGroups.length) {
                            const legacyConditions = this.getNodeParameter("filters.conditions", i, []);
                            if (legacyConditions && legacyConditions.length) {
                                filterGroups = [{ logic: "and", conditions: legacyConditions }];
                            }
                        }
                        const qs = {};
                        if (filterGroups && filterGroups.length) {
                            const where = buildWhere(filterGroups);
                            if (where)
                                qs.where = where;
                        }
                        const response = await (0, utils_1.apiRequest)(this, "GET", `/api/v3/data/${baseIdResolved}/${tableIdResolved}/count`, {}, qs);
                        returnData.push(response);
                    }
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ error: error.message, item: i });
                    continue;
                }
                throw error;
            }
        }
        return [this.helpers.returnJsonArray(returnData)];
    }
}
exports.NocoDBTool = NocoDBTool;
