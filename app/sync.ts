const couchDBTestServer = 'https://couchdb-604ef9.smileupps.com/';
   

        //let dbName = compose(toLower, n => getDatabaseName(n)("todos"), emailToUsername)(nextProps.userEmail);
         
        //console.log(dbName); 
        /*
        let remoteDB = new PouchDB( 
            `https://couchdb-604ef9.smileupps.com/${dbName}`,
            {
                skip_setup: true, 
                //ajax: { 
                //    headers: {
                //        'Cookie': nextProps.authSession
                //    }, 
                //    withCredentials: false
                //}
            }
        );  

        todos_db.sync(remoteDB, {live: true,retry: true}) 
        .on(
            'change', 
            function (info) {
                console.log('change',info);
            }
        )
        .on(
            'paused', 
            function (err) {
                console.log('paused',err);
            }
        )
        .on(
            'active', 
            function () {
                console.log('active');
            }
        )
        .on(
            'denied', 
            function (err) {
                console.log('denied',err);
            }
        )
        .on(
            'complete', 
            function (info) {
                console.log('complete',info);
        
            }
        )
        .on(
            'error', 
            function (err) {
                console.log('error',err);
            }
        );  


if(this.props.authSession!==nextProps.authSession || true){
  console.log(`diff`); 

  console.log(`authSession ${nextProps.authSession}`); 
  console.log(`userEmail ${nextProps.userEmail}`); 
   
  if(isString(nextProps.userEmail) || true){

     
  } 

}
*/


/*
Example
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
