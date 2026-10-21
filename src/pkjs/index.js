// ── CFB Live Watchface  ·  PebbleKit JS ────────────────────────────────────
// Data source: ESPN's public scoreboard/summary API (free, no key required)
var Clay = require('pebble-clay');
var clayConfig = require('./config.json');
var clay = new Clay(clayConfig);   // autoHandleEvents: true - Clay persists & sends AppMessage

// Keys must match #define KEY_* in main.c exactly
var KEY_AWAY_ABBR    = 1;
var KEY_HOME_ABBR    = 2;
var KEY_AWAY_SCORE   = 3;
var KEY_HOME_SCORE   = 4;
var KEY_QUARTER      = 5;
var KEY_CLOCK        = 6;
var KEY_DOWN         = 7;
var KEY_DISTANCE     = 8;
var KEY_FIELD_POS    = 9;
var KEY_REDZONE      = 10;
var KEY_POSSESSION   = 11;
var KEY_STATUS       = 12;
var KEY_TEAM_IDX     = 13;
var KEY_START_TIME   = 14;
var KEY_AWAY_RECORD  = 15;
var KEY_HOME_RECORD  = 16;
var KEY_VIBRATE      = 17;
var KEY_LAST_PLAY    = 18;
var KEY_NEXT_GAME    = 19;
var KEY_BATTERY_BAR  = 20;
var KEY_TICKER       = 21;
var KEY_DOWN_TEXT    = 22;
var KEY_SCORE_EVENT  = 23;
var KEY_NETWORK      = 24;
var KEY_FEATURED_TAG = 25;
var KEY_AWAY_STATS   = 28;
var KEY_HOME_STATS   = 29;
var KEY_AWAY_TURNOVERS = 30;
var KEY_HOME_TURNOVERS = 31;
var KEY_AWAY_COLOR   = 32;
var KEY_HOME_COLOR   = 33;

// groups=80 = every FBS game this week (the default feed is only the Top 25)
var CFB_BASE       = "https://site.api.espn.com/apis/site/v2/sports/football/college-football";
var SCOREBOARD_URL = CFB_BASE + "/scoreboard?groups=80&limit=300";
var SUMMARY_URL    = CFB_BASE + "/summary";
var SCHEDULE_URL   = CFB_BASE + "/teams/";

