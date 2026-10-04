# phreaknic
This is a simple static blog for the hacker conference phreaknic. You can find our schedule and list of speakers in the navigation on the side.

Run `./build.sh` to generate the static `build/` directory, including `/schedule/`
and `/speakers/`. Serve that directory with any static web server. These routes
also work under a PR preview's subdirectory. Existing hash routes remain supported.

The PN27 schedule and bios are a public snapshot of `Schedule Tentative` in
`PhreakNIC 27 TODO.xlsx` and the PN27 rows in `PhreakNIC Talk Submission (Responses).xlsx`.
Update `api/v1/topics.json` for schedule changes and `api/v1/speakers.json` for bios.
Speaker names use the preferred badge field, falling back to the submitted name
when blank. No email addresses or private workbook files are published.
Schedule entries reference speaker IDs; speaker links use `/speakers/#speakers/<id>`.
Clicking a speaker on the schedule opens their bio over the schedule and closing
it keeps the schedule visible. Opening that link in a new tab goes to the speaker
page. Speaker profiles use a full-width list with names and topics beside their
bios, stacking on mobile.
Optional `end_time` records the presentation end, including the confirmed split
Friday evening talks and Saturday's 5:00–5:20 PM talk. Times are local to Murfreesboro.

Operat0r's submission supplies a LinkedIn link instead of a bio; his profile is
marked pending. His scheduled topic also remains provisional, as in the workbook.
