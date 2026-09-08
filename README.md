# Travel Behavior Research Group

Public website of the Travel Behavior Research Group (TBRG), Department of Civil Engineering, Faculty of Engineering, Chulalongkorn University.

Live site: <https://pongsun-b.github.io/TravBhv>

This repository is the canonical home of the site. The previous copy lived at [`wattwong103/travb`](https://github.com/wattwong103/travb).

## Editing the site (for the group)

Professors should use the form editor, not these files. See **[EDITING.md](EDITING.md)**.

Short version: open <https://pongsun-b.github.io/TravBhv/admin/>, log in with GitHub, edit Faculty / Papers / News, save. Invite editors as GitHub collaborators on this repository.

## For developers

YAML in `_data` is still the source of truth (`team_members.yml`, `students.yml`, `publist.yml`, `news.yml`). Each of those files has an `items:` list so the `/admin` forms can edit them.

Pages live in `_pages`. Navigation is Home, Access, Research, People, Publications, News, Data.

The Access map is built offline by `scripts/access/build.py` (not Jekyll). Outputs land in `access-data/`.

Dark charcoal editorial layout: `css/tbrg.css`.

```bash
bundle install
bundle exec jekyll serve
```

GitHub Pages project site: `url: https://pongsun-b.github.io`, `baseurl: /TravBhv`.

## License

Site content © 2026 Travel Behavior Research Group. Code is released under the MIT License (see `LICENSE`).
