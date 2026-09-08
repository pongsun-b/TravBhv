# Travel Behavior Research Group

Public website of the Travel Behavior Research Group (TBRG), Department of Civil Engineering, Faculty of Engineering, Chulalongkorn University.

Live site: <https://pongsun-b.github.io/TravBhv>

This repository is the canonical home of the site. The previous copy lived at [`wattwong103/travb`](https://github.com/wattwong103/travb).

## Editing the site (for the group)

Professors should use the form editor, not these files. See **[EDITING.md](EDITING.md)**.

Short version: open <https://pongsun-b.github.io/TravBhv/admin/>, log in with GitHub, edit Faculty / Papers / News, save. Invite editors as GitHub collaborators on this repository.

## For developers

YAML in `_data` is still the source of truth (`team_members.yml`, `students.yml`, `publist.yml`, `news.yml`, `extras.yml`). Each of those files has an `items:` list so the `/admin` forms can edit them.

Pages live in `_pages`. Core navigation is `_data/nav.yml` (Home, Access, Research, People, Papers, News, Data). Extra pages and off-site dashboards are `_data/extras.yml` — they show in the main menu when `nav` is true, and always on `/apps/`. To frame a remote dashboard under a TBRG path, add a page with `layout: embed`.

The Access map is built offline by `scripts/access/build.py` (not Jekyll). Outputs land in `access-data/`.

Dark charcoal editorial layout: `css/tbrg.css`.

```bash
bundle install
bundle exec jekyll serve
```

GitHub Pages project site: `url: https://pongsun-b.github.io`, `baseurl: /TravBhv`.

## License

Site content © 2026 Travel Behavior Research Group. Code is released under the MIT License (see `LICENSE`).
