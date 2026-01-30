use redis::Script;

#[derive(Debug)]
pub struct LuaScripts {
    pub update_bundle_with_transition: Script,
    pub cleanup_completed: Script,
    pub get_bundles_by_stage: Script,
}
impl LuaScripts {
    pub fn new() -> Self {
        Self {
            update_bundle_with_transition: Script::new(include_str!(
                "../../lua_scripts/update_bundle_with_transition.lua"
            )),

            cleanup_completed: Script::new(include_str!("../../lua_scripts/cleanup_completed.lua")),

            get_bundles_by_stage: Script::new(include_str!(
                "../../lua_scripts/get_bundles_by_stage.lua"
            )),
        }
    }
}

impl Default for LuaScripts {
    fn default() -> Self {
        Self {
            update_bundle_with_transition: Script::new(include_str!(
                "../../lua_scripts/update_bundle_with_transition.lua"
            )),

            cleanup_completed: Script::new(include_str!("../../lua_scripts/cleanup_completed.lua")),

            get_bundles_by_stage: Script::new(include_str!(
                "../../lua_scripts/get_bundles_by_stage.lua"
            )),
        }
    }
}
