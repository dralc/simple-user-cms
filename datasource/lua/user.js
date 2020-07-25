exports.userByName_lua =
`
local index_name, name, scan_count, limit = KEYS[1], ARGV[1], ARGV[2], ARGV[3]
local found = 0
local cursor, userId

while(found < tonumber(limit) and cursor ~= 0) do
	local ar = redis.call('HScan', index_name, cursor or 0, 'Match', name..'*', 'Count', scan_count)

	cursor = tonumber(ar[1])
	local users = ar[2]
	local userCount = #ar[2] / 2

	if userCount > 0 then
		userId = users[2]
		found = found + 1
	end
end

if userId then
	local user = redis.call('HGetall', 'user:'..userId)
	table.insert(user, 1, 'id')
	table.insert(user, 2, userId)
	return user
else
	return nil
end
`;