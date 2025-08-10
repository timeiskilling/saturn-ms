local cutoff = tonumber(ARGV[1])
                local limit = tonumber(ARGV[2])
                
                local removed = 0
                local stages = {'Finalized', 'Failed'}
                
                for _, stage in ipairs(stages) do
                    local stage_key = 'bundles_stage:' .. stage
                    local bundle_ids = redis.call('SMEMBERS', stage_key)
                    
                    for _, bundle_id in ipairs(bundle_ids) do
                        if removed >= limit then break end
                        
                        local bundle_data = redis.call('HGET', 'bundle_tracker', bundle_id)
                        if bundle_data then
                            local data = cjson.decode(bundle_data)
                            if data.timestamp < cutoff then
                                redis.call('HDEL', 'bundle_tracker', bundle_id)
                                redis.call('SREM', 'active_bundles', bundle_id)
                                redis.call('SREM', stage_key, bundle_id)
                                removed = removed + 1
                            end
                        end
                    end
                end
                
                return removed