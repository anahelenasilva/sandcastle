import { afterEach, describe, expect, it, vi } from "vitest";
import { Effect } from "effect";

vi.mock("node:child_process", () => ({
  execFile: vi.fn(),
  execFileSync: vi.fn(),
}));

import { execFile } from "node:child_process";
import {
  buildImage,
  removeImage,
  chownInContainer,
} from "./PodmanLifecycle.js";

const mockExecFile = vi.mocked(execFile);

describe("PodmanLifecycle", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  describe("buildImage", () => {
    it("calls podman build with image name and directory", async () => {
      mockExecFile.mockImplementation((_cmd, args, _opts, cb: any) => {
        cb(null, "", "");
        return undefined as any;
      });

      await Effect.runPromise(buildImage("my-image", "/path/to/dir"));

      expect(mockExecFile).toHaveBeenCalledWith(
        "podman",
        expect.arrayContaining(["build", "-t", "my-image"]),
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("uses -f flag when containerfile option is provided", async () => {
      mockExecFile.mockImplementation((_cmd, args, _opts, cb: any) => {
        cb(null, "", "");
        return undefined as any;
      });

      await Effect.runPromise(
        buildImage("my-image", "/path/to/dir", {
          containerfile: "/custom/Containerfile",
        }),
      );

      const args = mockExecFile.mock.calls[0]![1] as string[];
      expect(args).toContain("-f");
      expect(args).toContain("build");
      expect(args).toContain("-t");
      expect(args).toContain("my-image");
    });

    it("fails with PodmanError when podman build fails", async () => {
      mockExecFile.mockImplementation((_cmd, _args, _opts, cb: any) => {
        const err = new Error("build failed");
        cb(err, "", "error: no such file");
        return undefined as any;
      });

      const result = await Effect.runPromiseExit(
        buildImage("my-image", "/path/to/dir"),
      );

      expect(result._tag).toBe("Failure");
    });
  });

  describe("removeImage", () => {
    it("calls podman rmi with image name", async () => {
      mockExecFile.mockImplementation((_cmd, _args, _opts, cb: any) => {
        cb(null, "", "");
        return undefined as any;
      });

      await Effect.runPromise(removeImage("my-image"));

      expect(mockExecFile).toHaveBeenCalledWith(
        "podman",
        ["rmi", "my-image"],
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("fails with PodmanError when podman rmi fails", async () => {
      mockExecFile.mockImplementation((_cmd, _args, _opts, cb: any) => {
        const err = new Error("rmi failed");
        cb(err, "", "image not found");
        return undefined as any;
      });

      const result = await Effect.runPromiseExit(removeImage("my-image"));

      expect(result._tag).toBe("Failure");
    });
  });

  describe("chownInContainer", () => {
    it("runs podman exec -u root chown -R with the given owner and path", async () => {
      mockExecFile.mockImplementation((_cmd, _args, _opts, cb: any) => {
        cb(null, "", "");
        return undefined as any;
      });

      await Effect.runPromise(
        chownInContainer("my-ctr", "501:20", "/home/agent"),
      );

      expect(mockExecFile).toHaveBeenCalledWith(
        "podman",
        [
          "exec",
          "-u",
          "root",
          "my-ctr",
          "chown",
          "-R",
          "501:20",
          "/home/agent",
        ],
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("succeeds silently when chown succeeds", async () => {
      mockExecFile.mockImplementation((_cmd, _args, _opts, cb: any) => {
        cb(null, "", "");
        return undefined as any;
      });

      await Effect.runPromise(
        chownInContainer("ctr", "1000:1000", "/home/agent"),
      );
    });

    it("does not propagate error when chown fails", async () => {
      mockExecFile.mockImplementation((_cmd, _args, _opts, cb: any) => {
        const err = new Error("chown: Read-only file system");
        (err as any).code = 1;
        cb(err, "", "chown: Read-only file system");
        return undefined as any;
      });

      // Should NOT throw — chown failure is non-fatal
      await Effect.runPromise(
        chownInContainer("ctr", "1000:1000", "/home/agent"),
      );
    });

    it("logs a warning when chown fails", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      mockExecFile.mockImplementation((_cmd, _args, _opts, cb: any) => {
        const err = new Error("chown failed");
        (err as any).code = 1;
        cb(err, "", "chown: Read-only file system");
        return undefined as any;
      });

      await Effect.runPromise(
        chownInContainer("ctr", "1000:1000", "/home/agent"),
      );

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("chown"));

      warnSpy.mockRestore();
    });
  });
});
