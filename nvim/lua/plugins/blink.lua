return {
  "saghen/blink.cmp",
  opts = {
    keymap = {
      preset = "default",
      ["<Tab>"] = {
        function(cmp)
          if require("copilot.suggestion").is_visible() then
            require("copilot.suggestion").accept()
            return true
          end
        end,
        "snippet_forward",
        "fallback",
      },
    },
  },
}
