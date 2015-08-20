var Database = (function() {
  var MongoClient = require('mongodb').MongoClient,
  Promise = require('promise');

  var _status = {
    connected: "connected",
    disconnected: "disconnected"
  },
  _currentStatus = _status.disconnected,
  _currentDb = null;

  var obj = function() {

  };

  function ConnectionIsNotEstablished(message) {
    this.name = "ConnectionIsNotEstablished";
    this.message = (message || "");
  }

  obj.prototype = {
    connect: function(url) {
      var connection = MongoClient.connect(url);

      connection.then(function(db) {
        _currentStatus = _status.connected;
        _currentDb = db;
      });

      return connection;
    },
    getDatabases: function() {
      var promiseObj = new Promise(function(resolve, reject) {
        if (_currentStatus === _status.connected) {
          // Use the admin database for the operation
          var adminDb = _currentDb.admin();
          // List all the available databases
          adminDb.listDatabases(function(err, dbs) {

            if (err) {
              reject(err);
            } else {
              var dbsList = [];
              dbs.databases.forEach(function(element, index, array){
                dbsList.push(element.name);
              });
              dbsList.sort();
              resolve(dbsList);
            }
          });
        } else {
          reject(new ConnectionIsNotEstablished("Connection is not established"));
        }
      });

      return promiseObj;
    },
    getCollections: function(dbName) {
      var self = this;
      var promiseObj = new Promise(function(resolve, reject) {
        if (_currentStatus === _status.connected) {
          self.useDatabase(dbName);
          var db = _currentDb;
          db.collections(function(err, cols) {
            if (err) {
              reject(err);
            } else {
              var collectionsList = [];
              for (var i in cols) {
                var colName = cols[i].collectionName;
                if (colName !== 'system.indexes' && colName !== 'system.users') {
                  collectionsList.push(colName);
                }
              }
              resolve(collectionsList);
            }
          });
        } else {
          reject(new ConnectionIsNotEstablished("Connection is not established"));
        }
      });

      return promiseObj;
    },
    getRecords: function(dbName, collectionName) {
      var self = this;
      var promiseObj = new Promise(function(resolve, reject) {
        if (_currentStatus === _status.connected) {
          self.useDatabase(dbName);
          var currentCollection = _currentDb.collection(collectionName);
          currentCollection.find(function(err, rec) {
            if (err) {
              reject(err);
            } else {
              var records = [];
              rec.forEach(function(doc) {
                records.push({
                  record: doc
                });
              })
              resolve(records);
            }
          });
        } else {
          reject(new ConnectionIsNotEstablished("Connection is not established"));
        }
      });
      return promiseObj;
    },
    closeConnection: function() {
      _currentDb.close();
    },
    getServerStatus: function() {
      var adminDb = _currentDb.admin();
      return adminDb.serverStatus();
    },
    addDatabase: function(dbName) {
      return this.getCollections(dbName);
    },
    addCollection: function(dbName,collectionName) {
      this.useDatabase(dbName);
      return _currentDb.createCollection(collectionName);
    },
    addRecord: function(dbName, collectionName, records) {
      this.useDatabase(dbName);
      return _currentDb.collection(collectionName).insert(records);
    },
    dropDatabase: function(dbName) {
      var self = this;
      var promiseObj = new Promise(function(resolve, reject) {
        if (_currentStatus === _status.connected) {
          _currentDb.db(dbName).dropDatabase().then(function(){
            resolve("deleted");
          }, function (ex) {
            reject(ex);
          });
          self.useDatabase("admin");
        } else {
          reject(new ConnectionIsNotEstablished("Connection is not established"));
        }
      });
      return promiseObj;
    },
    dropCollection: function(dbName, collectionName) {
      var self = this;
      var promiseObj = new Promise(function(resolve, reject) {
        if (_currentStatus === _status.connected) {
          _currentDb.db(dbName).dropCollection(collectionName).then(function(){
            resolve("deleted");
          }, function (ex) {
            reject(ex);
          });
          self.useDatabase("admin");
        } else {
          reject(new ConnectionIsNotEstablished("Connection is not established"));
        }
      });
      return promiseObj;
    },
    useDatabase: function(dbName){
      _currentDb = _currentDb.db(dbName);
    }
  }
  return obj;

})(Database || {});
