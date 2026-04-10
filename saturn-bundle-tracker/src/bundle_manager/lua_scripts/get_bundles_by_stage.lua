-- KEYS[1]: The stage string (e.g., "InFlight")
-- ARGV[1]: Batch Size (limit)
-- ARGV[2]: Worker ID
-- ARGV[3]: Current Timestamp (Unix ms)
-- ARGV[4]: Lock Duration (ms) (e.g., 30000 for 30s)

local stage_key = "bundles_stage:" .. KEYS[1]
local limit = tonumber(ARGV[1])
local worker_id = ARGV[2]
local now = tonumber(ARGV[3])
local lock_duration = tonumber(ARGV[4])

-- Get all candidate bundles (stored as a Set)
local candidates = redis.call('SMEMBERS', stage_key)
local locked_bundles_data = {}

for _, bundle_id in ipairs(candidates) do
    if #locked_bundles_data >= limit then
        break
    end

    local lock_key = "lock:" .. bundle_id
    local lock_info = redis.call('HMGET', lock_key, 'owner', 'expires_at')
    local owner = lock_info[1]
    local expires_at = tonumber(lock_info[2])

    -- Check if free, owned by us, or expired
    if not owner or (owner == worker_id) or (expires_at and expires_at < now) then
        -- ACQUIRE LOCK
        redis.call('HSET', lock_key, 'owner', worker_id, 'expires_at', now + lock_duration)
        -- Set TTL on lock key so it cleans itself up eventually if bundle is deleted
        redis.call('PEXPIRE', lock_key, lock_duration * 2)

        -- Fetch the actual JSON string from the bundle_tracker Hash
        local bundle_data = redis.call('HGET', 'bundle_tracker', bundle_id)
        if bundle_data then
            table.insert(locked_bundles_data, bundle_data)
        else
            -- Cleanup dangling ID if data is somehow missing from the Hash
            redis.call('SREM', stage_key, bundle_id)
        end
    end
end

return locked_bundles_data
