module.exports = {
	credentials: [
		{
			name: 'NocoDBApi',
			credentials: require('./credentials/NocoDBApi.credentials'),
		},
	],
	nodes: [
		{
			name: 'NocoDB',
			node: require('./nodes/NocoDB/NocoDB.node'),
		},
		{
			name: 'NocoDBTool',
			node: require('./nodes/NocoDB/NocoDBTool.node'),
		},
	],
};
