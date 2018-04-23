/*
var sync = PouchDB.sync('mydb', 'http://localhost:5984/mydb', {
  live: true,
  retry: true
}).on('change', function (info) {
  // handle change
}).on('paused', function (err) {
  // replication paused (e.g. replication up to date, user went offline)
}).on('active', function () {
  // replicate resumed (e.g. new changes replicating, user went back online)
}).on('denied', function (err) {
  // a document failed to replicate (e.g. due to permissions)
}).on('complete', function (info) {
  // handle complete
}).on('error', function (err) {
  // handle error
});

sync.cancel(); 
*/