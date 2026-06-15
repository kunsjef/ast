const SECONDS_PER_DAY = 86400;
const TICKS_PER_DAY = 36000;
const SECONDS_PER_TICK = SECONDS_PER_DAY / TICKS_PER_DAY;
const TICKS_PER_SLICE = 50;
const SLICES_PER_ROUND = 12;
const ROUNDS_PER_BLOCK = 6;
const BLOCKS_PER_SHIFT = 5;
const BLOCKS_PER_DAY = 10;
const SECONDS_PER_BLOCK = TICKS_PER_SLICE * SECONDS_PER_TICK * SLICES_PER_ROUND * ROUNDS_PER_BLOCK;

const DAYS = ["Liberty Day", "Manday", "Twosday", "Wrenchday", "Thirstday", "Fryday", "Yardday"];
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
  "Graveyard Scroll",
  "Infomercial Hours",
  "Pre-Coffee Danger Zone",
  "Rush Hour",
  "Hustle Block",
  "Lunch Block",
  "Afternoon Slump",
  "Happy Hour Extended",
  "Prime Time",
  "Doom Scroll Hours",
];

const $ = (id) => document.getElementById(id);
const state = { modernResult: "", astResult: "" };

function pad(value, width = 2) {
  return String(value).padStart(width, "0");
}

function toAst(date) {
  const seconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
  const totalTicks = Math.min(TICKS_PER_DAY - 1, Math.floor(seconds / SECONDS_PER_TICK));
  const totalSlices = Math.floor(totalTicks / TICKS_PER_SLICE);
  const totalRounds = Math.floor(totalSlices / SLICES_PER_ROUND);
  const globalBlockIndex = Math.floor(totalRounds / ROUNDS_PER_BLOCK);
  const shift = Math.floor(globalBlockIndex / BLOCKS_PER_SHIFT) + 1;
  const block = (globalBlockIndex % BLOCKS_PER_SHIFT) + 1;
  const round = totalRounds % ROUNDS_PER_BLOCK;
  const slice = totalSlices % SLICES_PER_ROUND;

  return { shift, block, round, slice, globalBlock: globalBlockIndex + 1, globalBlockIndex };
}

function astDate(date) {
  const start = Date.UTC(date.getFullYear(), 0, 1);
  const today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const dayIndex = Math.floor((today - start) / 86400000);
  if (dayIndex === 364) return "National Adjustment Day";
  if (dayIndex === 365) return "Bonus Adjustment Day";
  const month = Math.floor(dayIndex / 28);
  return `${MONTHS[month]}, Day ${pad((dayIndex % 28) + 1)}`;
}

function convertModern(date) {
  const ast = toAst(date);
  const formal = `AST ${ast.shift}.${ast.block}.${ast.round}.${pad(ast.slice)}`;
  const civilian = `${ast.globalBlock}:${ast.round}:${pad(ast.slice)} AST`;
  const filing = `${DAYS[date.getDay()]}, ${astDate(date)}; ${formal}; ${civilian}; Block ${ast.globalBlock}: ${BLOCK_ALIASES[ast.globalBlockIndex]}`;
  return { formal, civilian, filing };
}

function parseAst(value) {
  const match = value.trim().replace(/^AST\s+/i, "").match(/^([12])\.([1-5])\.([0-5])\.(\d{1,2})$/);
  if (!match) throw new Error("expected Shift.Block.Round.Slice");
  const [, shift, block, round, slice] = match.map(Number);
  if (slice < 0 || slice > 11) throw new Error("slice must be 0-11");
  return { shift, block, round, slice };
}

function astToModernParts(ast) {
  const globalBlockIndex = (ast.shift - 1) * BLOCKS_PER_SHIFT + (ast.block - 1);
  const seconds = globalBlockIndex * SECONDS_PER_BLOCK +
    ast.round * SLICES_PER_ROUND * TICKS_PER_SLICE * SECONDS_PER_TICK +
    ast.slice * TICKS_PER_SLICE * SECONDS_PER_TICK;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return {
    time: `${pad(hours)}:${pad(minutes)}`,
    civilian: `${globalBlockIndex + 1}:${ast.round}:${pad(ast.slice)} AST`,
  };
}

function setModernNow() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  $("modernInput").value = now.toISOString().slice(0, 16);
}

async function copy(value, statusElement) {
  try {
    await navigator.clipboard.writeText(value);
    statusElement.textContent = "copied";
  } catch (error) {
    statusElement.textContent = "copy unavailable";
  }
}

$("modernForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const value = $("modernInput").value;
  if (!value) return;
  const result = convertModern(new Date(value));
  $("modernOfficial").textContent = result.formal;
  $("modernCivilian").textContent = result.civilian;
  $("modernFiling").textContent = result.filing;
  state.modernResult = result.filing;
});

$("modernNow").addEventListener("click", () => {
  setModernNow();
  $("modernForm").requestSubmit();
});

$("astForm").addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const result = astToModernParts(parseAst($("astInput").value));
    $("astModern").textContent = result.time;
    $("astCivilian").textContent = result.civilian;
    $("astValidation").textContent = "accepted";
    state.astResult = `${$("astInput").value.trim()} ~= ${result.time} local / ${result.civilian}`;
  } catch (error) {
    $("astModern").textContent = "-";
    $("astCivilian").textContent = "-";
    $("astValidation").textContent = error.message;
    state.astResult = "";
  }
});

$("copyModernResult").addEventListener("click", () => copy(state.modernResult, $("modernStatus")));
$("copyAstResult").addEventListener("click", () => copy(state.astResult, $("astStatus")));

setModernNow();
$("modernForm").requestSubmit();
