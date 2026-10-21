# CFB Live Scores - Claude Code Instructions

## Project Overview
**College Football Live Scores** is a Pebble smartwatch **watchface** that displays live FBS college
football scores, quarter/clock, down & distance, a field-position graphic, team passing/rushing/turnover
stats, AP rankings, and a scrolling ticker of this week's Top 25 games.
Forked from `brooks2564/Pebble-NFL-Live` - the watch layout is the same; the data layer is college-specific.
UUID: `c7acddd7-29e9-438b-9097-26d9e63ff5a6`
Data: ESPN's public college-football API (free, no key - site.api.espn.com)

## Build & Install
Always rebuild, update the committed PBW, and push together:
```bash
pebble build
cp build/Pebble-CFB-Live.pbw Pebble-CFB-Live.pbw
pebble install --phone <phone-ip>
git add Pebble-CFB-Live.pbw
git commit -m "Update PBW"
git push
```

## Project Structure
```
Pebble-CFB-Live/
├── package.json              <- Pebble manifest, 5 platforms, 33 message keys
├── wscript                   <- Build script
├── CLAUDE.md                 <- This file
├── README.md                 <- App store / GitHub description
├── resources/images/
│   ├── menu_icon.png         <- Watch menu icon (football)
│   ├── FOOTBALL_EM.png       <- Field-bar ball marker, emery (20x20)
│   └── FOOTBALL_BA.png       <- Field-bar ball marker, other platforms (14x14)
├── src/
│   ├── c/main.c              <- Watchface C code
│   └── pkjs/
│       ├── index.js          <- PebbleKit JS (ESPN fetch, ranks, ticker, Top 25 featuring)
│       └── config.json       <- Clay settings schema (138-team select)
```

## Target Platforms (5 - no round support)
aplite, basalt, diorite, emery (primary, gets extra polish), flint - same as the NFL app.

## Message Keys (must match #define KEY_* in main.c)
Same as the NFL app (1-31) except:
| Key              | ID | Notes |
|------------------|----|-------|
| TEAM_LOGOS       | 26 | **Removed** - no logos (138 schools x 4 sizes is too many resources) |
| AWAY_COLOR       | 32 | JS -> Watch, 0xRRGGBB school color |
| HOME_COLOR       | 33 | JS -> Watch, 0xRRGGBB school color |
| TOP25_AUTO       | 34 | Clay setting only, read from localStorage in JS; watch ignores it |

## Key Architecture Details (differences from NFL)
- **Teams** - `TEAMS` in index.js and the Team select in config.json are the 138 FBS teams, alphabetical,
  same index order. Generated from the cfbfastR-data 2026 team_info dataset (ESPN team ids). Games are
  matched by **ESPN team id**, never abbreviation. When FBS membership changes, regenerate both lists
  together - indices must stay aligned.
- **Scoreboard** - `?groups=80&limit=300` = every FBS game this week (the default feed is Top 25 only).
- **Rank** - `competitor.curatedRank.current` (99 = unranked). Folded into the record string ("#5 7-1").
- **Colors** - from `team.color` in the feed; if too dark for a black background, `alternateColor`, then white.
- **Abbreviations** - up to 4 letters ("MICH", "TA&M"); 4-letter ones render in a smaller font.
  `possessionText` is parsed with `\S+` so "TA&M 35" works; possession prefers `situation.possession` (team id).
- **Ticker** - only games with a ranked team, live first, max 8 entries x 28 chars (watch: MAX_GAMES 8,
  GAME_LEN 30, 256-byte raw buffer).
- **Top 25 auto-feature** (replaces NFL primetime) - if your team isn't live or kicking off within 2h, show
  the live game with the best-ranked team. Tag "T25". Never buzzes for a featured game.
- **Overtime** - period 5 = "OT", 6 = "2OT", etc. (no clock shown).
- **Next game** - `teams/{id}/schedule` (regular season), then `?seasontype=3` (postseason).

## Settings (Clay)
Team (138), Vibrate on Score, Battery Bar, Ticker Speed, Auto-Show Top 25 Games.
