---
"@ai-hero/sandcastle": patch
---

Replace wall-clock timeout with idle-based timeout that resets on each agent output event.

- Rename `timeoutSeconds` → `idleTimeoutSeconds` in `RunOptions` and `OrchestrateOptions`
- Change default from 1200s (20 min) to 300s (5 min)
- Timeout now tracks from last received message (text or tool call), not run start
- Error message updated to: "Agent idle for N seconds — no output received. Consider increasing the idle timeout with --idle-timeout."
