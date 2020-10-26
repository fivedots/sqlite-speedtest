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
make all
cd dist
python3 -m http.server 8888
```

Then open the following link in a Chrome instance with the
"Experimental Web Platform features" flag enabled:
[localhost:8888/speedtest1.html](http://localhost:8888/speedtest1.html).

## More information
For more information about NativeIO check out the 
[NativeIO Explainer](https://github.com/fivedots/nativeio-explainer). 

SQLite's speedtest is explained in more detail at [sqlite.org/cpu.html](https://sqlite.org/cpu.html).
