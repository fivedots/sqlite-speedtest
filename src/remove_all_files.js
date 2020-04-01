var entries = io.listByPrefix('');
for (e of entries) { io.unlink(e);}
console.log('deleted', entries);
