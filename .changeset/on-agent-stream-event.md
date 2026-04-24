---
"@ai-hero/sandcastle": patch
---

Add `onAgentStreamEvent` option to `logging` in log-to-file mode. The callback receives each `text` chunk and `toolCall` emitted by the agent, with the iteration number and a timestamp, so callers can forward the agent's output stream to an external observability system. Errors thrown by the callback are swallowed so a broken forwarder cannot kill the run.
