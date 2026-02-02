module.exports = {
	credentials: [
		{
			name: 'NocoDBApi',
			credentials: require('./credentials/NocoDBApi.credentials'),
		},
	],
	nodes: [
		{
			name: 'NocoDBCustom',
			node: require('./nodes/NocoDB/NocoDB.node'),
		},
		{
			name: 'NocoDBToolCustom',
			node: require('./nodes/NocoDB/NocoDBTool.node'),
		},
	],
};
