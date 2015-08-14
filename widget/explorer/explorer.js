// var data = [{title: '1' , onclick: function(){ alert("1")}, childNodes: [{title: '2' , onclick: '', iconUrl: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQksKsAGoBzu9Z2OMgzhf7KelvG_dcClRasCX6MIcjpGzLNK8fCyg"},
// {title: '3' , onclick: '', childNodes: [{title: '2' , onclick: ''},
// {title: '3' , onclick: '',childNodes: [{title: '2' , onclick: ''},
// {title: '3' , onclick: ''},
// {title: '4' , onclick: ''}]},
// {title: '4' , onclick: ''}]},
// {title: '4' , onclick: ''}]},
// {title: '2' , onclick: ''},
// {title: '3' , onclick: ''},
// {title: '4' , onclick: '', contextMenu: [{title: "View", onclick: function(){
//   alert("view");
// } }  ,{ title: "Edit", onclick: function(){
//       alert("Edit");
//     }  }]
//   }];

(function(){
  var ID = function () {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return 'explorer-' + Math.random().toString(36).substr(2, 9);
  };
  //var template = document.getElementById("explorer-content-template").innerHTML;
  var template =   '<div class="explorer-header"><div class="explorer-icon"></div><div class="explorer-title-icon"></div><div class="explorer-title"></div></div>';

  this.Explorer = function(element, contents, options){
        var explorerEventsObject = {}, contextMenusObject = {};
        var titleProperty = options.titleProperty, iconProperty = options.iconProperty, childNodesProperty = options.childNodesProperty, clickProperty = options.clickProperty, contextMenuProperty = options.contextMenuProperty;

        function createTreeView(element, contents, options){
          if(contents){
            contents.forEach(function(item, index, array){
              var node = document.createElement('div');
              node.innerHTML = template;
              var explorerIcon = node.querySelector(".explorer-icon"),
              explorerTitle = node.querySelector(".explorer-title"),
              explorerTitleIcon = node.querySelector(".explorer-title-icon"),
              explorerHeader = node.querySelector(".explorer-header");

              explorerIcon.addEventListener("click", toggleChildNodes);
              explorerTitle.innerHTML = item[titleProperty];
              explorerTitle.id = ID();
              if(iconProperty && item[iconProperty]){
                explorerTitleIcon.style.backgroundImage = 'url("' + item[iconProperty] + '")';
              }
              else{
                explorerTitleIcon.classList.add('explorer-hide');
              }

              if(clickProperty && item[clickProperty]){
                  explorerEventsObject[explorerTitle.id] = item[clickProperty];
              }

              if(contextMenuProperty && item[contextMenuProperty]){
                  contextMenusObject[explorerTitle.id] = item[contextMenuProperty];
              }

              element.appendChild(node);
              if(childNodesProperty && item[childNodesProperty] && item[childNodesProperty].length){
                var childNode = document.createElement('div');
                childNode.className = "explorer-child-node explorer-child-node-margin";
                node.appendChild(childNode);
                createTreeView(childNode, item[childNodesProperty], options);
              }
              else{
                explorerIcon.classList.add('explorer-hidden');
              }
            });
          }
        }
        function toggleChildNodes(event){
          var icon = event.currentTarget;
          var node = icon.parentNode.parentNode;
          var childNode = node.querySelector(".explorer-child-node");
          if(childNode){
            icon.classList.toggle('collapsed');
            childNode.classList.toggle('explorer-hide');
          }
        }

        // click event
        document.addEventListener("click", function(event){
            var node = event.target,
                contextMenu = element.querySelector(".explorer-contextmenu");
            if(node.classList.contains("explorer-title")){
                var clickEvent = explorerEventsObject[node.id];
                if(clickEvent){
                    clickEvent();
                }
            }

            else if(node.classList.contains("explorer-contextmenu-item")){
                var clickEvent = explorerEventsObject[node.id];
                if(clickEvent){
                    clickEvent();
                    contextMenu.classList.add("explorer-hide");
                }
            }

            else{
              contextMenu.classList.add("explorer-hide");
            }
        });

        //context menu
        document.addEventListener("contextmenu", function(event){
            var node = event.target;
            if(node.classList.contains("explorer-title")){
                event.preventDefault();
                var contextMenu = element.querySelector(".explorer-contextmenu");
                if (contextMenu) {
                  contextMenu.style.top = event.clientY + "px";
                  contextMenu.style.left = event.clientX + "px";
                  contextMenu.innerHTML = ""; // Remove previous menu items
                  menuItems = contextMenusObject[node.id];
                  if(menuItems){
                    contextNode.classList.remove("explorer-hide");
                  menuItems.forEach(function(item){
                    var menuItemNode = document.createElement('div');
                    menuItemNode.innerHTML = item[titleProperty];
                    menuItemNode.id = ID();
                    menuItemNode.classList.add("explorer-contextmenu-item");

                    if(clickProperty && item[clickProperty]){
                        explorerEventsObject[menuItemNode.id] = item[clickProperty];
                    }

                    contextMenu.appendChild(menuItemNode);
                  });
                }
                }
            }
        });

        //create tree view
        createTreeView(element, contents, options);

        //add contextmenu
        var contextNode = document.createElement('div');
        contextNode.classList.add("explorer-contextmenu");
        contextNode.classList.add("explorer-hide");
        element.appendChild(contextNode);
  }
})();

// var container = document.getElementById("explorer-container");
// new Explorer(container, data ,{
//                       titleProperty: "title",
//                       iconProperty: "iconUrl",
//                       childNodesProperty:  "childNodes",
//                       clickProperty: "onclick",
//                       contextMenuProperty: "contextMenu"});
