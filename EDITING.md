# How to update the TBRG website

You do not need to know Git, YAML, or coding. After the new site is published, this is the usual way to change it.

## Before you start

Someone with access to the GitHub repository (`pongsun-b/TravBhv`) must invite you as a collaborator once. You will log in with that GitHub account.

## Everyday editing

1. Open [the editor](https://pongsun-b.github.io/TravBhv/admin/).
2. Click **Login with GitHub** and approve access.
3. Choose a section (Faculty, Students, Publications, News, Extra pages, or Notes).
4. Change the fields (or click **Add** for a new person, paper, news item, extra page, or note).
5. Click **Save** / **Publish**.
6. Wait one or two minutes, then refresh the public site: https://pongsun-b.github.io/TravBhv

### What each section is for

| Section | Use it for |
|---|---|
| Faculty | Names, roles, emails, photos, short bios |
| Students | Student names and emails |
| Publications | Paper title, authors, short description, DOI/link |
| News | Date + one headline. Use the same calendar date as a Note if the headline should link to it. |
| Extra pages | Other pages next to the main menu: a path on this site (`/foo/`) or a dashboard URL (`https://…`) |
| Notes | A few paragraphs of method or findings. Research themes are not edited here. |

News is one headline. Notes are a few paragraphs of method or findings. Research themes are not edited in the form editor.

Photos: upload a square-ish portrait. It will show on the People page.

The **Access** map is not edited here. It is built by `scripts/access/build.py` and stored in `access-data/`.

### Extra pages and off-site dashboards

Use **Extra pages** for anything that should sit next to Home / Access / Research.

- A dashboard hosted somewhere else: set URL to the `https://…` address. It opens in a new tab and is listed on [Apps](https://pongsun-b.github.io/TravBhv/apps/). Turn **Show in top menu** on to put it in the main menu.
- A new page on this site: add a file under `_pages` (maintainer), then put its path (`/foo/`) in Extra pages.
- To frame an off-site dashboard under a TBRG address (so the site header stays visible), a maintainer adds `_pages/foo.html` with `layout: embed` and `embed: https://…`, then Extra pages points at `/foo/`. Some hosts block framing; the page still has an “open in its own window” link.

Leave **Show in top menu** off if the menu is already full — the item still appears on Apps.

If a name or email looks like a placeholder (`xxxxx`, or a last name that is just `X`), the public site hides that person on purpose.

## If “Login with GitHub” does not work

The editor needs a one-time GitHub login app (OAuth). That is a maintainer job, not something professors should set up. Until it is done, use the backup below.

### Backup: edit in the GitHub website

You must be logged into GitHub. Click a link, then the pencil icon, then **Commit changes**.

- [News](https://github.com/pongsun-b/TravBhv/edit/main/_data/news.yml)
- [Publications](https://github.com/pongsun-b/TravBhv/edit/main/_data/publist.yml)
- [Faculty](https://github.com/pongsun-b/TravBhv/edit/main/_data/team_members.yml)
- [Students](https://github.com/pongsun-b/TravBhv/edit/main/_data/students.yml)
- [Extra pages](https://github.com/pongsun-b/TravBhv/edit/main/_data/extras.yml)
- [Notes](https://github.com/pongsun-b/TravBhv/tree/main/_posts)

Copy an existing block and change the text. Keep the dashes and spacing the same.

## Maintainer note (not for everyday editors)

GitHub backend for Decap CMS needs a GitHub OAuth App plus a tiny auth callback (for example the [Decap GitHub OAuth provider](https://github.com/vencax/netlify-cms-github-oauth-provider) or a Cloudflare Worker). Homepage URL: `https://pongsun-b.github.io/TravBhv`. Then set `backend.base_url` in `admin/config.yml` to that callback origin. Professors do not do this step.
