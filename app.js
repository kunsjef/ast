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
  "Liberty Day",
  "Manday",
  "Twosday",
  "Wrenchday",
  "Thirstday",
  "Fryday",
  "Yardday",
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
  blockGrid: $("blockGrid"),
  blockDialLabels: $("blockDialLabels"),
  roundDialLabels: $("roundDialLabels"),
  monthGrid: $("monthGrid"),
  monthGridLabel: $("monthGridLabel"),
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

function formatTimeWindow(blockIndex) {
  const startSeconds = blockIndex * SECONDS_PER_BLOCK;
  const endSeconds = startSeconds + SECONDS_PER_BLOCK;
  return `${formatClockTime(startSeconds)}-${formatClockTime(endSeconds)}`;
}

function formatClockTime(seconds) {
  const wrapped = seconds % SECONDS_PER_DAY;
  const hours = Math.floor(wrapped / 3600);
  const minutes = Math.floor((wrapped % 3600) / 60);
  return `${pad(hours)}:${pad(minutes)}`;
}

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function renderBlockSchedule() {
  dom.blockGrid.innerHTML = BLOCK_ALIASES.map(([name, description], index) => `
    <article class="block-card" data-block-index="${index}">
      <code>Block ${index + 1} / ${formatTimeWindow(index)}</code>
      <strong>${name}</strong>
      <span>${description}</span>
      <p>${index < BLOCKS_PER_SHIFT ? "First Shift" : "Second Shift"}</p>
    </article>
  `).join("");
}

function renderDialLabels() {
  dom.blockDialLabels.innerHTML = Array.from({ length: BLOCKS_PER_DAY }, (_, index) => {
    const position = polarLabelPosition(index, BLOCKS_PER_DAY, 43);
    return `<span class="dial-label" style="--label-x:${position.x}%; --label-y:${position.y}%;">${index + 1}</span>`;
  }).join("");

  dom.roundDialLabels.innerHTML = Array.from({ length: ROUNDS_PER_BLOCK }, (_, index) => {
    const position = polarLabelPosition(index, ROUNDS_PER_BLOCK, 28);
    return `<span class="dial-label" style="--label-x:${position.x}%; --label-y:${position.y}%;">R${index}</span>`;
  }).join("");
}

function polarLabelPosition(index, total, radiusPercent) {
  const angle = ((index / total) * 2 * Math.PI) - (Math.PI / 2);
  return {
    x: (50 + Math.cos(angle) * radiusPercent).toFixed(3),
    y: (50 + Math.sin(angle) * radiusPercent).toFixed(3),
  };
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
      workday: DAYS[date.getDay()],
      label: "National Adjustment Day",
      dayOfYear,
      adjustment: "National Adjustment Day",
      isAdjustment: true,
    };
  }

  if (dayIndex === 365 && leap) {
    return {
      workday: DAYS[date.getDay()],
      label: "Bonus Adjustment Day",
      dayOfYear,
      adjustment: "Bonus Adjustment Day",
      isAdjustment: true,
    };
  }

  const monthIndex = Math.floor(dayIndex / 28);
  const monthDay = (dayIndex % 28) + 1;

  return {
    workday: DAYS[date.getDay()],
    label: `${MONTHS[monthIndex]}, Day ${pad(monthDay)} (M${pad(monthIndex + 1)})`,
    dayOfYear,
    adjustment: "none",
    isAdjustment: false,
    monthIndex,
    monthDay,
  };
}

function renderMonthGrid(calendar) {
  if (calendar.isAdjustment) {
    dom.monthGridLabel.textContent = "outside_month";
    dom.monthGrid.innerHTML = `<div class="month-cell adjustment">${calendar.label}<br>outside week and month jurisdiction</div>`;
    return;
  }

  dom.monthGridLabel.textContent = `${MONTHS[calendar.monthIndex]} / 28_day_grid`;
  const headers = DAYS.slice(1).concat(DAYS[0]);
  const headerCells = headers.map((day) => `<div class="month-cell header">${day.slice(0, 3)}</div>`).join("");
  const dayCells = Array.from({ length: 28 }, (_, index) => {
    const day = index + 1;
    const todayClass = day === calendar.monthDay ? " today" : "";
    return `<div class="month-cell${todayClass}">${pad(day)}</div>`;
  }).join("");

  dom.monthGrid.innerHTML = headerCells + dayCells;
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

function updateActiveBlock(globalBlockIndex) {
  document.querySelectorAll(".block-card").forEach((card) => {
    card.classList.toggle("active", Number(card.dataset.blockIndex) === globalBlockIndex);
  });
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
  dom.coreTick.textContent = `T${pad(ast.tick)}`;
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
  renderMonthGrid(calendar);

  setClockAngles(ast);
  updateActiveBlock(ast.globalBlockIndex);
}

renderDialLabels();
renderBlockSchedule();
update();
setInterval(update, 250);
