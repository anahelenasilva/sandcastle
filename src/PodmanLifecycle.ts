import { Effect } from "effect";
import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { PodmanError } from "./errors.js";

const podmanExec = (args: string[]): Effect.Effect<string, PodmanError> =>
  Effect.async((resume) => {
    execFile(
      "podman",
      args,
      { maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          resume(
            Effect.fail(
              new PodmanError({
                message: `podman ${args[0]} failed: ${stderr?.toString() || error.message}`,
              }),
            ),
          );
        } else {
          resume(Effect.succeed(stdout.toString()));
        }
      },
    );
  });

/**
 * Build the sandcastle Podman image.
 *
 * When `containerfile` is provided, uses `podman build -f <containerfile> <cwd>`
 * so COPY instructions resolve relative to the current working directory.
 * Otherwise, uses `podman build <containerfileDir>` (the default .sandcastle/ directory).
 */
export const buildImage = (
  imageName: string,
  containerfileDir: string,
  options?: { readonly containerfile?: string },
): Effect.Effect<void, PodmanError> =>
  Effect.gen(function* () {
    if (options?.containerfile) {
      yield* podmanExec([
        "build",
        "-t",
        imageName,
        "-f",
        resolve(options.containerfile),
        process.cwd(),
      ]);
    } else {
      yield* podmanExec(["build", "-t", imageName, resolve(containerfileDir)]);
    }
  });

/**
 * Fix ownership of a directory inside the container.
 * Runs as root so the target owner can write to the path.
 *
 * Non-fatal: if chown fails (e.g. read-only mount), a warning is logged
 * but the error is not propagated. Matches Docker provider semantics.
 *
 * @param owner - chown-compatible owner spec, e.g. "1000:1000"
 */
export const chownInContainer = (
  containerName: string,
  owner: string,
  path: string,
): Effect.Effect<void> =>
  Effect.asVoid(
    podmanExec([
      "exec",
      "-u",
      "root",
      containerName,
      "chown",
      "-R",
      owner,
      path,
    ]),
  ).pipe(
    Effect.catchAll((error) => {
      console.warn(
        `chown -R ${owner} ${path} in container ${containerName} failed (non-fatal): ${error.message}`,
      );
      return Effect.void;
    }),
  );

/**
 * Remove a Podman image.
 */
export const removeImage = (
  imageName: string,
): Effect.Effect<void, PodmanError> =>
  Effect.gen(function* () {
    yield* podmanExec(["rmi", imageName]);
  });
