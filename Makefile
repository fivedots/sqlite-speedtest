# Emscripten
CC = emcc
MODCC = ../emscripten/emcc
ASYNC_SYSCALL_LIB = ../emscripten/src/library_syscall_async.js

# C sources
SQLITE_FOLDER = third_party/sqlite
DB_SRC = $(SQLITE_FOLDER)/sqlite3.c
TEST_SRC = $(SQLITE_FOLDER)/speedtest1.c

# JS/HTML sources
SHELL_FILE = src/frontend/shell.html
SHELL_JS = src/frontend/shell.js
INIT_FILE = src/frontend/init.js

# Filesystem library
SFAFSLIB = third_party/nativeio-emscripten-fs/library_sfafs.js
ASYNC_LIB = third_party/nativeio-emscripten-fs/async/library_async_sfafs.js

# build options
OPTIMIZATION_LEVEL = O3

CFLAGS = \
	-DSQLITE_ENABLE_MEMSYS5 \
	-$(OPTIMIZATION_LEVEL) \
	-Wall \
	-Isrc/ \
	-D_HAVE_SQLITE_CONFIG_H \
	-DSQLITE_THREADSAFE=0

EMFLAGS = $(CFLAGS) \
	-s ALLOW_MEMORY_GROWTH=1 \
	-I$(SQLITE_FOLDER) \
	-s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE='["$$SFAFS","$$MEMFS"]' \
	-s ASYNCIFY \
	--js-library $(SFAFSLIB) \
	-lidbfs.js \
	-s ASYNCIFY_STACK_SIZE=40960 \

EMFLAGS_ASYNC = $(CFLAGS) \
	-s ALLOW_MEMORY_GROWTH=1 \
	-I$(SQLITE_FOLDER) \
	-s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE='["$$MEMFS", "$$AsyncFSImpl"]' \
	-s USE_PTHREADS=1 \
	-s ASYNCIFY \
	-s ASYNCFS \
	--js-library $(ASYNC_LIB) \
	-s ASYNCIFY_STACK_SIZE=40906

.PHONY: all
all: dist/speedtest1-sync.js dist/speedtest1-async.js

.PHONY: clean
clean:
	rm -rf dist/*

dist/sqlite3.o: $(DB_SRC) src/config.h
	mkdir -p dist
	$(MODCC) $(CFLAGS) -c $< -o $@

dist/shell-sync.js: $(SHELL_JS)
	cp $< $@
	sed -i -e 's/speedtest1.js/speedtest1-sync.js/g' $@
	echo "renderFrontend('sync');" >> $@

dist/shell-async.js: $(SHELL_JS)
	cp $< $@
	sed -i -e 's/speedtest1.js/speedtest1-async.js/g' $@
	echo "renderFrontend('async');" >> $@

dist/speedtest1-sync.html: $(SHELL_FILE) dist/shell-sync.js
	cp $< $@
	sed -i -e 's/shell.js/shell-sync.js/g' $@

dist/speedtest1-async.html: $(SHELL_FILE) dist/shell-async.js
	cp $< $@
	sed -i -e 's/shell.js/shell-async.js/g' $@

dist/speedtest1-sync.js: dist/sqlite3.o dist/speedtest1-sync.html $(INIT_FILE) $(SFAFSLIB) src/config.h
	$(CC) $(EMFLAGS) -ldl ./$(TEST_SRC) ./$< --pre-js $(INIT_FILE) -o $@ 

dist/speedtest1-async.js: dist/sqlite3.o dist/speedtest1-async.html $(INIT_FILE) $(ASYNC_LIB) $(ASYNC_SYSCALL_LIB) src/config.h
	$(MODCC) $(EMFLAGS_ASYNC) -ldl ./$(TEST_SRC) ./$< --pre-js $(INIT_FILE) -o $@ 