// All FBS teams, alphabetical - index must match the Team select in
// config.json. Games are matched by ESPN team id (abbreviations are only a
// display fallback - ESPN occasionally changes them).
var TEAMS = [
  { id: "2005", abbr: "AF",   name: "Air Force" },
  { id: "2006", abbr: "AKR",  name: "Akron" },
  { id: "333", abbr: "ALA",  name: "Alabama" },
  { id: "2026", abbr: "APP",  name: "App State" },
  { id: "12", abbr: "ARIZ", name: "Arizona" },
  { id: "9", abbr: "ASU",  name: "Arizona State" },
  { id: "8", abbr: "ARK",  name: "Arkansas" },
  { id: "2032", abbr: "ARST", name: "Arkansas State" },
  { id: "349", abbr: "ARMY", name: "Army" },
  { id: "2", abbr: "AUB",  name: "Auburn" },
  { id: "252", abbr: "BYU",  name: "BYU" },
  { id: "2050", abbr: "BALL", name: "Ball State" },
  { id: "239", abbr: "BAY",  name: "Baylor" },
  { id: "68", abbr: "BOIS", name: "Boise State" },
  { id: "103", abbr: "BC",   name: "Boston College" },
  { id: "189", abbr: "BGSU", name: "Bowling Green" },
  { id: "2084", abbr: "BUF",  name: "Buffalo" },
  { id: "25", abbr: "CAL",  name: "California" },
  { id: "2117", abbr: "CMU",  name: "Central Michigan" },
  { id: "2429", abbr: "CLT",  name: "Charlotte" },
  { id: "2132", abbr: "CIN",  name: "Cincinnati" },
  { id: "228", abbr: "CLEM", name: "Clemson" },
  { id: "324", abbr: "CCU",  name: "Coastal Carolina" },
  { id: "38", abbr: "COLO", name: "Colorado" },
  { id: "36", abbr: "CSU",  name: "Colorado State" },
  { id: "48", abbr: "DEL",  name: "Delaware" },
  { id: "150", abbr: "DUKE", name: "Duke" },
  { id: "151", abbr: "ECU",  name: "East Carolina" },
  { id: "2199", abbr: "EMU",  name: "Eastern Michigan" },
  { id: "57", abbr: "FLA",  name: "Florida" },
  { id: "2226", abbr: "FAU",  name: "Florida Atlantic" },
  { id: "2229", abbr: "FIU",  name: "Florida International" },
  { id: "52", abbr: "FSU",  name: "Florida State" },
  { id: "278", abbr: "FRES", name: "Fresno State" },
  { id: "61", abbr: "UGA",  name: "Georgia" },
  { id: "290", abbr: "GASO", name: "Georgia Southern" },
  { id: "2247", abbr: "GAST", name: "Georgia State" },
  { id: "59", abbr: "GT",   name: "Georgia Tech" },
  { id: "62", abbr: "HAW",  name: "Hawai'i" },
  { id: "248", abbr: "HOU",  name: "Houston" },
  { id: "356", abbr: "ILL",  name: "Illinois" },
  { id: "84", abbr: "IU",   name: "Indiana" },
  { id: "2294", abbr: "IOWA", name: "Iowa" },
  { id: "66", abbr: "ISU",  name: "Iowa State" },
  { id: "55", abbr: "JXST", name: "Jacksonville State" },
  { id: "256", abbr: "JMU",  name: "James Madison" },
  { id: "2305", abbr: "KU",   name: "Kansas" },
  { id: "2306", abbr: "KSU",  name: "Kansas State" },
  { id: "338", abbr: "KENN", name: "Kennesaw State" },
  { id: "2309", abbr: "KENT", name: "Kent State" },
  { id: "96", abbr: "UK",   name: "Kentucky" },
  { id: "99", abbr: "LSU",  name: "LSU" },
  { id: "2335", abbr: "LIB",  name: "Liberty" },
  { id: "309", abbr: "UL",   name: "Louisiana" },
  { id: "2348", abbr: "LT",   name: "Louisiana Tech" },
  { id: "97", abbr: "LOU",  name: "Louisville" },
  { id: "276", abbr: "MRSH", name: "Marshall" },
  { id: "120", abbr: "MD",   name: "Maryland" },
  { id: "113", abbr: "MASS", name: "Massachusetts" },
  { id: "235", abbr: "MEM",  name: "Memphis" },
  { id: "2390", abbr: "MIA",  name: "Miami" },
  { id: "193", abbr: "M-OH", name: "Miami (OH)" },
  { id: "130", abbr: "MICH", name: "Michigan" },
  { id: "127", abbr: "MSU",  name: "Michigan State" },
  { id: "2393", abbr: "MTSU", name: "Middle Tennessee" },
  { id: "135", abbr: "MINN", name: "Minnesota" },
  { id: "344", abbr: "MSST", name: "Mississippi State" },
  { id: "142", abbr: "MIZ",  name: "Missouri" },
  { id: "2623", abbr: "MOST", name: "Missouri State" },
  { id: "152", abbr: "NCSU", name: "NC State" },
  { id: "2426", abbr: "NAVY", name: "Navy" },
  { id: "158", abbr: "NEB",  name: "Nebraska" },
  { id: "2440", abbr: "NEV",  name: "Nevada" },
  { id: "167", abbr: "UNM",  name: "New Mexico" },
  { id: "166", abbr: "NMSU", name: "New Mexico State" },
  { id: "153", abbr: "UNC",  name: "North Carolina" },
  { id: "2449", abbr: "NDSU", name: "North Dakota State" },
  { id: "249", abbr: "UNT",  name: "North Texas" },
  { id: "2459", abbr: "NIU",  name: "Northern Illinois" },
  { id: "77", abbr: "NU",   name: "Northwestern" },
  { id: "87", abbr: "ND",   name: "Notre Dame" },
  { id: "195", abbr: "OHIO", name: "Ohio" },
  { id: "194", abbr: "OSU",  name: "Ohio State" },
  { id: "201", abbr: "OU",   name: "Oklahoma" },
  { id: "197", abbr: "OKST", name: "Oklahoma State" },
  { id: "295", abbr: "ODU",  name: "Old Dominion" },
  { id: "145", abbr: "MISS", name: "Ole Miss" },
  { id: "2483", abbr: "ORE",  name: "Oregon" },
  { id: "204", abbr: "ORST", name: "Oregon State" },
  { id: "213", abbr: "PSU",  name: "Penn State" },
  { id: "221", abbr: "PITT", name: "Pittsburgh" },
  { id: "2509", abbr: "PUR",  name: "Purdue" },
  { id: "242", abbr: "RICE", name: "Rice" },
  { id: "164", abbr: "RUTG", name: "Rutgers" },
  { id: "2567", abbr: "SMU",  name: "SMU" },
  { id: "16", abbr: "SAC",  name: "Sacramento State" },
  { id: "2534", abbr: "SHSU", name: "Sam Houston" },
  { id: "21", abbr: "SDSU", name: "San Diego State" },
  { id: "23", abbr: "SJSU", name: "San Jos\u00e9 State" },
  { id: "6", abbr: "USA",  name: "South Alabama" },
  { id: "2579", abbr: "SC",   name: "South Carolina" },
  { id: "58", abbr: "USF",  name: "South Florida" },
  { id: "2572", abbr: "USM",  name: "Southern Miss" },
  { id: "24", abbr: "STAN", name: "Stanford" },
  { id: "183", abbr: "SYR",  name: "Syracuse" },
  { id: "2628", abbr: "TCU",  name: "TCU" },
  { id: "218", abbr: "TEM",  name: "Temple" },
  { id: "2633", abbr: "TENN", name: "Tennessee" },
  { id: "251", abbr: "TEX",  name: "Texas" },
  { id: "245", abbr: "TA&M", name: "Texas A&M" },
  { id: "326", abbr: "TXST", name: "Texas State" },
  { id: "2641", abbr: "TTU",  name: "Texas Tech" },
  { id: "2649", abbr: "TOL",  name: "Toledo" },
  { id: "2653", abbr: "TROY", name: "Troy" },
  { id: "2655", abbr: "TULN", name: "Tulane" },
  { id: "202", abbr: "TLSA", name: "Tulsa" },
  { id: "5", abbr: "UAB",  name: "UAB" },
  { id: "2116", abbr: "UCF",  name: "UCF" },
  { id: "26", abbr: "UCLA", name: "UCLA" },
  { id: "41", abbr: "CONN", name: "UConn" },
  { id: "2433", abbr: "ULM",  name: "UL Monroe" },
  { id: "2439", abbr: "UNLV", name: "UNLV" },
  { id: "30", abbr: "USC",  name: "USC" },
  { id: "2638", abbr: "UTEP", name: "UTEP" },
  { id: "2636", abbr: "UTSA", name: "UTSA" },
  { id: "254", abbr: "UTAH", name: "Utah" },
  { id: "328", abbr: "USU",  name: "Utah State" },
  { id: "238", abbr: "VAN",  name: "Vanderbilt" },
  { id: "258", abbr: "UVA",  name: "Virginia" },
  { id: "259", abbr: "VT",   name: "Virginia Tech" },
  { id: "154", abbr: "WAKE", name: "Wake Forest" },
  { id: "264", abbr: "WASH", name: "Washington" },
  { id: "265", abbr: "WSU",  name: "Washington State" },
  { id: "277", abbr: "WVU",  name: "West Virginia" },
  { id: "98", abbr: "WKU",  name: "Western Kentucky" },
  { id: "2711", abbr: "WMU",  name: "Western Michigan" },
  { id: "275", abbr: "WIS",  name: "Wisconsin" },
  { id: "2751", abbr: "WYO",  name: "Wyoming" }
];

