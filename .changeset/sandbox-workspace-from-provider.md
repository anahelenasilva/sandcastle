---
"@ai-hero/sandcastle": patch
---

Use sandbox provider's `workspacePath` instead of hardcoded `/home/agent/workspace` for sandbox-side commands, fixing Vercel sandbox support where the workspace is at `/vercel/sandbox/workspace`.
