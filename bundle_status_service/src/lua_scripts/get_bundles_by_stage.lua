local stage = ARGV[1]
                local limit = tonumber(ARGV[2])
                local last_checked_before = tonumber(ARGV[3])
                
                local stage_key = 'bundles_stage:' .. stage
                local bundle_ids = redis.call('SMEMBERS', stage_key)
                local result = {}
                local count = 0
                
                for _, bundle_id in ipairs(bundle_ids) do
                    if count >= limit then break end
                    
                    local bundle_data = redis.call('HGET', 'bundle_tracker', bundle_id)
                    if bundle_data then
                        local data = cjson.decode(bundle_data)
                        local last_checked = data.last_checked or 0
                        if last_checked < last_checked_before then
                            table.insert(result, bundle_data)
                            count = count + 1
                        end
                    end
                end
                
                return result