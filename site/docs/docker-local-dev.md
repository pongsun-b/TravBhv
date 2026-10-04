# Local development with Docker

Run the SvelteKit development server in a Linux container while editing files on your computer.
The image includes Node 24 and installs the dependencies from `site/package-lock.json`. Compose
Watch copies source edits into the running container; Vite then updates the browser. Dependency
and Docker configuration changes rebuild the image.

This setup runs the frontend with `VITE_ENQUIRY_MODE=mailto`, matching the email handoff used on
GitHub Pages. It does not start the inquiry server or store submissions. The existing Pages
workflow is unchanged.

## Prerequisites

- Docker Desktop running Linux containers, or Docker Engine on Linux.
- A recent Docker Compose supporting `develop.watch` and `initial_sync`.
- Run commands from the repository root. Node and npm on your host are optional for this workflow.

### Linux (Bash)

Install Docker Engine and the Docker Compose plugin, or use Docker Desktop for Linux. The Docker
daemon must be running and accessible from your terminal. From your existing checkout, replacing
the example path with its actual location:

```bash
cd /path/to/TravBhv
docker version
docker compose version
```

`docker version` should show both Client and Server details. Seeing only Client details means
the CLI has not connected to a daemon; resolve that before starting development.

### WSL (Bash)

When using Docker Desktop on Windows, select the WSL 2 engine and enable your distribution under
**Settings > Resources > WSL Integration**. Start Docker Desktop, then use your WSL terminal:

```bash
cd /mnt/d/Projects/TravBhv
docker version
docker compose version
```

For frequently edited Linux-container projects, Docker recommends a Linux filesystem checkout
for better filesystem performance and change notifications. Use the path of that checkout if
you already have one. Keep existing working copies and their uncommitted changes intact when
considering a new checkout later.

### Windows (PowerShell)

For a checkout on `D:`, you can also run Compose directly from PowerShell:

```powershell
Set-Location D:\Projects\TravBhv
docker version
docker compose version
```

## Start development

The following Docker commands work in Bash on Linux or WSL with Docker integration, and in
PowerShell. Run them from the repository root:

```sh
docker compose -f compose.dev.yaml config --quiet
docker compose -f compose.dev.yaml up --build --watch
```

Open <http://localhost:5173>. Keep this terminal open, edit a file under `site/src/`, and confirm
the browser updates. The initial build downloads the base image and npm dependencies. Later
source edits are synchronized without reinstalling dependencies; changes to `package.json`,
`package-lock.json`, `Dockerfile.dev`, or `.dockerignore` rebuild the service.
Changes to the root `compose.dev.yaml` require stopping and restarting the session with
`up --build --watch`; the Watch rules cannot apply their own configuration or port changes.

The application listens on `0.0.0.0` inside its container. Compose publishes the port only on
your host's `127.0.0.1`. The `node` user owns the writable `/app` directory. Dependencies,
`.svelte-kit`, and build output stay inside the container, separate from any Windows-installed
dependencies. Recreating the container discards that generated state.

There is no source bind mount: Watch copies host changes into the container. Changes made by
commands inside the container do not flow back to the host. Make source and dependency-file
edits on the host; do not use `npm install` inside this container to add a project dependency.

## Check and build

In a second terminal at the repository root:

```sh
docker compose -f compose.dev.yaml build web
docker compose -f compose.dev.yaml run --rm web npm run check
docker compose -f compose.dev.yaml run --rm -e VITE_ENQUIRY_MODE=mailto -e PAGES_BASE_PATH=/TravBhv web npm run build
```

Build the image first because a new one-off container reads its source from the image, not from
the running service's Watch session. `run --rm` removes each check container when it finishes.
The static build is produced inside that disposable container and is not exported to `site/build`
on the host. The build uses the current Pages environment variables; it does not by itself verify
browser navigation beneath `/TravBhv`.

For a quick check of files already synchronized to the running service:

```sh
docker compose -f compose.dev.yaml exec web npm run check
```

The repository guard (`npm run verify:repo`) requires the whole Git checkout and belongs on the
host. Browser verification and brand-generation commands have their own prerequisites and output
files; they are not part of this development-container workflow.

### Initial validation (2026-10-05)

Validated with Docker Desktop 4.80.0, Docker Compose 5.1.4, and Node 24.21.0:

| Check | Result |
| --- | --- |
| Compose configuration and image build | Passed |
| Static build with the Pages environment variables | Passed; the fallback script rewrote 33 references |
| Development server | HTTP 200 for home, contact, access, simulator, and map metadata; Windows localhost also responded |
| Runtime configuration | Non-root UID 1000, mailto mode, and host publication on `127.0.0.1:5173` |
| Source synchronization | Creating and updating a temporary Svelte page changed the served HTML without rebuilding; deletion removed it |
| `npm run check` | Failed with 123 existing application errors and one accessibility warning in 12 files |

Application source, dependency manifests, and Svelte/Vite configuration were unchanged by the
Docker setup. Most check errors concern JavaScript typing; the warning concerns the position of
the map's `figcaption`. Installation also reported seven dependency vulnerabilities (three low,
three moderate, one high). Address those source and dependency issues in separate changes.
Browser interaction, visual behavior, and navigation under the deployed `/TravBhv` prefix were
not verified by these checks.

## Inspect and stop

```sh
docker compose -f compose.dev.yaml ps
docker compose -f compose.dev.yaml logs --tail=100 web
docker compose -f compose.dev.yaml exec web node --version
docker compose -f compose.dev.yaml exec web id
```

Stop the foreground session with Ctrl+C, then remove its container and network:

```sh
docker compose -f compose.dev.yaml down
```

