// by Juan Orozco
// on 12/16/2016
//
// So, i'd prefer this be a js class or even a jQuery plugin but I ran out of time. It's almost there though!
//
//
function DHTMLXMenus( opts ) = {
  this.menus = [];
  this.opts = opts;
};

//init menus by adding this function wherever you need it... but NOT HERE!!
DHTMLXMenus.prototype.init = function(menu_name)
{
  var menu_obj, menu_list, item, result, opts;

  //set vars
  opts = this.opts;
  menu_obj = get_menu_obj_by_name(menu_name);
  if ( opts.)
  {

  }
  menu_list = window.custom_menu_items[menu_name];

  //loops through items and creates events
  for ( i in menu_list )
  {
    if ( menu_list.hasOwnProperty(i) )
    {
      item = menu_list[i];  //get menu item
      result = build_menu_item(menu_name, item);  //inits the dhtmlx menu item

      item = null;
      result = null;
    }
  };

  menu_obj.attachEvent( "onClick", function( id )
  {
    //related table should work this way...
    custom_menu_events( menu_name, id );
  });

}



// returns a dhtmlx menu object from the global menu storage object
// requires the name of the menu it was stored as
//
DHTMLXMenus.prototype.get_menu_obj_by_name = function(menu_name)
{
  var menu = false;
  if ( genSearchMenus && genSearchMenus.hasOwnProperty(menu_name) )
  {
    menu = genSearchMenus[menu_name];
  }
  else
  {
    //fallback, won't show custom theme if selected...
    menu = new dhtmlXMenuObject(menu_name);
  }
  return menu;
}

// Generic event handler for custom menu events
//
// needs the name of the menu and the id of the item clicked
// If it can't find a callback in the config object, it will resolve to menuClick.
DHTMLXMenus.prototype.custom_menu_events = function( menu_name, id )
{
  var found, actual_id;
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
DHTMLXMenus.prototype.build_menu_item = function( menu_name, item )
{
  var resp, menu, grid, sel_row, item_id;

  //set default
  resp = false;
  //get the appropraite menu object (this returns the dhtmlx object)
  menu = get_menu_obj_by_name( menu_name );

  //return false if one of the vars is null/undefined/false
  if ( item && menu_name )
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
      menu.addNewChild(item.parent, item.order, item.code + "_" + menu_name, item.name, false);
      
      //add key combo event only if set in object
      if ( item.key_code )
      {
        menu.setHotKey( item.code + "_" + menu_name, item.key_code);
        Mousetrap.bind(item.key_code, function(e) {
          menuClick(item.code);
        });

      }

      //add event handler that toggles visibility based on grid selection
      if ( item.require_selection )
      {
        grid = getRelatedGridByName(menu_name);
        //make sure grid is not false or null
        if ( grid )
        {
          //create a closure scoped variable
          item_id = item.code + "_" + menu_name;
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

DHTMLXMenus.prototype.custom_menu_item_state_event = function( grid, menu, item_id )
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

if ( !window.custom_menu_events )
{
  window.custom_menu_items = {};
}