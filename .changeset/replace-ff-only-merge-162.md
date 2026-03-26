---
"@ai-hero/sandcastle": patch
---

Replace --ff-only with regular merge for worktree merge-back (issue #162)

When the agent finishes, Sandcastle now uses `git merge` instead of `git merge --ff-only` to integrate the temp branch back into the host branch. This allows users to make commits on the host branch while Sandcastle is running without causing merge-back failures. Fast-forward still happens naturally when the host branch hasn't moved; only the requirement that it *must* fast-forward is removed.
