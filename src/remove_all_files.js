var entries = io.listByPrefix('');
var paths = '';
for (e of entries) { io.unlink(e); paths += AsyncFSImpl.decodePath(e) + ' ';}
console.log('deleted', paths);
