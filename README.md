# SQLite Speedtest with Emscripten

This repository shows how to compile and run the speedtest1 from the SQLite
project in the browser using different storage backends.

## Getting the Source

```shell
git clone --recurse-submodules https://github.com/fivedots/sqlite-speedtest.git
```

## Running the speedtest
To compile, navigate to the sqlite-speedtest directory and run

```shell
make dist/speedtest1-sync.js
cd dist
python3 -m http.server 8888
```

Then open the following link in a Chrome instance with the
"Experimental Web Platform features" flag enabled:
[localhost:8888/speedtest1-sync.html](http://localhost:8888/speedtest1-sync.html). 

This speedtest has been tested with Chrome version 90.

You should reload the page after each run of the benchmark to reset the
application.

## Results
The speedtest can be run using MEMFS, IDBFS and a new file system based on
Storage Foundation API, an upcoming fast storage API for the web. 

MEMFS shows faster execution since database files are only kept in
memory. Similarly, IDBFS shows faster execution, since operations are not
actually persisted from within the Wasm module, see the [Emscripten
documentation](https://emscripten.org/docs/api_reference/Filesystem-API.html)
for more information. SFAFS on the other hand persists all data on the hard
drive.

## More information
For more information about Storage Foundation API check out the 
[Storage Foundation Explainer](https://github.com/WICG/storage-foundation-api-explainer). 

SQLite's speedtest is explained in more detail at [sqlite.org/cpu.html](https://sqlite.org/cpu.html).