// ── Saved state ────────────────────────────────────────────────────────────
var gTeamIdx       = 2;    // Alabama
var gVibrate       = true;
var gBatteryBar    = true;
var gTop25Auto     = true;

function loadFromClay() {
  var cs = {};
  try { cs = JSON.parse(localStorage.getItem("clay-settings")) || {}; } catch(e) {}
  var pIdx = parseInt(cs.TEAM_IDX, 10);
  if (!isNaN(pIdx) && pIdx >= 0 && pIdx < TEAMS.length) gTeamIdx = pIdx;
  if (cs.VIBRATE        !== undefined) gVibrate       = !!cs.VIBRATE;
  if (cs.BATTERY_BAR    !== undefined) gBatteryBar    = !!cs.BATTERY_BAR;
  if (cs.TOP25_AUTO     !== undefined) gTop25Auto     = !!cs.TOP25_AUTO;
}
loadFromClay();

// ── Scoring-play tracker (per gamePk) - mirrors the MLB HR tracker pattern.
// Only the FIRST call for a given gameId establishes the baseline (no buzz for
// plays that happened before the watch started watching); every scoring play
// found after that baseline is examined for TD / FG / Safety.
var gLastGameId     = null;
var gLastScoreCount = -1;

// Returns 0 (no buzz), 1 (single short buzz - FG or Safety) or 2 (triple buzz - TD)
// for the highest-priority NEW scoring play by team `myId` since the last check.
// PATs and 2-point conversions are folded into the touchdown's own scoring-play
// entry by ESPN's API (they never appear as their own entry), so they never
// produce a separate event - exactly the behavior we want.
function checkScoreEvent(summaryData, gameId, myId) {
  var scoringPlays = (summaryData && summaryData.scoringPlays) || [];

  if (gameId !== gLastGameId) {
    gLastGameId     = gameId;
    gLastScoreCount = scoringPlays.length;
    return 0;
  }

  var event = 0;
  for (var i = gLastScoreCount; i < scoringPlays.length; i++) {
    var sp   = scoringPlays[i];
    if (String(((sp.team) || {}).id || "") !== myId) continue;

    var abbr = ((sp.type) || {}).abbreviation || "";
    var text = ((sp.type) || {}).text || "";
    if (abbr === "TD" || text.indexOf("Touchdown") !== -1) {
      event = 2; // triple buzz - highest priority, stop looking for a bigger one
    } else if (event < 1 && (abbr === "FG" || abbr === "SF" ||
               text.indexOf("Field Goal") !== -1 || text.indexOf("Safety") !== -1)) {
      event = 1; // single buzz
    }
  }
  gLastScoreCount = scoringPlays.length;
  return event;
}

