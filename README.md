# American Standard Time

Official repository of the Department of Freedom-Aligned Chronometry.

American Standard Time, or AST, is the federally adopted clock system for
coffee breaks, incident reports, football pacing, and saying "approximately"
with institutional confidence.

## What Is AST?

AST divides each modern day into clean operating units:

| Unit | Definition | Modern duration |
| --- | ---: | ---: |
| Tick | base unit | 2.4 seconds |
| Slice | 50 Ticks | 2 minutes |
| Round | 12 Slices | 24 minutes |
| Block | 6 Rounds | 2.4 hours |
| Shift | 5 Blocks | 12 hours |
| Day | 2 Shifts | 24 hours |

So:

```text
1 day = 2 Shifts = 10 Blocks = 60 Rounds = 720 Slices = 36,000 Ticks
```

Official time is written as:

```text
AST Shift.Block.Round.Slice
```

Example:

```text
AST 2.3.4.08
```

Civilian time is written as:

```text
Block:Round:Slice AST
```

## Pages

- `index.html` - live AST clock, combined instrument, current month, block schedule, and timestamp copy buttons.
- `tools.html` - modern-to-AST and AST-to-modern conversion tools.
- `about.html` - why AST exists, unit overview, week/month rules, and named Blocks.
- `standard.html` - official notation, canonical definitions, calendar rules, and examples.

## Calendar

The AST year uses 13 months of 28 days, for 364 regular calendar days.

The remaining day is:

```text
National Adjustment Day
```

Leap years add:

```text
Bonus Adjustment Day
```

Both are outside month and week jurisdiction, as proper exceptions should be.

## Local Use

This is a static site. Open `index.html` directly, or serve the directory:

```bash
python3 -m http.server 8123
```

Then visit:

```text
http://127.0.0.1:8123/
```

No build step, package install, or authorization hearing is required.

## Files

```text
index.html      Live clock
tools.html      Conversion tools
about.html      AST explanation
standard.html   AST standard
styles.css      Shared styling
app.js          Live clock logic
tools.js        Converter logic
assets/         Reserved official hardware imagery
```

## Motto

American Standard Time: because 24 hours was too European, but decimal time was
too French.
