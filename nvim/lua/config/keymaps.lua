-- Keymaps are automatically loaded on the VeryLazy event
-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua
-- Add any additional keymaps here
local wk = require("which-key")

-- Molten
wk.add({
  { "<leader>m",   group = "Molten" },
  { "<leader>mi",  ":MoltenInit<CR>",                      desc = "Init Kernel" },
  { "<leader>mr",  ":MoltenRestart<CR>",                   desc = "Restart Kernel" },
  { "<leader>mI",  ":MoltenInterrupt<CR>",                 desc = "Interrupt" },
  { "<leader>ml",  ":MoltenEvaluateLine<CR>",              desc = "Run Line" },
  { "<leader>me",  ":MoltenEvaluateOperator<CR>",          desc = "Run with Motion" },
  { "<leader>mR",  ":MoltenReevaluateCell<CR>",            desc = "Re-run Cell" },
  { "<leader>mo",  group = "output" },
  { "<leader>mos", ":noautocmd MoltenEnterOutput<CR>",     desc = "Show Output" },
  { "<leader>moh", ":MoltenHideOutput<CR>",                desc = "Hide Output" },
  { "<leader>m",   ":<C-u>MoltenEvaluateVisual<CR>gv",    desc = "Run Selection", mode = "v" },
})
