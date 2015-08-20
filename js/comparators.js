//object comparator function
function objectComparator(sourceObject, targetObject){
  var result = [];

  //check for added and changed property
  for (var property in targetObject) {
    if(sourceObject[property] !== undefined){
      if(typeof targetObject[property] === 'function'){

      }
      else if(typeof targetObject[property] === 'object'){
        if(objectComparator(sourceObject[property] , targetObject[property]).length > 0){
          result.push({property: property, comment: "changed"});
        }
      }

      else if(Array.isArray(targetObject[property])){
        if(!arrayComparator(sourceObject[property] , targetObject[property])){
          result.push({property: property, comment: "changed"});
        }
      }
      else if(sourceObject[property] !== targetObject[property]){
        result.push({property: property, comment: "changed"});
      }
    }
    else{
      result.push({property: property, comment: "added"});
    }
  }

  //check for removed property
  for (var property in sourceObject) {
    if(targetObject[property] === undefined){
      result.push({property: property, comment: "removed"});
    }
  }

  return result;
}

//array comparator function
function arrayComparator(sourceArray, targetArray){
  if(Array.isArray(sourceArray) && Array.isArray(targetArray) && sourceArray.length === targetArray.length){
    for (var index = 0; index < targetArray.length; index++) {
      var item = targetArray[index];
      if(typeof item === 'function'){

      }
      else if(typeof item === 'object'){
        if(objectComparator(sourceArray[index] , item).length > 0){
          return false;
        }
      }

      else if(Array.isArray(item)){
        if(arrayComparator(sourceArray[index] , item)){
          return false;
        }
      }
      else if(sourceArray[index] !== item){
        return false;
      }
    }
    return true;
  }
  else{
    return false;
  }
}
