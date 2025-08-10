local bundle_id = ARGV[1]
                local new_bundle_data = ARGV[2]
                local new_stage = ARGV[3]
                local new_version = tonumber(ARGV[4])
                local ttl = tonumber(ARGV[5])
                
                local current_data = redis.call('HGET', 'bundle_tracker', bundle_id)
                
                if current_data then
                    local current = cjson.decode(current_data)
                    
                    
                    if new_version <= current.version then
                        return 0  
                    end
                    
                    
                    local valid_transitions = {
                        ['Submitted'] = {'InFlight', 'Failed'},
                        ['InFlight'] = {'Landed', 'Failed'},
                        ['Landed'] = {'Confirmed', 'Failed'},
                        ['Confirmed'] = {'Finalized', 'Failed'}
                    }
                    
                    local allowed = valid_transitions[current.stage]
                    if allowed then
                        for _, allowed_stage in ipairs(allowed) do
                            if allowed_stage == new_stage then
                                goto update_allowed
                            end
                        end
                    end
                    
                    
                    if new_stage ~= 'Failed' then
                        return -1  
                    end
                    
                    ::update_allowed::
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