# Emscripten

EMCC_PATH = /usr/local/google/home/krivoy/fugu/emdev/emscripten/emcc
EMRUN_PATH = /usr/local/google/home/krivoy/fugu/emdev/emscripten/emrun

# dependencies

SQLITE_AMALGAMATION = sqlite-amalgamation-3250200

# source files

EXPORTED_FUNCTIONS_JSON = src/exported_functions.json

# temporary files

BITCODE_FILES = temp/bc/sqlite3.bc temp/bc/speedtest1.bc

# build options

CFLAGS = \
	-D_HAVE_SQLITE_CONFIG_H \
	-Isrc/c -I'deps/$(SQLITE_AMALGAMATION)'

EMFLAGS = \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s EXPORTED_FUNCTIONS=@$(EXPORTED_FUNCTIONS_JSON) \
	-s RESERVED_FUNCTION_POINTERS=64 \
	-s WASM=1 \
	-s ASYNCIFY \
	-s ASYNCFS \
	-s FORCE_FILESYSTEM=1 \
	-s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE='["$$NATIVEIOFS"]' \
	-lnodefs.js \
	--js-library ../emfs/library_nativeiofs.js \
	--js-library ../emfs/library_async_nativeiofs.js \
	--pre-js src/arguments.js \
	--post-js src/mount_nativeio.js \
	--post-js src/remove_all_files.js

EMFLAGS_DIST = \
	-s INLINING_LIMIT=10 \
	-s ASSERTIONS=1 \
	-O3 \
	--emrun

#EMFLAGS_DIST = \
	-s INLINING_LIMIT=50 \
	-s IGNORE_CLOSURE_COMPILER_ERRORS=1 \
	--closure 1 \
	-Os \
	--emrun

# directories

.PHONY: all
all: dist

.PHONY: clean
clean:
	rm -rf dist debug temp

.PHONY: clean-all
clean-all:
	rm -rf dist debug temp deps

## deps

.PHONY: clean-deps
clean-deps:
	rm -rf deps

.PHONY: deps
deps: deps/$(SQLITE_AMALGAMATION) deps/$(EXPORTED_FUNCTIONS) deps/speedtest1.c

## temp

.PHONY: clean-temp
clean-temp:
	rm -rf temp

temp/bc/sqlite3.bc: deps/$(SQLITE_AMALGAMATION) src/c/config.h
	mkdir -p temp/bc
	$(EMCC_PATH) $(CFLAGS) -s LINKABLE=1 'deps/$(SQLITE_AMALGAMATION)/sqlite3.c' -o $@

temp/bc/speedtest1.bc: deps/$(SQLITE_AMALGAMATION) src/c/config.h
	mkdir -p temp/bc
	$(EMCC_PATH) $(CFLAGS) -s LINKABLE=1 'deps/speedtest1.c' -o $@

## dist

.PHONY: clean-dist
clean-dist:
	rm -rf dist

.PHONY: dist
dist: dist/sqlite3.js dist/index.html dist/sqlite3.html

.PHONY: run
run: dist
	$(EMRUN_PATH) --serve_after_exit --no_browser dist/index.html

dist/sqlite3.html: $(BITCODE_FILES) $(EXPORTED_FUNCTIONS_JSON)
	mkdir -p dist
	$(EMCC_PATH) $(EMFLAGS) $(EMFLAGS_DIST) $(BITCODE_FILES) -o $@

dist/sqlite3.js: $(BITCODE_FILES) $(EXPORTED_FUNCTIONS_JSON)
	mkdir -p dist
	$(EMCC_PATH) $(EMFLAGS) $(EMFLAGS_DIST) $(BITCODE_FILES) -o $@

dist/index.html: src/index.html
	cp $< $@
