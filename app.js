const SECONDS_PER_DAY = 86400;
const TICKS_PER_DAY = 36000;
const SECONDS_PER_TICK = SECONDS_PER_DAY / TICKS_PER_DAY;
const TICKS_PER_SLICE = 50;
const SLICES_PER_ROUND = 12;
const ROUNDS_PER_BLOCK = 6;
const BLOCKS_PER_SHIFT = 5;
const SHIFTS_PER_DAY = 2;
const BLOCKS_PER_DAY = BLOCKS_PER_SHIFT * SHIFTS_PER_DAY;
const SLICES_PER_DAY = TICKS_PER_DAY / TICKS_PER_SLICE;
const ROUNDS_PER_DAY = SLICES_PER_DAY / SLICES_PER_ROUND;
const SECONDS_PER_SLICE = TICKS_PER_SLICE * SECONDS_PER_TICK;
const SECONDS_PER_ROUND = SLICES_PER_ROUND * SECONDS_PER_SLICE;
const SECONDS_PER_BLOCK = ROUNDS_PER_BLOCK * SECONDS_PER_ROUND;
const SECONDS_PER_SHIFT = BLOCKS_PER_SHIFT * SECONDS_PER_BLOCK;

const DAYS = [
  "Manday",
  "Twosday",
  "Wrenchday",
  "Thirstday",
  "Fryday",
  "Yardday",
  "Liberty Day",
];

const MONTHS = [
  "Januqueue",
  "Februerror",
  "Marchitecture",
  "Aprilarm",
  "Mayday",
  "Juncture",
  "Julog",
  "Augment",
  "Septicket",
  "Octerminal",
  "Novendor",
  "Decincident",
  "Adjustember",
];

const BLOCK_ALIASES = [
  ["Graveyard Scroll", "poor choices pending"],
  ["Infomercial Hours", "only bad deals available"],
  ["Pre-Coffee Danger Zone", "handle with care"],
  ["Rush Hour", "chaos, on schedule"],
  ["Hustle Block", "allegedly productive"],
  ["Lunch Block", "constitutionally protected"],
  ["Afternoon Slump", "low effort, high snacking"],
  ["Happy Hour Extended", "technically still working"],
  ["Prime Time", "sports, news, regrets"],
  ["Doom Scroll Hours", "five more minutes, repeated"],
];

const $ = (id) => document.getElementById(id);

const dom = {
  oShift: $("oShift"),
  oBlock: $("oBlock"),
  oRound: $("oRound"),
  oSlice: $("oSlice"),
  cBlock: $("cBlock"),
  cRound: $("cRound"),
  cSlice: $("cSlice"),
  shiftLabel: $("shiftLabel"),
  coreTime: $("coreTime"),
  coreTick: $("coreTick"),
  modernTime: $("modernTime"),
  tickOfDay: $("tickOfDay"),
  tickValue: $("tickValue"),
  blockAlias: $("blockAlias"),
  barTick: $("barTick"),
  barSlice: $("barSlice"),
  barRound: $("barRound"),
  barBlock: $("barBlock"),
  barDay: $("barDay"),
  cntTick: $("cntTick"),
  cntSlice: $("cntSlice"),
  cntRound: $("cntRound"),
  cntBlock: $("cntBlock"),
  cntDay: $("cntDay"),
  workday: $("workday"),
  calendarDate: $("calendarDate"),
  yearDay: $("yearDay"),
  adjustment: $("adjustment"),
  clock: document.querySelector(".ast-clock"),
};

function pad(value, width = 2) {
  return String(value).padStart(width, "0");
}

function localSecondsSinceMidnight(date) {
  return (
    date.getHours() * 3600 +
    date.getMinutes() * 60 +
    date.getSeconds() +
    date.getMilliseconds() / 1000
  );
}

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function toAst(date) {
  const seconds = localSecondsSinceMidnight(date);
  const totalTicksFloat = seconds / SECONDS_PER_TICK;
  const totalTicks = Math.min(TICKS_PER_DAY - 1, Math.floor(totalTicksFloat));
  const totalSlices = Math.floor(totalTicks / TICKS_PER_SLICE);
  const totalRounds = Math.floor(totalSlices / SLICES_PER_ROUND);
  const globalBlockIndex = Math.floor(totalRounds / ROUNDS_PER_BLOCK);

  const shiftIndex = Math.floor(globalBlockIndex / BLOCKS_PER_SHIFT);
  const blockIndex = globalBlockIndex % BLOCKS_PER_SHIFT;
  const round = totalRounds % ROUNDS_PER_BLOCK;
  const slice = totalSlices % SLICES_PER_ROUND;
  const tick = totalTicks % TICKS_PER_SLICE;

  return {
    seconds,
    totalTicksFloat,
    totalTicks,
    totalSlices,
    totalRounds,
    globalBlockIndex,
    globalBlock: globalBlockIndex + 1,
    shift: shiftIndex + 1,
    block: blockIndex + 1,
    round,
    slice,
    tick,
  };
}

