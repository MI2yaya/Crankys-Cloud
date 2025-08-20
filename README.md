# Cranky's Cloud

A website for downloading and uploading songs for [Beatblock](https://store.steampowered.com/app/3045200/Beatblock/).

## Development

### Authentication

We require the following environment variables:

```
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
AUTH_SECRET
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_DATABASE_ID
CLOUDFLARE_D1_TOKEN
AUTH_TRUST_HOST=true # we're using Cloudflare which is trusted.
```

As per [authjs-astro's Setup environment variables docs](https://github.com/nowaythatworked/auth-astro?tab=readme-ov-file#setup-environment-variables),
you can generate `AUTH_SECRET` via `openssl rand -hex 32`.
