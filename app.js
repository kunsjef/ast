const AST = {
  ticksPerDay: 36000,
  ticksPerSlice: 50,
  slicesPerRound: 12,
  roundsPerBlock: 6,
  blocksPerShift: 5,
  blocksPerDay: 10,
  tickSeconds: 1.44,
};

const DAYS = [
  "Manday",
  "Twosday",
  "Wrenchday",
  "Thirstday",
  "Fryday",
  "Yardday",
  "Liberty Day",
];

const $ = (id) => document.getElementById(id);

const dom = {
  formalTime: $("formalTime"),
  civilianTime: $("civilianTime"),
  modernTime: $("modernTime"),
  shiftName: $("shiftName"),
  calendarDate: $("calendarDate"),
  blockValue: $("blockValue"),
  shiftValue: $("shiftValue"),
  roundValue: $("roundValue"),
  sliceValue: $("sliceValue"),
  tickValue: $("tickValue"),
  tickOfDay: $("tickOfDay"),
  sliceOfDay: $("sliceOfDay"),
  roundOfDay: $("roundOfDay"),
  blockOfDay: $("blockOfDay"),
  shiftProgress: $("shiftProgress"),
  workday: $("workday"),
  month: $("month"),
  monthDay: $("monthDay"),
  yearDay: $("yearDay"),
  adjustment: $("adjustment"),
  dials: Array.from(document.querySelectorAll(".dial")),
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

function convertToAst(date) {
  const seconds = localSecondsSinceMidnight(date);
  const tickFloat = seconds / AST.tickSeconds;
  const tickOfDay = Math.min(AST.ticksPerDay - 1, Math.floor(tickFloat));
  const sliceOfDay = Math.floor(tickOfDay / AST.ticksPerSlice);
  const roundOfDay = Math.floor(sliceOfDay / AST.slicesPerRound);
  const blockOfDay = Math.floor(roundOfDay / AST.roundsPerBlock);

  const shiftIndex = Math.floor(blockOfDay / AST.blocksPerShift);
  const blockInShift = blockOfDay % AST.blocksPerShift;
  const roundInBlock = roundOfDay % AST.roundsPerBlock;
  const sliceInRound = sliceOfDay % AST.slicesPerRound;
  const tickInSlice = tickOfDay % AST.ticksPerSlice;

  return {
    tickFloat,
    tickOfDay,
    tickInSlice,
    sliceOfDay,
    sliceInRound,
    roundOfDay,
    roundInBlock,
    blockOfDay,
    blockInShift,
    shiftIndex,
    shiftNumber: shiftIndex + 1,
    blockNumber: blockInShift + 1,
  };
}

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function astCalendar(date) {
  const year = date.getFullYear();
  const start = Date.UTC(year, 0, 1);
  const today = Date.UTC(year, date.getMonth(), date.getDate());
  const dayIndex = Math.floor((today - start) / 86400000);
  const dayOfYear = dayIndex + 1;

  if (dayIndex === 364) {
    return {
      label: "National Adjustment Day",
      workday: "none",
      month: "outside",
      monthDay: "outside",
      dayOfYear,
      adjustment: "National Adjustment Day",
    };
  }

  if (dayIndex === 365 && isLeapYear(year)) {
    return {
      label: "Bonus Adjustment Day",
      workday: "none",
      month: "outside",
      monthDay: "outside",
      dayOfYear,
      adjustment: "Bonus Adjustment Day",
    };
  }

  const month = Math.floor(dayIndex / 28) + 1;
  const monthDay = (dayIndex % 28) + 1;
  const workday = DAYS[dayIndex % DAYS.length];

  return {
    label: `${workday} M${pad(month)} D${pad(monthDay)}`,
    workday,
    month: `${month} / 13`,
    monthDay: `${monthDay} / 28`,
    dayOfYear,
    adjustment: "none",
  };
}

function setDial(dial, progressRatio) {
  const degrees = progressRatio * 360;
  dial.style.setProperty("--progress", `${degrees}deg`);
}

function update() {
  const now = new Date();
  const ast = convertToAst(now);
  const calendar = astCalendar(now);

  dom.formalTime.textContent = `AST ${ast.shiftNumber}.${ast.blockNumber}.${ast.roundInBlock}.${pad(ast.sliceInRound)}`;
  dom.civilianTime.textContent = `${ast.blockOfDay}:${ast.roundInBlock}:${pad(ast.sliceInRound)} AST`;
  dom.modernTime.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  dom.shiftName.textContent = ast.shiftIndex === 0 ? "First Shift" : "Second Shift";
  dom.calendarDate.textContent = calendar.label;

  dom.blockValue.textContent = `B${ast.blockOfDay}`;
  dom.shiftValue.textContent = `S${ast.shiftNumber}`;
  dom.roundValue.textContent = `R${ast.roundInBlock}`;
  dom.sliceValue.textContent = `SL${pad(ast.sliceInRound)}`;
  dom.tickValue.textContent = `T${pad(ast.tickInSlice)}`;

  dom.tickOfDay.textContent = ast.tickOfDay.toLocaleString();
  dom.sliceOfDay.textContent = ast.sliceOfDay.toLocaleString();
  dom.roundOfDay.textContent = ast.roundOfDay.toLocaleString();
  dom.blockOfDay.textContent = ast.blockOfDay.toLocaleString();

  const shiftTicks = AST.ticksPerDay / 2;
  const shiftProgress = (ast.tickFloat % shiftTicks) / shiftTicks;
  dom.shiftProgress.textContent = `${(shiftProgress * 100).toFixed(3)}%`;

  dom.workday.textContent = calendar.workday;
  dom.month.textContent = calendar.month;
  dom.monthDay.textContent = calendar.monthDay;
  dom.yearDay.textContent = calendar.dayOfYear.toLocaleString();
  dom.adjustment.textContent = calendar.adjustment;

  const blockTicks = AST.ticksPerDay / AST.blocksPerDay;
  const roundTicks = AST.ticksPerSlice * AST.slicesPerRound;

  setDial(dom.dials[0], ast.tickFloat / AST.ticksPerDay);
  setDial(dom.dials[1], ast.shiftIndex / 2 + shiftProgress / 2);
  setDial(dom.dials[2], (ast.tickFloat % blockTicks) / blockTicks);
  setDial(dom.dials[3], (ast.tickFloat % roundTicks) / roundTicks);
  setDial(dom.dials[4], (ast.tickFloat % AST.ticksPerSlice) / AST.ticksPerSlice);
}

update();
setInterval(update, 250);