This configuration has no persistent volumes. `down` does not remove the built image.

## Two working copies at once

Use a different Compose project name and host port for the second working copy. Open a dedicated
terminal at that copy's repository root so the settings below do not affect another session.

### Bash (Linux or WSL with Docker integration)

```bash
export TRAVBHV_PORT=5174
export COMPOSE_PROJECT_NAME=travbhv-redesign
docker compose -f compose.dev.yaml up --build --watch
```

Open <http://localhost:5174>. For a second terminal inspecting the same stack, change to the same
checkout and repeat both `export` commands before using `ps`, `logs`, or `exec`. Keep the variables
set until shutdown so Compose targets the same project:

```bash
docker compose -f compose.dev.yaml ps
docker compose -f compose.dev.yaml logs --tail=100 web
docker compose -f compose.dev.yaml exec web npm run check
```

After Ctrl+C in the foreground terminal, remove the stack and clear that terminal's settings:

```bash
docker compose -f compose.dev.yaml down
unset TRAVBHV_PORT COMPOSE_PROJECT_NAME
```

`export` makes variables available to Docker launched from that terminal. `COMPOSE_PROJECT_NAME`
overrides the default `travbhv-dev` name in the Compose file. Other terminals need their own
settings. These examples use a dedicated terminal; `unset` clears the variables rather than
restoring any previous values.

### PowerShell

```powershell
$env:TRAVBHV_PORT = "5174"
docker compose -p travbhv-redesign -f compose.dev.yaml up --build --watch
```

Open <http://localhost:5174>. Use the same `-p travbhv-redesign` option for its logs, checks, and
shutdown commands. The project name separates Docker resources; the different port allows both
development servers to run simultaneously.

## Windows Docker CLI fallback from WSL Bash

If the Linux `docker` CLI cannot connect to Docker Desktop, you can invoke the Windows CLI from
Bash for this existing Windows-mounted checkout:

```bash
cd /mnt/d/Projects/TravBhv
cmd.exe /c docker version
cmd.exe /c docker compose version
cmd.exe /c docker compose -f compose.dev.yaml config --quiet
cmd.exe /c docker compose -f compose.dev.yaml up --build --watch
```

In a second Bash terminal at the same path, use the same CLI for checks and inspection:

```bash
cmd.exe /c docker compose -f compose.dev.yaml build web
cmd.exe /c docker compose -f compose.dev.yaml run --rm web npm run check
cmd.exe /c docker compose -f compose.dev.yaml run --rm -e VITE_ENQUIRY_MODE=mailto -e PAGES_BASE_PATH=/TravBhv web npm run build
cmd.exe /c docker compose -f compose.dev.yaml ps
cmd.exe /c docker compose -f compose.dev.yaml logs --tail=100 web
```

After stopping the foreground session, remove its resources with:

```bash
cmd.exe /c docker compose -f compose.dev.yaml down
```

This fallback was used for the initial validation above. Keep relative paths such as
`compose.dev.yaml` and run from the Windows-mounted repository directory. It is not the workflow
for a Linux filesystem checkout under `/home`; use Docker's WSL integration there. The fallback
examples use the default project and port: Bash `export` settings are not automatically passed
to Windows programs. Use the Linux CLI for the alternate-port Bash workflow above.

## Troubleshooting

- If Docker cannot reach its daemon, start Docker Desktop and check that Linux containers are
  selected. In WSL, enable integration for your distribution or use the documented Windows CLI
  fallback for a Windows-mounted checkout. On native Linux, check the Engine daemon and your user
  access using your installation's instructions.
- If edits do not appear, inspect the Watch terminal, confirm the file is not excluded, and try
  the Windows CLI from PowerShell for a checkout on `D:`. `up --build --watch` refreshes the image
  from the current host files. Polling or a Linux filesystem checkout can be evaluated separately
  if file events remain unreliable.
- If the host port is busy, choose another `TRAVBHV_PORT`. Vite uses `--strictPort` so it cannot
  silently change its internal port and break the published mapping.
- If `npm ci` fails because the manifest and lockfile disagree, update both on the host using the
  project's dependency workflow; do not replace `npm ci` with `npm install` in the Dockerfile.

## Learn the pieces

| Topic | What to investigate | Official resource |
| --- | --- | --- |
| Images and containers | How a Dockerfile becomes an image and how containers run it | [Docker concepts](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/) |
| Node and dependency installation | Image variants, the non-root user, and locked installation | [Node image](https://github.com/nodejs/docker-node), [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/) |
| Compose and hot reload | Why source files sync while dependency changes rebuild | [Compose Watch](https://docs.docker.com/compose/how-tos/file-watch/) |
| Networking | Container listening addresses versus host port publication | [Docker ports](https://docs.docker.com/engine/network/port-publishing/), [Vite 5 CLI](https://v5.vite.dev/guide/cli) |
| Windows and WSL | Filesystem placement and file-change notifications | [Docker WSL guidance](https://docs.docker.com/desktop/features/wsl/best-practices/) |
| Docker access from WSL | Enable distribution integration and check the daemon connection | [Docker Desktop WSL setup](https://docs.docker.com/desktop/features/wsl/) |
| Bash environment variables | Why `export` affects Docker and `unset` clears terminal settings | [Bash environment](https://www.gnu.org/software/bash/manual/html_node/Environment.html) |
| Windows programs from Bash | Invoke Windows tools from a mounted-drive checkout | [Microsoft WSL interoperability](https://learn.microsoft.com/en-us/windows/wsl/filesystems) |
| Working copies | Compose project names and resource isolation | [Compose CLI](https://docs.docker.com/reference/cli/docker/compose/) |