// Pulls each team's net passing yards + rushing yards out of the boxscore
// (same summary fetch used for scoring plays, no extra request) and formats
// them as a compact "P:123 R:45" string per team.
function findTeamStat(statsArr, name) {
  for (var i = 0; i < (statsArr || []).length; i++) {
    if (statsArr[i].name === name) return statsArr[i].displayValue || "0";
  }
  return "0";
}

function extractTeamStats(summaryData, awayAbbr, homeAbbr) {
  var result = { away: "", home: "", awayTurnovers: "", homeTurnovers: "" };
  var teams = (summaryData && summaryData.boxscore && summaryData.boxscore.teams) || [];
  for (var i = 0; i < teams.length; i++) {
    var abbr = ((teams[i].team) || {}).abbreviation || "";
    var stats = teams[i].statistics || [];
    var pass = findTeamStat(stats, "netPassingYards");
    var rush = findTeamStat(stats, "rushingYards");
    var ints = findTeamStat(stats, "interceptions");
    var fum  = findTeamStat(stats, "fumblesLost");
    var line = "P:" + pass + " R:" + rush;
    var toLine = "INT:" + ints + " FUMB:" + fum;
    if (abbr === awayAbbr) { result.away = line; result.awayTurnovers = toLine; }
    else if (abbr === homeAbbr) { result.home = line; result.homeTurnovers = toLine; }
  }
  return result;
}

// Shortens ESPN's play-by-play text down to just the player who matters and
// the yardage, e.g. "S.Darnold pass short middle to J.Smith-Njigba to 50 for
// 13 yards" -> "Smith-Njigba 13 yds". Drops the passer's name on completions
// (the QB is already known) but keeps whoever's name appears in the rusher
// slot as-is, so a scrambling QB still shows up correctly there. Returns
// null (caller falls back to the raw text) when the wording doesn't match
// the expected pattern closely enough to trust - trick plays, laterals, etc.
function extractPlayerYards(text, isPass) {
  if (!text) return null;
  var nameRe = "([A-Z][A-Za-z.'-]+(?:\\s[A-Z][A-Za-z.'-]+){0,2})";
  var m;
  if (isPass) {
    m = new RegExp("\\bto\\s+" + nameRe + "(?:\\s+to\\s+\\S|\\s+for\\s+-?\\d|\\.)").exec(text);
  } else {
    m = new RegExp("^(?:\\([^)]*\\)\\s*)?" + nameRe + "\\s").exec(text);
  }
  if (!m) return null;
  // ESPN writes names as "J.Smith-Njigba" (no space) - drop the leading initial
  var name = m[1].replace(/^[A-Z]\.\s*/, "");
  var yardsMatch = /for\s+(-?\d+)\s+yards?/.exec(text);
  return yardsMatch ? (name + " " + yardsMatch[1] + " yds") : name;
}

// Decides whether the last play was a pass or a run using ESPN's structured
// type field first, falling back to sniffing the text for " pass " (which
// completions and incompletions always contain) whenever that field is
// missing or ambiguous (e.g. "TD" covers both passing and rushing scores).
function formatLastPlay(lastPlay) {
  var rawText = (lastPlay && lastPlay.text) || "";
  if (!rawText) return "";
  var typeAbbr = ((lastPlay.type) || {}).abbreviation || "";

  var isPass = typeAbbr === "REC" || typeAbbr === "INC" ||
               (typeAbbr !== "RUSH" && rawText.indexOf(" pass ") !== -1);
  var isRush = typeAbbr === "RUSH" ||
               ((!typeAbbr || typeAbbr === "TD") && rawText.indexOf(" pass ") === -1 &&
                rawText.indexOf("sacked") === -1 &&
                /(up the middle|left end|right end|left tackle|right tackle|left guard|right guard|scrambles|kneels)/.test(rawText));

  var formatted = null;
  if (isPass) formatted = extractPlayerYards(rawText, true);
  else if (isRush) formatted = extractPlayerYards(rawText, false);

  return (formatted || rawText).substring(0, 40);
}

// ── Utility ───────────────────────────────────────────────────────────────
function formatStartTime(isoStr) {
  if (!isoStr) return "";
  try {
    var d = new Date(isoStr);
    if (isNaN(d.getTime())) return "";
    var h = d.getHours(), m = d.getMinutes();
    var ampm = h >= 12 ? "PM" : "AM";
    h = h % 12; if (h === 0) h = 12;
    return h + ":" + (m < 10 ? "0" + m : m) + " " + ampm;
  } catch(e) { return ""; }
}

function formatDayOfWeek(isoStr) {
  if (!isoStr) return "";
  try {
    var d = new Date(isoStr);
    if (isNaN(d.getTime())) return "";
    return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
  } catch(e) { return ""; }
}

function ordinal(n) {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  if (n === 4) return "4th";
  return n + "th";
}

