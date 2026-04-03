-- bootstrap lazy.nvim, LazyVim and your plugins
require("config.lazy")
local highlight_groups = {
  "Normal",
  "NormalNC",
  "NormalFloat",
  "FloatBorder",
  "Pmenu",
  "SignColumn",
}

for _, group in ipairs(highlight_groups) do
  vim.api.nvim_set_hl(0, group, { bg = "none" })
end