function astCalendar(date) {
  const year = date.getFullYear();
  const start = Date.UTC(year, 0, 1);
  const today = Date.UTC(year, date.getMonth(), date.getDate());
  const dayIndex = Math.floor((today - start) / 86400000);
  const dayOfYear = dayIndex + 1;
  const leap = isLeapYear(year);

  if (dayIndex === 364) {
    return {
      workday: "none",
      label: "National Adjustment Day",
      dayOfYear,
      adjustment: "National Adjustment Day",
    };
  }

  if (dayIndex === 365 && leap) {
    return {
      workday: "none",
      label: "Bonus Adjustment Day",
      dayOfYear,
      adjustment: "Bonus Adjustment Day",
    };
  }

  const monthIndex = Math.floor(dayIndex / 28);
  const monthDay = (dayIndex % 28) + 1;

  return {
    workday: DAYS[dayIndex % DAYS.length],
    label: `${MONTHS[monthIndex]}, Day ${pad(monthDay)} (M${pad(monthIndex + 1)})`,
    dayOfYear,
    adjustment: "none",
  };
}

function percent(value, max) {
  return Math.max(0, Math.min(100, (value / max) * 100));
}

function setWidth(element, value, max) {
  element.style.width = `${percent(value, max)}%`;
}

function setClockAngles(ast) {
  dom.clock.style.setProperty("--day-angle", `${(ast.seconds / SECONDS_PER_DAY) * 360}deg`);
  dom.clock.style.setProperty("--block-angle", `${((ast.seconds % SECONDS_PER_BLOCK) / SECONDS_PER_BLOCK) * 360}deg`);
  dom.clock.style.setProperty("--round-angle", `${((ast.seconds % SECONDS_PER_ROUND) / SECONDS_PER_ROUND) * 360}deg`);
  dom.clock.style.setProperty("--slice-angle", `${((ast.seconds % SECONDS_PER_SLICE) / SECONDS_PER_SLICE) * 360}deg`);
  dom.clock.style.setProperty("--tick-angle", `${((ast.seconds % SECONDS_PER_TICK) / SECONDS_PER_TICK) * 360}deg`);
}

function update() {
  const now = new Date();
  const ast = toAst(now);
  const calendar = astCalendar(now);
  const formal = `AST ${ast.shift}.${ast.block}.${ast.round}.${pad(ast.slice)}`;
  const alias = BLOCK_ALIASES[ast.globalBlockIndex] || ["Unscheduled Block", "documentation pending"];

  dom.oShift.textContent = ast.shift;
  dom.oBlock.textContent = ast.block;
  dom.oRound.textContent = ast.round;
  dom.oSlice.textContent = pad(ast.slice);
  dom.cBlock.textContent = ast.globalBlock;
  dom.cRound.textContent = ast.round;
  dom.cSlice.textContent = pad(ast.slice);
  dom.shiftLabel.textContent = ast.shift === 1 ? "First Shift" : "Second Shift";

  dom.coreTime.textContent = formal;
  dom.coreTick.textContent = `Tick ${pad(ast.tick)} / 49`;
  dom.modernTime.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  dom.tickOfDay.textContent = `${ast.totalTicks.toLocaleString()} / ${TICKS_PER_DAY.toLocaleString()}`;
  dom.tickValue.textContent = `${pad(ast.tick)} / 49`;
  dom.blockAlias.textContent = `Block ${ast.globalBlock}: ${alias[0]} - ${alias[1]}`;

  setWidth(dom.barTick, ast.tick, TICKS_PER_SLICE - 1);
  setWidth(dom.barSlice, ast.slice, SLICES_PER_ROUND - 1);
  setWidth(dom.barRound, ast.round, ROUNDS_PER_BLOCK - 1);
  setWidth(dom.barBlock, ast.block - 1, BLOCKS_PER_SHIFT - 1);
  setWidth(dom.barDay, ast.totalTicks, TICKS_PER_DAY - 1);

  dom.cntTick.textContent = `${pad(ast.tick)}/49`;
  dom.cntSlice.textContent = `${pad(ast.slice)}/11`;
  dom.cntRound.textContent = `${ast.round}/5`;
  dom.cntBlock.textContent = `${ast.block}/5`;
  dom.cntDay.textContent = `${((ast.totalTicks / TICKS_PER_DAY) * 100).toFixed(1)}%`;

  dom.workday.textContent = calendar.workday;
  dom.calendarDate.textContent = calendar.label;
  dom.yearDay.textContent = calendar.dayOfYear.toLocaleString();
  dom.adjustment.textContent = calendar.adjustment;

  setClockAngles(ast);
}

update();
setInterval(update, 250);
