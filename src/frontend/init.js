// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var Module = {
  benchmark_results: {},
  noInitialRun: true,
  preRun: [],
  postRun: [],
  print: (function() {
    return function(text) {
      if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
      console.log(text);
      self.postMessage({
        'cmd': 'print',
        'text': text,
      });
    }
  })(),
  printErr: function(text) {
    if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
    console.error(text);
    self.postMessage({
      'cmd': 'printErr',
      'text': text,
    });
  },
  setStatus: function(text) {
    if (!Module.setStatus.last) Module.setStatus.last = { time: Date.now(), text: '' };
    if (text === Module.setStatus.last.text) return;
    // Matches a string of the form
    // "Sometext(NumRemainingDeps/NumTotalDeps)MoreText", with m[1] as
    // SomeText, m[2] as NumRemainingDeps and m[4] as NumTotalDeps.
    let m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
    let now = Date.now();
    if (m && now - Module.setStatus.last.time < 30) return; // if this is a progress update, skip it if too soon.
    Module.setStatus.last.time = now;
    Module.setStatus.last.text = text;
    self.postMessage({
      'cmd': 'setStatus',
      'text': text,
      'm': m,
    });
  },
  totalDependencies: 0,
  monitorRunDependencies: function(left) {
    this.totalDependencies = Math.max(this.totalDependencies, left);
    Module.setStatus(left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
  }
};
Module.setStatus('Waiting for start...');


onmessage = function(e) {
  let data = e.data;
  switch (data.cmd) {
    case 'runSpeedtest':
      runSpeedtest(data);
      break;
    case 'getBenchmarkResults':
      getBenchmarkResults();
      break;
    default:
      console.log('Message with unknown command received', e);
  }
};

function prepareStorageFoundation() {
  // Remove old data in Storage Foundation's directory
  let entries = storageFoundation.getAllSync();
  for (e of entries) { storageFoundation.deleteSync(e);}
  console.log('Cleanup: deleted', entries);
  // Reserve a lot of capacity!
  storageFoundation.requestCapacitySync(1024*1024*1024);
}

function runSpeedtest(data) {
  switch (data.filesystem) {
    case 'sfafs-sync':
      prepareStorageFoundation();
      FS.mkdir('/sfafs-sync');
      FS.mount(SFAFS, { root: '.' }, '/sfafs-sync');
      break;
    case 'sfafs-async':
      prepareStorageFoundation()
      FS.mkdir('/sfafs-async');
      break;
    case 'memfs':
      FS.mkdir('/memfs');
      FS.mount(MEMFS, { root: '.' }, '/memfs');
      break;
    case 'idbfs':
      FS.mkdir('/idbfs');
      FS.mount(IDBFS, { root: '.' }, '/idbfs');
      break;
    default:
      Module.printErr('Unknown file system', data.filesystem);
  }
  console.log(`Running speedtest1 under ${data.filesystem}.`);

  speedtest_args = data.args;
  speedtest_args.push('--stats');
  speedtest_args.push('--singlethread');
  callMain(speedtest_args);
}

function getBenchmarkResults() {
  self.postMessage({
    'cmd': 'benchmarkResults',
    'benchmarkResults': Module.benchmark_results,
  });
}