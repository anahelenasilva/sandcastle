---
"@ai-hero/sandcastle": patch
---

Fix Podman sandbox failing on macOS when host UID differs from 1000 by chowning /home/agent to the host UID:GID after container start, matching Docker provider behavior.
