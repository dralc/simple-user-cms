/**
 * Scans for the {searchTerm} in the HashMap index (indexName), then
 * gets the data for each id found.
 * 
 * indexName => { k1: id1 , k2: id2 , k3: id3 ... kn: idn }
 * 
 * Returns
 * [
 * 	data at {hashPrefix}id1,
 * 	data at {hashPrefix}id2,
 * ]
 * 
 * @param {string} indexName The key name of the HashMap index
 * @param {string} searchTerm
 * @param {number} scanCount
 * @param {number} limit
 * @param {string} hashPrefix
 * @returns {table<table> | null}
 */
exports.getUsersByName_lua =
`
local indexName, searchTerm, scanCount, limit, hashPrefix = KEYS[1], ARGV[1], ARGV[2], tonumber(ARGV[3]), ARGV[4]

local cursor = 0
local nIdsNeed = limit
local ids = {}
repeat
	local ar = redis.call('HScan', indexName, cursor, 'Match', searchTerm..'*', 'Count', scanCount)
	cursor = tonumber(ar[1])
	local scan = ar[2]

	if #scan > 0 then
		local nIds = #scan/2
		local nIdsKeep = (nIdsNeed <= nIds) and nIdsNeed or nIds
		for i = 2, nIdsKeep * 2, 2 do
			table.insert(ids, scan[i])
		end
		nIdsNeed = nIdsNeed - nIdsKeep
	end
until(#ids >= limit or cursor == 0)

local hs
if #ids > 0 then
	hs = {}
	for i, id in ipairs(ids) do
		local h = redis.call('HGetall', hashPrefix..id)
		table.insert(h, 'id')
		table.insert(h, id)
		table.insert(hs, h)
	end
end

return hs
`;