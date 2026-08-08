return {
  "MeanderingProgrammer/render-markdown.nvim",
  dependencies = { "nvim-treesitter/nvim-treesitter", "echasnovski/mini.icons" },
  ft = { "markdown", "codecompanion" },
  opts = {
    -- hide the rendered view on the line the cursor is on, in any mode
    anti_conceal = { enabled = true },
    code = {
      width = "block",
      right_pad = 2,
    },
    heading = {
      sign = false,
    },
    -- checkmate.nvim owns todo-item rendering in markdown buffers
    checkbox = { enabled = false },
  },
  keys = {
    { "<leader>um", "<cmd>RenderMarkdown toggle<cr>", desc = "Toggle Render Markdown" },
  },
}
