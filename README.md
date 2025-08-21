# Cranky's Cloud

A website for downloading and uploading songs for [Beatblock](https://store.steampowered.com/app/3045200/Beatblock/).

## Development

### `wrangler.json`

Make sure to run `pnpm run wrangler:types` whenever updating `wrangler.json`.

### Authentication

We require the following environment variables:

```
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
AUTH_SECRET
AUTH_TRUST_HOST=true # we're using Cloudflare which is trusted.
# The following are not necessary for development
CLOUDFLARE_ACCOUNT_ID
# TODO: update
CLOUDFLARE_DATABASE_ID=44e98bba-33d2-48bb-88ad-d1a1a0c88505
CLOUDFLARE_D1_TOKEN
```

As per [authjs-astro's Setup environment variables docs](https://github.com/nowaythatworked/auth-astro?tab=readme-ov-file#setup-environment-variables),
you can generate `AUTH_SECRET` via `openssl rand -hex 32`.

### Local development

(As aforementioned, note that you do not need to specify every single environment variable for
local development.)

We use the in-memory SQLite database for development, which should require no extra configuration
other than the above environment variables. Us e
