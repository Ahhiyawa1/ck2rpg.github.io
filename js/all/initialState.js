let bookText = aliceText.split("");
let currentBookPosition = 0;

let settings = {}
settings.width = 16490 //8192 4096
settings.height = 6755 //4096 2048
settings.tooSmallProvince = 900 // 900 was my default before
settings.horizontalSpread = false; // the new try, not working
settings.verticalSpread = true; //the original I've been using
settings.fixBlockiness = false; // setting to true will allow land provinces to override water
settings.equator = (settings.height - settings.height / 10)
settings.riversDistance = 1000
settings.riverIntoOcean = 1
settings.ethnicities = "vanilla"
let waterProvinceCounter = 0;
let landProvinceCounter = 0;
settings.landProvinceLimit = 8000 // 8000
settings.waterProvinceLimit = 10000 //10000
settings.fillInLimit = 20


let brush = {}
brush.terrain = "plains"

let limits = {}
limits.pineTree = {
  lower: 10,
  upper: 255
}

limits.hills = {
  lower: 205,
  upper: 255
}

limits.mountains = {
  lower: 255,
  upper: 510,
  snowLine: 450
}
limits.raindrops = {
  lower: 600
}

limits.seaLevel = {
  upper: 36 // elevation is divided by two in heightmap!
}


//climate classifications defined in distance from equator

function createVaryRange() {
  let arr = [];
  let last = 0;
  for (let i = 0; i < 512; i++) {
    last += getRandomInt(-1, 1);
    if (last > 15) {
      last = 15
    } 
    if (last < -15) {
      last = -15
    }
    arr.push(last)
  }
  return arr;
}


function modifyClimate(t) {
  let mod = settings.width / 16490;
  t.lower = Math.floor(t.lowerBase * mod);
  t.upper = Math.floor(t.upperBase * mod);
  if (t.plains) {
    t.plains = Math.floor(t.plains * mod)
  }
  settings.equator = (settings.height - settings.height / 10)

}

function resetClimateLimits() {
  modifyClimate(limits.tropical)
  modifyClimate(limits.subTropical);
  modifyClimate(limits.temperate);
  modifyClimate(limits.cold);
}

limits.tropical = {
  lower: 0,
  lowerBase: 0,
  upper: 1007,
  upperBase: 1007,
}

limits.tropical.varyRange = createVaryRange();

limits.subTropical = {
  lower: 1008,
  lowerBase: 1008,
  upper: 1520,
  upperBase: 1520
}

limits.subTropical.varyRange = createVaryRange()

limits.temperate = {
  lower: 1521,
  lowerBase: 1521,
  upper: 2865,
  upperBase: 2865
}

limits.temperate.varyRange = createVaryRange();

limits.cold = {
  lower: 2866,
  lowerBase: 2866,
  plains: 3300,
  plainsBase: 3300,
  upper: 6755,
  upperBase: 6755
}

limits.cold.varyRange = createVaryRange();




let world = {};
world.coveredWater = 0;
world.waterCells = 0
world.lastMaps = []
world.lastCounter = -1

var canvas = document.getElementById("canvas");
//canvas.style.width = '95vw';  // Example display size
canvas.style.width = '100vw'
canvas.style.height = '100vh';  // Example display size
var ctx = canvas.getContext('2d')

//let paintbrush = "raiseLand"
let paintbrush = "provinceOverride"
let paintbrushSize = 30;
let paintbrushHardness = 50;
let paintbrushLast = 0
let paintbrushShape = "circle"
let paintbrushTerrain = "plains"
let paintbrushFeather = false;
let paintbrushTitle = "0, 0, 0"
let paintbrushTitleR = 0;
let paintbrushTitleG = 0;
let paintbrushTitleB = 0;
let saveState = false;
GID("tracking-toggle").onclick = function() {
  if (saveState === false) {
    saveState = true;
    GID("undoMap").style.display = "inline-block";
    GID("redoMap").style.display = "inline-block";
    GID("tracking-toggle").innerHTML = "Turn Off Undo"
  } else {
    saveState = false;
    GID("tracking-toggle").innerHTML = "Turn On Undo (Can Cause Crashes)"
    GID("undoMap").style.display = "none";
    GID("redoMap").style.display = "none";
  }
}

let gCount = 0;
let bCount = 0;

const daBom = `\ufeff`
let colorKeys = {}

let provinceCount = 0;
let adjacencySet = new Set();

let uniqueColorSet = new Set();
for (let i = 0; i < 20000; i++) {
   uniqueColorSet.add(getRandomColor())
}
uniqueColorSet = [...uniqueColorSet]

let uniqueColorCount = 0;

let simp = new SimplexNoise()

function noise(nx, ny) {
    return simp.noise2D(nx, ny) / 2 + 0.5;
}