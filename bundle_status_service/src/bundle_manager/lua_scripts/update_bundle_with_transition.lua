local bundle_id = ARGV[1]
local new_bundle_data = ARGV[2]
local new_stage = ARGV[3]
local new_version = tonumber(ARGV[4])
local ttl = tonumber(ARGV[5])
local force_reset = ARGV[6]

local current_data = redis.call('HGET', 'bundle_tracker', bundle_id)
local current = nil

if current_data then
    current = cjson.decode(current_data)

    if force_reset ~= 'true' and new_version <= current.version then
        return 0
    end
elseif force_reset ~= 'true' then
    return 0
end

if current and force_reset ~= 'true' then
    local valid_transitions = {
        ['Submitted'] = { 'InFlight', 'Landed', 'Confirmed', 'Finalized', 'Failed' },
        ['InFlight'] = { 'Landed', 'Confirmed', 'Finalized', 'Failed' },
        ['Landed'] = { 'Confirmed', 'Finalized', 'Failed' },
        ['Confirmed'] = { 'Finalized', 'Failed' }
    }

    local allowed = valid_transitions[current.stage]
    local is_valid = false

    if current.stage == new_stage then
        is_valid = true
    elseif allowed then
        for _, allowed_stage in ipairs(allowed) do
            if allowed_stage == new_stage then
                is_valid = true
                break
            end
        end
    end

    if not is_valid and new_stage ~= 'Failed' then
        return -1
    end
end

if current and current.stage ~= new_stage then
    redis.call('SREM', 'bundles_stage:' .. current.stage, bundle_id)
end


redis.call('HSET', 'bundle_tracker', bundle_id, new_bundle_data)


if new_stage == 'Finalized' or new_stage == 'Failed' then
    redis.call('SREM', 'active_bundles', bundle_id)
    redis.call('EXPIRE', 'bundle_tracker:' .. bundle_id, ttl)
else
    redis.call('SADD', 'active_bundles', bundle_id)
end


redis.call('SADD', 'bundles_stage:' .. new_stage, bundle_id)


redis.call('PUBLISH', 'bundle_status_updates', new_bundle_data)

return 1
