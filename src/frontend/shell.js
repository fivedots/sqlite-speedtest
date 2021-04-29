var statusElement = document.getElementById('status');
var progressElement = document.getElementById('progress');
var spinnerElement = document.getElementById('spinner');
var outputElement = document.getElementById('output');
if (outputElement) outputElement.value = ''; //clear browser cache

var worker = new Worker('speedtest1.js');
worker.onerror = function (err) {
  console.log(err);
};
worker.onmessage = function (e) {
  let data = e.data;
  switch (data.cmd) {
    case 'print':
      if (outputElement) {
        outputElement.value += data.text + "\n";
        outputElement.scrollTop = outputElement.scrollHeight; // focus on bottom
      }
      break;
    case 'printErr':
      if (outputElement) {
        outputElement.value += "ERROR: " + data.text + "\n";
        outputElement.scrollTop = outputElement.scrollHeight; // focus on bottom
      }
      break;
    case 'setStatus':
      let text = data.text;
      if (data.m) {
        text = data.m[1];
        progressElement.value = parseInt(data.m[2]) * 100;
        progressElement.max = parseInt(data.m[4]) * 100;
        progressElement.hidden = false;
        spinnerElement.hidden = false;
      } else {
        progressElement.value = null;
        progressElement.max = null;
        progressElement.hidden = true;
        if (!text) spinnerElement.style.display = 'none';
      }
      statusElement.innerHTML = text;
      break;
    case 'benchmarkResults':
      showBenchmarkResults(data.benchmarkResults);
      break;
    default:
      console.log('Message with unknown command received', e);
  }
};

function runBenchmark() {
  args = [];
  let filesystem = document.getElementById("filesystem").value;
  args.push(`/${filesystem}/speedtest_db`);
  let size = document.getElementById("testsize").value;
  args.push("--size");
  args.push(size);
  worker.postMessage({
    'cmd': "runSpeedtest",
    'args': args,
    'filesystem': filesystem,
  });
}

function getBenchmarkResults() {
  worker.postMessage({
    'cmd': 'getBenchmarkResults',
  });
}

function showBenchmarkResults(results) {
  let tbody = document.getElementById('performance_tbody');
  for (key of Object.keys(results).sort()) {
    let value = results[key];
    let row = '<tr>';
    row += `<td>${key}</td><td>${value}</td>`;
    row += '</tr>';
    tbody.innerHTML += row;
  }
}

function renderFrontend(type) {
  let option = document.getElementById('storageFoundationOption');
  option.innerHTML = `Storage Founcation (${type})`;
  option.value = `sfafs-${type}`;
}
