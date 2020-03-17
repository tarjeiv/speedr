let fs = require('fs');
let readline = require('readline');
let minDistance = 200;

let stack = [];
let last = 0;
let deltas = [];

let inputFile = process.argv[2];

let lineReader = readline.createInterface({
    input: fs.createReadStream(inputFile)
  });
  
  lineReader.on('line', processLine);
  lineReader.on('close', function () {
      let sum = 0;
      for (let i=0; i<deltas.length; i++) {
          sum += deltas[i];
      }
      //console.log(sum/deltas.length);
  })

function processLine (line) {
    let lineArr = line.split(',');
    processReading({
        time:parseInt(lineArr[0]),
        speed:parseFloat(lineArr[1]),
        direction:lineArr[2]
     });
}

function processReading (data) {
    if (!last) {
        last = data.time;
    }
    else {
        let delta = data.time - last;
        last = data.time;
        if (delta<minDistance) {
            deltas.push(delta);
        }
    }
    // New, individual reading
    if (stack.length>0 && data.time>0 && data.time  - stack[stack.length-1].time > minDistance) {
        if (data.time >= 1524323342585) {
            processStack();
        }
        stack = [];
    }
    if (data.time && data.speed >= 30) {
        if (data.speed > 90) {
           // console.log(data);
        }
        stack.push(data);
    }
}

function processStack() {
    let anomalyCount = 0;
    let directions = {};
    directions['inbound'] = 0;
    directions['outbound'] = 0;
    for (let i=0;i<stack.length; i++) {
        let current = stack[i];
        directions[current.direction]++;
    }

    let dominantDirection = directions['inbound'] > directions['outbound'] ? 'inbound' : 'outbound';

    let anomalies = {};
    for (let i=0;i<stack.length; i++) {
        let current = stack[i];
        if (current.direction != dominantDirection) {
            anomalies[i] = ['Wrong Direction'];
            anomalyCount++;
        }
    }
    
    // Inbound should see fastest speeds in the beginning
    if (dominantDirection == 'inbound') {
        let first = stack[0];
        for (let i=1;i<stack.length; i++) {
            let current = stack[i];
            if (first.speed < current.speed) {
                if (!anomalies[i]) {anomalies[i] = []}
                anomalies[i].push("First reading not fastest");
                anomalyCount++;
                //console.warn("First reading is not fastes for inbound", first.speed, current.speed);
            }
        }
    }
    else {
        let last = stack[stack.length-1];
        for (let i=0;i<stack.length-1; i++) {
            let current = stack[i];
            if (last.speed < current.speed) {
                if (!anomalies[i]) {anomalies[i] = []}
                anomalies[i].push("Last reading not fastest");
                anomalyCount++;
                //console.warn("Last reading is not fastes for outbound", last.speed, current.speed);
            }
        }
    }

    let max = 0;
    let when;
    for (let i=0;i<stack.length; i++) {
        let current = stack[i];
        if (anomalies[i]) {
           // console.log("Anomaly weeded out: ", current);
        }
        else {
            if (current.speed > max) {
                max = current.speed
                when = current.time;
            }
        }
    }
    if (!when) {
        //console.log("NO RELIABLE READING!")
        return;
    }
    if (anomalyCount>0) {
        let date = new Date(when);
       // console.log(date.toISOString()+','+max+","+dominantDirection);
        // console.log("\nAnomalies: ", anomalies);
        // console.log(stack);
        // console.log("\n\n")
    }
}


