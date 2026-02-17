-- KEYS[1]: The Sorted Set for the stage (e.g., "bundles:InFlight")
-- ARGV[1]: Batch Size (limit)
-- ARGV[2]: Worker ID
-- ARGV[3]: Current Timestamp (Unix ms)
-- ARGV[4]: Lock Duration (ms) (e.g., 30000 for 30s)

local stage_key = KEYS[1]
local limit = tonumber(ARGV[1])
local worker_id = ARGV[2]
local now = tonumber(ARGV[3])
local lock_duration = tonumber(ARGV[4])

-- Get all candidate bundles (you might want to use ZRANGEBYSCORE to prioritize older ones)
local candidates = redis.call('ZRANGE', stage_key, 0, -1)
local locked_bundles = {}

for _, bundle_id in ipairs(candidates) do
    if #locked_bundles >= limit then
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

        table.insert(locked_bundles, bundle_id)
    end
end

return locked_bundles
