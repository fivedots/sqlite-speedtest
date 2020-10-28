# Emscripten
CC = emcc

# C sources
SQLITE_FOLDER = third_party/sqlite/
DB_SRC = $(SQLITE_FOLDER)/sqlite3.c
TEST_SRC = $(SQLITE_FOLDER)/speedtest1.c

# JS/HTML sources
SHELL_FILE = src/frontend/shell.html
INIT_FILE = src/frontend/init.js

# Filesystem library
NATIVEIOFSLIB = third_party/nativeio-emscripten-fs/library_nativeiofs.js

# build options
OPTIMIZATION_LEVEL = O0

CFLAGS = \
	-DSQLITE_ENABLE_MEMSYS5 \
	-$(OPTIMIZATION_LEVEL) \
	-Wall \
	-s USE_PTHREADS=1

EMFLAGS = $(CFLAGS) \
	-I$(SQLITE_FOLDER) \
	-s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE='["$$NATIVEIOFS","$$MEMFS"]' \
	--js-library $(NATIVEIOFSLIB) \
	-lidbfs.js

.PHONY: all
all: dist/speedtest1.js

.PHONY: clean
clean:
	rm -rf dist

dist/sqlite3.o: $(DB_SRC)
	mkdir -p dist
	$(CC) $(CFLAGS) -c $< -o $@

dist/speedtest1.html: $(SHELL_FILE)
	cp $< $@

dist/speedtest1.js: dist/sqlite3.o dist/speedtest1.html $(INIT_FILE)
	$(CC) $(EMFLAGS) -ldl -lpthread ./$(TEST_SRC) ./$< --pre-js $(INIT_FILE) -o $@ 
