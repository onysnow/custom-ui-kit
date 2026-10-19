# Changesets

Every change that affects a published package needs a changeset: run `bun run changeset`, pick the packages and the
semver bump (patch = fix, minor = new feature, major = breaking change), and describe the change for consumers.
The release workflow turns merged changesets into a "Version Packages" PR and, once that merges, publishes.
