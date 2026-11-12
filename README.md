# phreaknic
This is a simple static blog for the hacker conference phreaknic. You can find our schedule and list of speakers in the navigation on the side.

The site is a single page app with hash routes: `#news`, `#faq`, `#schedule`,
`#speakers`, `#speakers/<id>` and `#topics/<id>`. Run `./build.sh` to generate the
static `build/` directory and serve it with any static web server. The routes also
work under a PR preview's subdirectory.

`/schedule/` and `/speakers/` are small redirect stubs kept so links shared earlier
still work; they forward to `/#schedule` and `/#speakers` (preserving `#speakers/<id>`).
`/badge-customizer/` is still a separate generated copy of `index.html` (`build.sh`).

The PN27 schedule and bios are a public snapshot of `Schedule Tentative` in
`PhreakNIC 27 TODO.xlsx` and the PN27 rows in `PhreakNIC Talk Submission (Responses).xlsx`.
Update `api/v1/topics.json` for schedule changes and `api/v1/speakers.json` for bios.
Speaker names use the preferred badge field, falling back to the submitted name
when blank. No email addresses or private workbook files are published.
Schedule entries reference speaker IDs; speaker links use `#speakers/<id>`.
Clicking a speaker on the schedule opens their bio over the schedule and closing
it keeps the schedule visible. Opening that link in a new tab loads the speakers view
with the bio open. Speaker profiles use a full-width list with names and topics beside their
bios, stacking on mobile.
Optional `end_time` records the presentation end, including the confirmed split
Friday evening talks and Saturday's 5:00–5:20 PM talk. Times are local to Murfreesboro.

Operat0r has withdrawn. His Saturday 2:00 PM schedule row is retained with a blank
title and no speaker, and his profile has been removed. Empty titles represent
unassigned slots.
