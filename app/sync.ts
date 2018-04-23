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



/*
let syncDatabase = (db) => {
    //retry 
    //live
    //check all params
    db.sync( 
        new PouchDB(
          'https://couchdb-604ef9.smileupps.com/todos', 
          {
              auth:{
                  username:'admin',
                  password:'54957bed1593'
              }
          }
       ) 
    )
    .on(
        'complete',  
        function () {
             console.log('done');
        }
    )
    .on('error', function (err) {
              console.log('error', err);
    });
}; 
*/