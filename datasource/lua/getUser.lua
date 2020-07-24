local index_name = KEYS[1]
local name = ARGV[1]
local count = ARGV[2]
local retCount = ARGV[3]
local found = 0
local cursor = 0
local userId

while(found < tonumber(retCount)) do
	local ar = redis.call('HScan', index_name, cursor, 'Match', name..'*', 'Count', count)

	cursor = tonumber(ar[1])
	local users = ar[2]
	local userCount = #ar[2] / 2

	if userCount > 0 then
		userId = users[2]
		found = 1
	end

	if cursor == 0 then
		break;
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
