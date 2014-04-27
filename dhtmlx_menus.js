// by Juan Orozco
// on 12/16/2014
//
// So, i'd prefer this be a js class or even a jQuery plugin but I ran out of time. It's almost there though!
//
//
var DHTMLXMenus = function( opts )
{
  var go_debug, options, debug;

  //constructor
  function menu_build(opts)
  {
    //var debug;
    this.menus = [];
    options = opts;
    go_debug = true;

    debug = function(m)
    {
      if (go_debug)
      {
        console.log("");
        console.log("--- DEBUG ---");
        console.log("");
        console.log(m);
        console.log("");
        console.log("--- /DEBUG ---");
        console.log("");
      }
    }
  
  }

  //init menus
  menu_build.prototype.init = function()
  {
    var menu_obj, menu_list, item, result, opts;
    debug("Initializing.");

    //set vars
    opts = options;
    menu_obj = this.getMenuObjByName(opts.menu_name);
    if ( !opts )
    {
      //legacy
      menu_list = window.custom_menu_items[opts.menu_name];
    }
    else
    {
      menu_list = opts.menu_list;
    }

    //loops through items and creates events
    for ( i in menu_list )
    {
      if ( menu_list.hasOwnProperty(i) )
      {
        //clear from last loop
        item = null;
        result = null;

        //get menu item
        item = menu_list[i];

        //inits the dhtmlx menu item
        result = this.buildMenuItem(opts.menu_name, item);

      }
    }
    menu_obj.attachEvent( "onClick", function( id )
    {
      //manages callbacks for all items
      customMenuEvents( opts.menu_name, id );
    });
  }

  menu_build.prototype.getDebugMode = function()
  {
    return go_debug;
  }

  // returns a dhtmlx menu object from the global menu storage object
  // requires the name of the menu it was stored as
  //
  menu_build.prototype.getMenuObjByName = function()
  {
    var menu, opts;

    menu = false;
    opts = this.opts;
    if ( window.genSearchMenus && window.genSearchMenus.hasOwnProperty(menu_name) )
    {
      menu = genSearchMenus[menu_name];
    }
    else
    {
      //fallback, won't show custom theme if selected...
      menu = {};//new dhtmlXMenuObject(menu_name);
    }
    return menu;
  }

  // Generic event handler for custom menu events
  //
  // needs the name of the menu and the id of the item clicked
  // If it can't find a callback in the config object, it will resolve to menuClick.
  menu_build.prototype.customMenuEvents = function( menu_name, id )
  {
    var found, actual_id, opts;
    if ( id && menu_name )
    {
      item_list = window.custom_menu_items[menu_name];

      found = false;

      //parse out menu name from id
      actual_id = id.substring( 0, id.indexOf('_') );

      for ( i in item_list )
      {
        if ( item_list.hasOwnProperty(i) )
        {
          var item = item_list[i];
          //check if code exists, has a callback
          if ( item.code == actual_id && item.callback )
          {
            found = true;
            item.callback();
          }

        }

      }

      //if item does not have a callback, use menu global callback
      if ( found == false )
      {
        menuClick( id );

      }
      
    }

  }

  // Builds individual items using templates
  //
  //  requires the menu_name to pull from the global stored list of menus
  //  the item object that contains all the necessary elements for the menu item
  menu_build.prototype.buildMenuItem = function( item )
  {
    var resp, menu, grid, sel_row, item_id, opts;



    //set default
    resp = false;
    //get the appropraite menu object (this returns the dhtmlx object)
    menu = getMenuObjByName( opts.menu_name );

    //return false if one of the vars is null/undefined/false
    if ( item && opts.menu_name )
    {
      //build a sibling
      if ( item.type == "sibling" )
      {

        menu.addNewSibling(item.sibling, item.code, item.name, false);

        resp = true;
      }

      //build a child menu with mousetrap event
      if ( item.type == "child" )
      {
        //child
        menu.addNewChild(item.parent, item.order, item.code + "_" + opts.menu_name, item.name, false);
        
        //add key combo event only if set in object
        if ( item.key_code )
        {
          menu.setHotKey( item.code + "_" + opts.menu_name, item.key_code);
          Mousetrap.bind(item.key_code, function(e) {
            menuClick(item.code);
          });

        }

        //add event handler that toggles visibility based on grid selection
        if ( item.require_selection )
        {
          grid = getRelatedGridByName(opts.menu_name);
          //make sure grid is not false or null
          if ( grid )
          {
            //create a closure scoped variable
            item_id = item.code + "_" + opts.menu_name;
            //create event to toggle state
            grid.attachEvent("onSelectStateChanged",function()
            {
              custom_menu_item_state_event( grid, menu, item_id );
            });
            //create event to force state after row deletion

            grid.attachEvent("onAfterRowDeleted",function()
            {
              console.log("Item removed from grid, checking selection and updating menu.");
              custom_menu_item_state_event( grid, menu, item_id );
            });

            //check now
            custom_menu_item_state_event( grid, menu, item_id );
          }
        }

        resp = true;
      }
    }

    //done
    return resp;
  }

  menu_build.prototype.custom_menu_item_state_event = function( grid, menu, item_id )
  {
    var sel_row;

    sel_row = grid.getSelectedRowId();

    if (sel_row)
    {
      menu.setItemEnabled(item_id);
    }
    else
    {
      menu.setItemDisabled(item_id);

    }
  }

  //return object
  return menu_build;
}();

var test = {menu_name:"POOP", menu_list:{}};
var poop = new DHTMLXMenus( test );
poop.init();