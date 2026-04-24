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

vim.opt.autoread = true

vim.api.nvim_create_autocmd({ "FocusGained", "BufEnter", "CursorHold", "CursorHoldI" }, {
  pattern = "*",
  command = "checktime",
})

for _, group in ipairs(highlight_groups) do
  vim.api.nvim_set_hl(0, group, { bg = "none" })
end