function competitorFor(comp, side) {
  for (var i = 0; i < comp.competitors.length; i++) {
    if (comp.competitors[i].homeAway === side) return comp.competitors[i];
  }
  return {};
}

function teamId(competitor) {
  return String(((competitor || {}).team || {}).id || "");
}

function teamAbbr(competitor) {
  return ((competitor || {}).team || {}).abbreviation || "---";
}

// AP/CFP rank as shown by ESPN (curatedRank); 99 means unranked.
function rankOf(competitor) {
  var r = ((competitor || {}).curatedRank || {}).current;
  return (r && r >= 1 && r <= 25) ? r : 0;
}

function rankPrefix(competitor) {
  var r = rankOf(competitor);
  return r ? "#" + r + " " : "";
}

function recordFor(competitor) {
  var recs = competitor.records || [];
  for (var i = 0; i < recs.length; i++) {
    if (recs[i].type === "total") return recs[i].summary || "";
  }
  return recs[0] ? (recs[0].summary || "") : "";
}

// "#5 7-1" - rank folds into the record line so no extra row is needed
function rankedRecord(competitor) {
  return (rankPrefix(competitor) + recordFor(competitor)).substring(0, 9);
}

// ESPN gives each school's primary + alternate color as bare hex. Several
// schools' primary is black or near-black, which disappears on the watch's
// black background, so fall back to the alternate, then to white.
function hexBright(hex) {
  if (!/^[0-9a-fA-F]{6}$/.test(hex || "")) return -1;
  var v = parseInt(hex, 16);
  var r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255;
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function teamColor(competitor) {
  var t = (competitor || {}).team || {};
  if (hexBright(t.color) >= 50) return parseInt(t.color, 16);
  if (hexBright(t.alternateColor) >= 50) return parseInt(t.alternateColor, 16);
  return 0xFFFFFF;
}

function findTeamEvent(events, id) {
  for (var i = 0; i < events.length; i++) {
    var comp = events[i].competitions[0];
    if (teamId(competitorFor(comp, "away")) === id || teamId(competitorFor(comp, "home")) === id) {
      return events[i];
    }
  }
  return null;
}

// True once `isoStr` is within `minutes` from now (and hasn't already passed).
function isWithinMinutes(isoStr, minutes) {
  if (!isoStr) return false;
  try {
    var gameMs = new Date(isoStr).getTime();
    var nowMs  = Date.now();
    return gameMs > nowMs && (gameMs - nowMs) <= minutes * 60 * 1000;
  } catch(e) { return false; }
}

// Best (lowest) rank of either team in the game, or 0 if neither is ranked
function bestRank(comp) {
  var a = rankOf(competitorFor(comp, "away"));
  var h = rankOf(competitorFor(comp, "home"));
  if (!a) return h;
  if (!h) return a;
  return Math.min(a, h);
}

// Pick best TV network: national broadcast first, else whatever is listed
function getNetwork(broadcasts) {
  if (!broadcasts || !broadcasts.length) return "";
  for (var i = 0; i < broadcasts.length; i++) {
    if (broadcasts[i].market === "national" && broadcasts[i].names && broadcasts[i].names[0]) {
      return broadcasts[i].names[0];
    }
  }
  return (broadcasts[0].names && broadcasts[0].names[0]) || "";
}

// "ALA 35" / "TA&M 35" / "50" → { team: "ALA", yard: 35 }. ESPN's
// possessionText gives yards from the NAMED team's own goal line.
function parsePossessionText(text) {
  if (!text) return null;
  var m = /^(\S+)\s+(\d+)$/.exec(text.trim());
  if (m) return { team: m[1], yard: parseInt(m[2], 10) };
  var m2 = /^(\d+)$/.exec(text.trim());
  if (m2) return { team: null, yard: parseInt(m2[1], 10) }; // midfield ("50")
  return null;
}

// Map possession + yard-from-own-goal into a 0-100 field position where
// 0 = away team's own goal line (left edge) and 100 = home team's own goal
// line (right edge) - matches the field bar drawn on the watch.
function computeFieldPos(situation, awayAbbr, homeAbbr) {
  var parsed = parsePossessionText(situation.possessionText || "");
  if (!parsed) return 50;
  if (parsed.team === awayAbbr) return parsed.yard;
  if (parsed.team === homeAbbr) return 100 - parsed.yard;
  return 50; // exact midfield, no team prefix
}

// ── Ticker builder (Top 25 games this week) ─────────────────────────────────
// A full FBS slate is 60+ games - far more than fits in one AppMessage - so
// only games involving a ranked team are listed, live games first.
// Excludes whichever game is already the main on-screen game.
var TICKER_MAX = 8;
var TICKER_ENTRY_LEN = 28;

function buildTicker(events, excludeEvent) {
  var buckets = { "in": [], "pre": [], "post": [] };
  for (var i = 0; i < events.length; i++) {
    if (events[i] === excludeEvent) continue;
    var comp  = events[i].competitions[0];
    if (!bestRank(comp)) continue;
    var awayC = competitorFor(comp, "away");
    var homeC = competitorFor(comp, "home");
    var away  = rankPrefix(awayC) + teamAbbr(awayC);
    var home  = rankPrefix(homeC) + teamAbbr(homeC);

    var status = comp.status || {};
    var st = status.type || {};
    var entry;
    if (st.state === "pre") {
      entry = away + " @ " + home + " " + formatStartTime(comp.date || "");
    } else if (st.state === "post") {
      entry = away + " " + (awayC.score || 0) + "-" + home + " " + (homeC.score || 0) + " F";
    } else if (st.state === "in") {
      entry = away + " " + (awayC.score || 0) + "-" + home + " " + (homeC.score || 0) +
              " " + periodLabel(status.period);
    } else {
      continue;
    }
    if (buckets[st.state]) buckets[st.state].push(entry.substring(0, TICKER_ENTRY_LEN));
  }
  return buckets["in"].concat(buckets["pre"], buckets["post"]).slice(0, TICKER_MAX).join("|");
}

// Q1-Q4, then OT / 2OT / 3OT... for college overtime periods
function periodLabel(period) {
  if (!period) return "";
  if (period <= 4) return "Q" + period;
  return (period === 5 ? "" : (period - 4)) + "OT";
}

// ── Live detail fetch (scoring plays + team stats) ─────────────────────────
function fetchJSON(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.onload = function() {
    if (xhr.status !== 200) { console.log("[CFB] HTTP " + xhr.status + " " + url); callback(null); return; }
    try { callback(JSON.parse(xhr.responseText)); }
    catch(e) { console.log("[CFB] Parse error: " + e); callback(null); }
  };
  xhr.onerror = function() { callback(null); };
  xhr.send();
}

function fetchSummary(gameId, callback) {
  console.log("[CFB] Fetching summary: " + gameId);
  fetchJSON(SUMMARY_URL + "?event=" + gameId, callback);
}

// ── Next-game lookahead (bye weeks / after a final) ─────────────────────────
// The team schedule endpoint lists the whole season in one request (college
// weeks don't line up as neatly as the NFL's). Regular season first, then
// the postseason (conference title games, bowls, CFP).
function findNextGame(team, callback) {
  var base = SCHEDULE_URL + team.id + "/schedule";
  fetchJSON(base, function(data) {
    var ev = nextScheduledEvent(data);
    if (ev) { callback(ev); return; }
    fetchJSON(base + "?seasontype=3", function(post) { callback(nextScheduledEvent(post)); });
  });
}

function nextScheduledEvent(data) {
  var events = (data && data.events) || [];
  var nowMs = Date.now();
  var best = null, bestMs = 0;
  for (var i = 0; i < events.length; i++) {
    var comp = (events[i].competitions || [])[0];
    if (!comp || !comp.competitors) continue;
    var ms = new Date(comp.date || events[i].date).getTime();
    if (isNaN(ms) || ms <= nowMs) continue;
    if (!best || ms < bestMs) { best = events[i]; bestMs = ms; }
  }
  return best;
}

// ── Main fetch ───────────────────────────────────────────────────────────
// On a bye, still show the upcoming matchup's abbreviations in their normal
// away/home slots (rather than blank placeholders), if one was found.
function sendOffMessage(nextGameText, nextEv) {
  var msg = {};
  msg[KEY_STATUS]    = "off";
  msg[KEY_NEXT_GAME] = nextGameText || "";
  msg[KEY_AWAY_ABBR] = "---";
  msg[KEY_HOME_ABBR] = "---";
  msg[KEY_AWAY_COLOR] = 0xFFFFFF;
  msg[KEY_HOME_COLOR] = 0xFFFFFF;
  if (nextEv) {
    var comp = nextEv.competitions[0];
    msg[KEY_AWAY_ABBR] = teamAbbr(competitorFor(comp, "away"));
    msg[KEY_HOME_ABBR] = teamAbbr(competitorFor(comp, "home"));
    msg[KEY_AWAY_COLOR] = teamColor(competitorFor(comp, "away"));
    msg[KEY_HOME_COLOR] = teamColor(competitorFor(comp, "home"));
  }
  sendMessage(msg);
}

function fetchGameData(teamIdx) {
  var team = TEAMS[teamIdx];
  console.log("[CFB] Fetching for " + team.abbr);
  fetchJSON(SCOREBOARD_URL, function(data) {
    if (!data) { sendOffMessage(); return; }
    try {
      processEvents(data.events || [], team);
    } catch(e) {
      console.log("[CFB] Process error: " + e);
      sendOffMessage();
    }
  });
}

function buildNextGameText(ev, team) {
  var comp  = ev.competitions[0];
  var awayC = competitorFor(comp, "away");
  var homeC = competitorFor(comp, "home");
  var isAway = teamId(awayC) === team.id;
  var opp   = teamAbbr(isAway ? homeC : awayC);
  var t     = formatStartTime(comp.date || "");
  var day   = formatDayOfWeek(comp.date || "");
  var text  = "Next: " + (isAway ? "@" : "") + opp + (day ? " " + day : "") + (t ? " " + t : "");
  return text.length > 31 ? text.substring(0, 31) : text;
}

function stateOf(comp) {
  var t = (comp.status || {}).type || {};
  return t.state === "in" ? "live" : t.state === "post" ? "final" : t.state === "pre" ? "pre" : "off";
}

// Decide which game to actually put on screen: normally your own team's game
// (or `null` on a bye), but if Top 25 Auto is on and your team is neither
// live nor kicking off within 2 hours, feature the live game with the
// best-ranked team in it. Reverts on the next minute's fetch once your game
// gets close or that game ends - there is no separate "revert" step.
function chooseFeaturedEvent(myEvent, events) {
  if (!gTop25Auto) return { event: myEvent, tag: "" };
  if (myEvent) {
    var myComp = myEvent.competitions[0];
    var myState = stateOf(myComp);
    if (myState === "live") return { event: myEvent, tag: "" };
    if (myState === "pre" && isWithinMinutes(myComp.date, 120)) return { event: myEvent, tag: "" };
  }

  var best = null, bestR = 99;
  for (var i = 0; i < events.length; i++) {
    var comp = events[i].competitions[0];
    if (events[i] === myEvent || stateOf(comp) !== "live") continue;
    var r = bestRank(comp);
    if (r && r < bestR) { best = events[i]; bestR = r; }
  }
  if (!best) return { event: myEvent, tag: "" };
  return { event: best, tag: "T25" };
}

function processEvents(events, team) {
  var myEvent = findTeamEvent(events, team.id);
  var choice  = chooseFeaturedEvent(myEvent, events);
  var ev      = choice.event;
  var isMyGame = !!(ev && ev === myEvent);

  if (!ev) {
    // Bye week (or off-season), and no Top 25 game is live right now either.
    findNextGame(team, function(nextEv) {
      sendOffMessage(nextEv ? buildNextGameText(nextEv, team) : "", nextEv);
    });
    return;
  }

  var comp    = ev.competitions[0];
  var awayC   = competitorFor(comp, "away");
  var homeC   = competitorFor(comp, "home");
  var awayAbbr = teamAbbr(awayC);
  var homeAbbr = teamAbbr(homeC);

  var status = stateOf(comp);

  var msg = {};
  msg[KEY_AWAY_ABBR]    = awayAbbr;
  msg[KEY_HOME_ABBR]    = homeAbbr;
  msg[KEY_AWAY_COLOR]   = teamColor(awayC);
  msg[KEY_HOME_COLOR]   = teamColor(homeC);
  msg[KEY_AWAY_SCORE]   = parseInt(awayC.score, 10) || 0;
  msg[KEY_HOME_SCORE]   = parseInt(homeC.score, 10) || 0;
  msg[KEY_STATUS]       = status;
  msg[KEY_START_TIME]   = formatStartTime(comp.date || "");
  msg[KEY_AWAY_RECORD]  = rankedRecord(awayC);
  msg[KEY_HOME_RECORD]  = rankedRecord(homeC);
  msg[KEY_VIBRATE]      = gVibrate ? 1 : 0;
  msg[KEY_BATTERY_BAR]  = gBatteryBar ? 1 : 0;
  msg[KEY_NETWORK]      = getNetwork(comp.broadcasts);
  msg[KEY_TICKER]       = buildTicker(events, ev);
  msg[KEY_NEXT_GAME]    = "";
  msg[KEY_FEATURED_TAG] = isMyGame ? "" : choice.tag;
  msg[KEY_QUARTER]      = comp.status && comp.status.period ? comp.status.period : 0;
  msg[KEY_CLOCK]        = (comp.status && comp.status.displayClock) || "";

  // Halftime: ESPN flags it via status.type.name, but fall back to
  // period 2 + a zeroed clock (belt-and-suspenders in case that field is
  // ever missing/renamed). Quarter 0 makes the watch show just "Halftime"
  // instead of "Q2 0:00" - see the status_core branch in main.c.
  var statusTypeName = ((comp.status || {}).type || {}).name || "";
  var isHalftime = statusTypeName.indexOf("HALFTIME") !== -1 ||
    (msg[KEY_QUARTER] === 2 && (msg[KEY_CLOCK] === "0:00" || msg[KEY_CLOCK] === ""));
  if (isHalftime) {
    msg[KEY_QUARTER] = 0;
    msg[KEY_CLOCK] = "Halftime";
  }
  msg[KEY_DOWN]         = 0;
  msg[KEY_DISTANCE]     = 0;
  msg[KEY_DOWN_TEXT]    = "";
  msg[KEY_FIELD_POS]    = 50;
  msg[KEY_REDZONE]      = 0;
  msg[KEY_POSSESSION]   = 2; // none
  msg[KEY_LAST_PLAY]    = "";
  msg[KEY_SCORE_EVENT]  = 0;
  msg[KEY_AWAY_STATS]   = "";
  msg[KEY_HOME_STATS]   = "";
  msg[KEY_AWAY_TURNOVERS] = "";
  msg[KEY_HOME_TURNOVERS] = "";

  var situation = comp.situation;
  if (situation) {
    msg[KEY_DOWN]      = situation.down || 0;
    msg[KEY_DISTANCE]  = situation.distance || 0;
    msg[KEY_DOWN_TEXT] = situation.shortDownDistanceText || situation.downDistanceText || "";
    var fieldPos = computeFieldPos(situation, awayAbbr, homeAbbr);
    msg[KEY_FIELD_POS] = fieldPos;

    // Prefer the possessing team's id; fall back to the abbreviation in
    // possessionText if ESPN leaves it out.
    var possId = String(situation.possession || "");
    var possAbbr = (parsePossessionText(situation.possessionText || "") || {}).team;
    if (possId === teamId(awayC) || (!possId && possAbbr === awayAbbr)) msg[KEY_POSSESSION] = 0;
    else if (possId === teamId(homeC) || (!possId && possAbbr === homeAbbr)) msg[KEY_POSSESSION] = 1;

    if (typeof situation.isRedZone === "boolean") {
      msg[KEY_REDZONE] = situation.isRedZone ? 1 : 0;
    } else {
      var rz = (msg[KEY_POSSESSION] === 0 && fieldPos >= 80) ||
               (msg[KEY_POSSESSION] === 1 && fieldPos <= 20);
      msg[KEY_REDZONE] = rz ? 1 : 0;
    }

    if (situation.lastPlay && situation.lastPlay.text) {
      msg[KEY_LAST_PLAY] = formatLastPlay(situation.lastPlay);
    }
  }

  // Final: look up the next game (only meaningful for MY team)
  if (status === "final" && isMyGame) {
    findNextGame(team, function(nextEv) {
      if (nextEv) msg[KEY_NEXT_GAME] = buildNextGameText(nextEv, team);
      finishSend(status, ev, msg, isMyGame, team.id);
    });
    return;
  }

  finishSend(status, ev, msg, isMyGame, team.id);
}

// Only ever check for a scoring buzz when the featured game is actually MY
// team's game - watching a Top 25 game should never vibrate. Passing/rushing
// stats, on the other hand, apply to whichever game is on screen, so they're
// fetched for any live game.
function finishSend(status, ev, msg, isMyGame, myId) {
  if (status === "live" && ev.id) {
    fetchSummary(ev.id, function(summaryData) {
      if (isMyGame) msg[KEY_SCORE_EVENT] = checkScoreEvent(summaryData, ev.id, myId);
      var stats = extractTeamStats(summaryData, msg[KEY_AWAY_ABBR], msg[KEY_HOME_ABBR]);
      msg[KEY_AWAY_STATS] = stats.away;
      msg[KEY_HOME_STATS] = stats.home;
      msg[KEY_AWAY_TURNOVERS] = stats.awayTurnovers;
      msg[KEY_HOME_TURNOVERS] = stats.homeTurnovers;
      sendMessage(msg);
    });
    return;
  }
  sendMessage(msg);
}

// ── AppMessage transport ────────────────────────────────────────────────────
// Split across two messages (main + ticker) to stay well under the 512-byte
// inbox limit - same reasoning as the MLB watchface.
function sendMessage(dict) {
  var ticker = dict[KEY_TICKER];
  delete dict[KEY_TICKER];

  Pebble.sendAppMessage(dict,
    function() {
      console.log("[CFB] Message sent OK");
      if (ticker !== undefined) {
        var tm = {};
        tm[KEY_TICKER] = ticker;
        Pebble.sendAppMessage(tm,
          function()  { console.log("[CFB] Ticker sent OK"); },
          function(e) { console.log("[CFB] Ticker NACK: " + JSON.stringify(e)); }
        );
      }
    },
    function(e) { console.log("[CFB] NACK: " + JSON.stringify(e)); }
  );
}

// ── Pebble events ─────────────────────────────────────────────────────────
Pebble.addEventListener("ready", function() {
  console.log("[CFB] Ready – team: " + TEAMS[gTeamIdx].abbr);
  fetchGameData(gTeamIdx);
});

Pebble.addEventListener("appmessage", function(e) {
  var msg = e.payload;
  var idx = parseInt(msg[KEY_TEAM_IDX]);
  if (!isNaN(idx) && idx >= 0 && idx < TEAMS.length) {
    gTeamIdx = idx;
  }
  fetchGameData(gTeamIdx);
});

Pebble.addEventListener("webviewclosed", function(e) {
  if (!e || !e.response || e.response === "CANCELLED") return;
  try {
    loadFromClay();
    fetchGameData(gTeamIdx);
  } catch(ex) {
    console.log("[CFB] webviewclosed error: " + ex);
  }
});
