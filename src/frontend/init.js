var Module = {
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
    var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
    var now = Date.now();
    if (m && now - Module.setStatus.last.time < 30) return; // if this is a progress update, skip it if too soon
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
    default:
      console.log('Message with unknown command received', e);
  }
};

function runSpeedtest(data) {
  switch (data.filesystem) {
    case 'nativeiofs':
      // Remove old data in NativeIO's directory
      var entries = nativeIO.getAllSync();
      for (e of entries) { nativeIO.deleteSync(e);}
      console.log('deleted', entries);
      FS.mkdir('/nativeiofs');
      FS.mount(NATIVEIOFS, { root: '.' }, '/nativeiofs');
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
  callMain(data.args);
}
