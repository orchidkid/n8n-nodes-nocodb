"use strict";
class NocoDBApi {
	constructor() {
		this.name = "nocodbApi";
		this.displayName = "NocoDB API";
		this.documentationUrl = "https://nocodb.com/docs";
		this.properties = [
			{
				displayName: "Host",
				name: "host",
				type: "string",
				default: "https://app.nocodb.com",
				placeholder: "https://your-nocodb.example.com",
				description: "Base URL of your NocoDB instance",
			},
			{
				displayName: "Authentication Method",
				name: "authMethod",
				type: "options",
				default: "token",
				options: [
					{
						name: "API Token (xc-token)",
						value: "token",
						description: "Use personal auth token (xc-token header)",
					},
					{
						name: "Bearer Token",
						value: "bearer",
						description: "Use Authorization: Bearer &lt;token&gt;",
					},
				],
			},
			{
				displayName: "API Token",
				name: "token",
				type: "string",
				typeOptions: { password: true },
				default: "",
				displayOptions: { show: { authMethod: ["token"] } },
				description: "Personal auth token (xc-token)",
			},
			{
				displayName: "Bearer Token",
				name: "bearer",
				type: "string",
				typeOptions: { password: true },
				default: "",
				displayOptions: { show: { authMethod: ["bearer"] } },
				description: "JWT or long-lived bearer token",
			},
		];
	}
}
module.exports = { NocoDBApi };