var test = `
1524391692579,53.5,inbound
1524391692666,53.5,inbound
1524391692672,53.5,inbound
1524391692902,49.2,inbound
1524391692937,49.2,inbound
1524391692983,49.2,inbound
1524391693030,47,inbound
1524391693076,44.8,inbound
1524391693123,47,inbound
1524391693169,38.2,inbound
1524391693216,36.1,inbound

1524391752756,61.7,outbound
1524391752756,31.7,outbound
1524391752803,31.7,outbound
1524391752849,36.1,outbound
1524391752896,40.4,outbound
1524391752942,42.6,outbound
1524391752989,42.6,outbound
1524391753035,44.8,outbound
1524391753221,51.3,outbound

1524391788257,57.9,inbound
1524391788392,55.7,inbound
1524391788617,53.5,inbound
1524391788623,51.3,inbound
1524391788663,51.3,inbound
1524391788709,51.3,inbound
1524391788756,47,inbound
1524391788846,44.8,inbound
1524391788893,38.2,inbound
1524391789118,36.1,inbound

1524391876562,36.1,outbound
1524391876609,36.1,outbound
1524391876655,38.2,outbound
1524391876702,38.2,outbound
1524391876748,42.6,outbound
1524391876839,42.6,outbound
1524391876929,44.8,outbound
1524391877019,47,outbound
1524391877064,47,outbound
1524391877111,47,outbound
1524391877246,49.2,outbound
1524391877561,49.2,outbound

1524391893491,40.4,outbound
1524391893761,51.3,outbound

1524391946620,62.3,inbound
1524391946666,62.3,inbound
1524391946713,60.1,inbound
1524391946803,57.9,inbound
1524391946983,51.3,inbound
1524391947073,42.6,inbound
1524391947120,38.2,inbound
1524391947166,31.7,inbound

1524391977096,33.9,outbound
1524391977142,36.1,outbound
1524391977232,40.4,outbound
1524391977818,51.3,outbound
1524391977998,53.5,outbound
1524391978493,55.7,outbound
1524391978540,55.7,outbound
1524391978588,55.7,outbound

1524391978766,55.7,outbound
1524391978813,55.7,outbound
1524391978860,55.7,outbound
1524391978906,55.7,outbound
1524391978952,55.7,outbound

1524392008432,66.6,inbound
1524392008612,64.5,inbound
1524392008659,64.5,inbound
1524392008705,64.5,inbound
1524392008885,60.1,inbound
1524392008932,53.5,inbound
1524392008979,51.3,inbound
1524392009114,47,inbound
1524392009204,33.9,inbound

1524392041197,51.3,inbound
1524392041246,49.2,inbound
1524392041335,49.2,inbound
1524392041340,49.2,inbound
1524392041425,44.8,inbound
1524392041472,40.4,inbound
1524392041518,38.2,inbound
1524392041565,40.4,inbound
1524392041611,31.7,inbound
1524392041658,36.1,inbound
1524392041793,31.7,inbound
1524392041840,31.7,inbound

1524392046419,44.8,outbound
1524392046509,49.2,outbound
1524392046599,51.3,outbound
1524392047138,53.5,outbound
1524392090841,38.2,outbound
1524392090931,47,outbound
1524392091022,53.5,outbound
1524392091157,57.9,outbound

1524392156607,38.8,outbound
1524392156675,36.6,outbound
1524392156823,41,outbound
1524392156971,43.2,outbound
1524392157045,43.2,outbound
1524392157119,44.2,outbound
1524392157192,46.4,outbound
1524392157266,47.5,outbound
1524392157340,46.4,outbound
1524392157414,47.5,outbound
1524392157488,47.5,outbound
1524392157636,48.6,outbound
1524392157858,49.7,outbound
1524392158005,49.7,outbound
1524392158153,49.7,outbound
1524392158227,49.7,outbound
1524392158596,50.8,outbound

1524392212089,51.9,inbound
1524392212163,51.9,inbound
1524392212458,50.8,inbound
1524392212532,50.8,inbound
1524392212606,50.8,inbound
1524392212754,49.7,inbound
1524392212828,48.6,inbound
1524392212976,46.4,inbound
1524392213050,44.2,inbound
1524392213124,42.1,inbound
1524392213273,38.8,inbound
1524392213277,33.3,inbound
1524392213347,32.2,inbound
1524392213494,31.1,inbound
`;
