/*
Author: Eileen Campbell
*/
(function($) {
  
  var freezerbox_methods = {
    
    //////////////////////////////////////////////////
    // Public methods

    init: function (options) {
      // If this element is already a freezerbox widget, destroy it and re-init it
      $('.ui-freezerbox', this).freezerbox('destroy');
      
      var settings = $.extend({
        name : '',    // string; name of freezer box
        size : '9x9', // string; format '#x#'
        color : '(None)',   // string; values are: "(None)","black","blue","brown","gray","green","natural","orange","pink","purple","red","white","yellow"
        //loc : '',     // string; location
        box: '',
        shelf: '',
        rack: '',
        desc : '',    // string; description,
        col_labels: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'], // array: column label values,
        row_labels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25], // array: row label values,
        cell_data : {}, // map; cell: cell form
        json_str : '',  // if json_str is not empty, it overrides all ui-freezerbox-info and ui-freezerbox-grid values
        cellform_id : 'freezerbox_cellform', // string; id of cell form
        cellform_isvalid: function (b_suppress_message, form_id) {return true;},  // function; function called to validate cell form
        readonly : false  // boolean; true if readonly
      }, options);
      
      var $this = $(this);
      
      $this
        .freezerbox('init_cellform', settings)
        .freezerbox('init_tooltip');
      
      this.each(function (i) {
        var fb_id = $(this).freezerbox('_get_fb_id');
        // Create the main divs and hidden fields of the freezer box
        $('<div id="'+fb_id+'" class="ui-freezerbox ui-freezerbox-content ui-widget-content ui-corner-all" style="overflow: auto"/>')
          .append('<form id="' + fb_id + '_info" class="ui-freezerbox-info" name="freezerbox_info"/>')
          .append('<div class="ui-freezerbox-grid"/>')
          .append('<input name="freezerbox_settings" type="hidden" value=""/>')
          .append('<input name="freezerbox_newcell" type="hidden" value=""/>')
          .append('<input name="freezerbox_cellisvalid" type="hidden" value=""/>')
          .append('<input name="freezerbox_copiedcell" type="hidden" value=""/>')
          .appendTo(this);
      });
        
      // Init the hidden fields of the freezer box
      // Save the cell form as the default for new cells
      $('[name="freezerbox_newcell"]', this).val(JSON.stringify($('#'+settings.cellform_id).serializeArray()));
      // Before saving the settings, remove some items so it is not so big when saved in the hidden field
      // Save and remove the cellform_isvalid
      $('[name="freezerbox_cellisvalid"]', this).val(settings.cellform_isvalid.toString());
      delete settings.cellform_isvalid;
      // Save and remove the json_str
      var json_str = settings.json_str;
      delete settings.json_str;
      // Save settings
      $this.freezerbox('_set_settings', settings);

      // Init the main divs of the freezer box
      $this.freezerbox('init_fbinfo', settings);
      if ((json_str !== '') && (json_str !== '[]') && (json_str !== '{}')) {
        $this.freezerbox('import_json', json_str);
      }
      
      $(window).bind('resize', function () {
        $this.freezerbox('_resize');
      });
      
      return this;
    },
    
    destroy: function () {
      return this.each(function (i) {
        var $this = $(this);
        
        // Get the settings before we remove the freezerbox
        var set = $this.freezerbox('_get_settings');
        // Remove the freezerbox content
        $('.ui-freezerbox', this).remove();
        // Before removing the dialog, make sure there are no other freezer
        // boxes using it
        if ($('.ui-freezerbox').filter(function (idx) {
            return ($(this).freezerbox('_get_settings').cellform_id === set.cellform_id);
          }).length < 1) {
          $('#'+set.cellform_id).dialog('destroy');
          // Remove any colorselect widgets in the dialog
          $('#'+set.cellform_id+' input[name*="_color"]').colorselect('destroy');
        }
        // Remove hidden fields for cell key and fb id for editing cells
        // only if there are no more freezer boxes
        if ($('.ui-freezerbox').length < 1) {
          $('#freezerbox_id').remove();
          $('#freezerbox_cellkey').remove();
        }
      });
    },

    init_cellform: function (set) {
      var cellform = $('#'+set.cellform_id);
      // Create hidden fields for the cell key and fb element for editing cells 
      // if they don't already exist
      if ($('#freezerbox_cellkey').length < 1) {
        cellform
          .after('<input id="freezerbox_id" name="freezerbox_id" type="hidden" value=""/>')        
          .after('<input id="freezerbox_cellkey" name="freezerbox_cellkey" type="hidden" value=""/>');
      }
      // Init any _color inputs in the cell form as colorselect object
      $('input[name*="_color"]', cellform).colorselect({
        colors: ["","black","lightblue","darkblue","brown","gray","green","beige","orange","pink","purple","red","white","yellow"],
        names: {"":"(None)","lightblue":"light blue","darkblue":"dark blue","beige":"natural"},
        readonly: set.readonly
      });
      var form_w = cellform.width();
      // Init the cell form as a dialog
      cellform.dialog({
        autoOpen: false,
        dialogClass: "ui-freezerbox-content",
        width: Math.min($(window).width()-40,form_w),
        modal: true,
        zIndex: 5,
        buttons: {
          Cancel: function() {
            $(this).dialog("close");
          },
          Save: function() {
            $('.ui-state-error', cellform).removeClass('ui-state-error');
            var key = $('#freezerbox_cellkey').val();
            var fb = $('#'+$('#freezerbox_id').val()).parent();
            var _set = fb.freezerbox('_get_settings');
            // Give the function the name, is_valid
            eval($('[name="freezerbox_cellisvalid"]', fb).val().replace(/^function \(/, 'function is_valid ('));
            var err = is_valid(false, _set.cellform_id);
            $(err)
              .addClass('ui-state-error')
              .first().focus();
            if (err.length === 0) {
              fb.freezerbox('save_cellform', key, _set);
              $(this).dialog("close");
            }
          }
        },
        open: function() {
          // Set the width of the dialog
          $(this).dialog('option','width',form_w);
          if ($(this).dialog('option','width') > $('#the_form').parent().width()) {
            $(this).dialog('option','width',$('#the_form').parent().width()-40);
          }
          
          var key = $('#freezerbox_cellkey').val();
          var fb = $('#'+$('#freezerbox_id').val()).parent();
          $(this).dialog('option', { title: 'Cell '+key });
          fb.freezerbox('load_cellform', key, fb.freezerbox('_get_settings'));
          // Set the height of the container element only when the entry form dialog is open
          // We do this because the container height will not include the dialog height
          // if the dialog has been resized since the position becomes absolute
          // Store the height in an attribute in the form element
          var $container = $('#the_form').parent();
          if (typeof($(this).attr('container-height')) == 'undefined') {
            $(this).attr('container-height', $container.height());
          }
          $container.height($(this).attr('container-height'));
          fb.trigger('resize.freezerbox');
        },
        close: function() {
          $('.ui-state-error', cellform).removeClass('ui-state-error');
          var fb = $('#'+$('#freezerbox_id').val()).parent();
          $('#the_form').parent().css('height', '');
          fb.trigger('resize.freezerbox');
        }
      });
      return this;
    },
    
    init_tooltip: function() {
      return this.each(function (i) {
        var $this = $(this);

        // Set the tooltips for this freezerbox cells
        $this.tooltip({
          tooltipClass: 'ui-freezerbox-tooltip-content',
          //TODO: Limit the cell selector to cell with data??  Faster??
          items:'.ui-freezerbox-cell,img[alt],[title]',
          content:function () {
            var item = $(this);
            if (item.is('.ui-freezerbox-cell')) {
              var key = item.parent().attr('id').replace(/.+_/, '');
              var set = $this.freezerbox('_get_settings');
              if (set.cell_data[key]) {
                // The tooltip is a scaled down version of the cell form
                // Clone the cell form
                $this.freezerbox('load_cellform', key, set);
                var tooltip = $('#'+set.cellform_id).clone(true, true);
                // Remove any images and input fields that don't contain user data
                $('img,:submit,:reset,:image,:button,[type="hidden"]', tooltip).remove();
                // Use a smaller color box for the colorselect
                  $('.ui-colorselect', tooltip).colorselect('resize_box', 9);
                // Set the checked attribute for radio and checkboxes
                $(':checked', tooltip).attr('checked','');
                // Replace the input elements with their values, except radio and checkboxes
                $('input:not(:radio,:checkbox),select,textarea', tooltip).replaceWith(function(idx, old) {
                  var val = $(this).val();
                  if ($(this).is('select')) {
                    // Set the value of the select from the cell form; value didn't carry over from clone
                    $(this).val($('#'+set.cellform_id+' [name="' +$(this).attr('name')+ '"]').val());
                    val = $(':selected', this).text();
                  }
                  else if ($(this).is('textarea')) {
                    // Set the value of the textarea from the cell form; value didn't carry over from clone
                    $(this).val($('#'+set.cellform_id+' [name="' +$(this).attr('name')+ '"]').val());
                    val = $(this).val();
                  }
                  return $('<span class="ui-freezerbox-tooltip-data"/>').text(val);
                });
                // Simplify the html in the tooltip since <table> not work consistently
                tooltip_html = [];
                tooltip.find('tr').each(function (i, ele) {
                    tooltip_html.push('<span style="float: left">' + $(ele).find('th').text() + ': </span>' + $(ele).find('td').html());
                });
                return tooltip_html.join('<br/>');
                //return tooltip.html();
              }
            }
            else if (item.is("[title]")) {
              return item.attr("title");
            }
            else if (item.is("img")) {
              return item.attr("alt");
            }
            return '';
          }
        });   
      });     
    },
    
    init_fbinfo: function (set) {
      // Objects for init fb info form
      var fbinfo_flds = [
        {"text":"Name","name":"freezerbox_info_name_mandatory","set_key":"name","value":"","edit_html":'<input size="50" required="required" placeholder="Enter a name for this freezer box"/><span style="color:red">*</span>',"view_html":'<span/>'},
        {"text":"Size","name":"freezerbox_info_size","set_key":"size","value":"9x9","edit_html":'<select/>',"view_html":'<span/>'},
        {"text":"Color","name":"freezerbox_info_color","set_key":"color","value":"","edit_html":'<input size="30" placeholder="Select a color for this freezer box"/>',"view_html":'<span/>'},
        //{"text":"Location","name":"freezerbox_info_loc","set_key":"loc","value":"","edit_html":'<input size="50" placeholder="Enter a location for this freezer box"/>',"view_html":'<span/>'},
        {"text":"Box","name":"freezerbox_info_loc","set_key":"box","value":"","edit_html":'<input size="50" placeholder="Enter a Box location for this freezer box"/>',"view_html":'<span/>'},
        {"text":"Shelf","name":"freezerbox_info_loc","set_key":"shelf","value":"","edit_html":'<input size="50" placeholder="Enter a Shelf location for this freezer box"/>',"view_html":'<span/>'},
        {"text":"Rack","name":"freezerbox_info_loc","set_key":"rack","value":"","edit_html":'<input size="50" placeholder="Enter a Rack location for this freezer box"/>',"view_html":'<span/>'},
        {"text":"Description","name":"freezerbox_info_desc","set_key":"desc","value":"","edit_html":'<textarea rows="3" cols=50" placeholder="Enter a description for this freezer box"/>',"view_html":'<span/>'},
        {"text":"","name":"freezerbox_info_swapLabels", "set_ket":"swap", "value":"Swap column and row labels", "edit_html":'<input type="button" class="button ui-button ui-widget ui-state-default ui-corner-all" size=30 />', "view_html":''}
      ];
      console.log("fbinfo_fields loaded");
      var fbinfo_sizes = [
        '4x4',
        '8x8',
        '9x9',
        '10x10',
        '12x12',
        'Custom...'
      ];
      var fbinfo_colors = ["","black","blue","brown","gray","green","beige","orange","pink","purple","red","white","yellow"];
      var fbinfo_names = {"":"(None)","beige":"natural"};
      
      return this.each(function (i) {
        var $this = $(this);
        
        // Create the fbinfo form contents, if it hasn't already been created
        if ($('[name="freezerbox_info_name_mandatory"]', this).length < 1) {
          var table = $('<table border="0" cellspacing="2" cellpadding="0"/>');
          var html_key = (set.readonly ? 'view_html' : 'edit_html');
          $.each(fbinfo_flds, function(idx, fld) {
            $('<tr/>')
              .append($('<th/>').text(fld.text ? fld.text+':' : ''))
              .append($('<td/>').append($(fld[html_key]).attr('name',fld.name)))
              .appendTo(table);
            // Add a hidden fields to specify custom row and col sizes
            if (!set.readonly && (fld.text === 'Size')) {
              $('<span id="freezerbox_info_custom_size" style="margin-left:20px"/>')
                .append('Rows <input name="freezerbox_info_custom_row_number" size="2" maxlength="2" type="text"/> Columns <input name="freezerbox_info_custom_col_number" size="2" maxlength="2" type="text"/>')
                .hide()
                .appendTo($('td:last', table));
            }
          });
          $('.ui-freezerbox-info', this).append(table);
          
          if (!set.readonly) {
            // Populate the select box
            var sel = $('[name="freezerbox_info_size"]', this);
            $.each(fbinfo_sizes, function(idx, size) {
             sel.append($('<option/>')
                .attr('value', size)
                .text(size));
            });
            // Make custom size input boxes spinners
            $('[name="freezerbox_info_custom_col_number"],[name="freezerbox_info_custom_row_number"]')
              .spinner({
                min: 1,
                max: 25,
                stop: function(evt, ui) {
                  var n = parseInt($(this).val());
                  if (!isNaN(n) && (n > 0) && (n <= 25)) {
                    $this.freezerbox('init_fbgrid');
                  }
                  else {
                    window.alert('Please enter a number between 1 and 25.');
                  }
                }
              })
              .blur(function() {
                var n = parseInt($(this).val());
                if (isNaN(n) || (n < 1) || (n > 25)) {
                  $(this).val($($(this).attr('name').indexOf('row') > -1 ? 'th.ui-freezerbox-grid-rowheader' : 'th.ui-freezerbox-grid-colheader').length);
                }
              });
            // Bind events
            sel.change(function() {
              $this.freezerbox('set_size', $(this).val());
            });
            // Init the colorselect inputs
            $('input[name*="_color"]', this)
              .colorselect({
                colors: fbinfo_colors,
                names: fbinfo_names,
                readonly: set.readonly
              })
              .change(function() {
                $this.freezerbox('set_color', $(this).colorselect('get_selbyname'));
              });
            $('input[name*="_swap"]', this)
              .click(function(){
                $this.freezerbox('swap_labels');
              });
          }
        }
        
        // Set the values of the fbinfo form
        $.each(fbinfo_flds, function(idx, fld) {
          var val = (set[fld.set_key] !== undefined ? set[fld.set_key] : fld.value);
          var f = $('[name="'+fld.name+'"]', $this);
          if (set.readonly) {
            f.text(val);
          }
          else if (fld.name.indexOf('_color') > -1) {
            f.colorselect('set_selbyname', val);
          }
          else {
            f.val(val);
            if ((fld.name === 'freezerbox_info_size') && (val !== f.val())) {
              f.val('Custom...');
              var custom_size = val.split('x');
              $('[name="freezerbox_info_custom_row_number"]').val(parseInt(custom_size[0]));
              $('[name="freezerbox_info_custom_col_number"]').val(parseInt(custom_size[1]));
            }
          }
        });
        
        var size = (set.readonly ? $('[name="freezerbox_info_size"]', this).text() : $('[name="freezerbox_info_size"]', this).val());
        $this.freezerbox('set_size', size);
        if (size === 'Custom...') {
          $this.freezerbox('init_fbgrid');
        }
        console.log("fbinfo_flds 1");
      });
       console.log("fbinfo_flds 2");
    },
    
    // set  settings, if not passed in, will get the size and color from the select boxes and
    //      merge with settings from the hidden variable
    init_fbgrid: function (set) {
      return this.each(function (i) {
        var $this = $(this);
        
        if (!set) {
          set = $.extend({}, $this.freezerbox('_get_settings'), ($('[name="freezerbox_info_size"]', this).is('select') ? {
            size: $('[name="freezerbox_info_size"]', this).val(),
            color: $('[name="freezerbox_info_color"]', this).colorselect('get_selbyname')
          } : {}));
        }
        var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        // Get size of the freezer box, default to 9x9
        var row = 9;
        var col = 9;
        if (set.size.search(/(\d+)x(\d+)/) > -1) {
          row = parseInt(RegExp.$1);
          col = parseInt(RegExp.$2);
        }
        else if (set.size === 'Custom...') {
          row = parseInt($('[name="freezerbox_info_custom_row_number"]', this).val());
          col = parseInt($('[name="freezerbox_info_custom_col_number"]', this).val());
        }
  
        // Clear the width and height of the div
        $('.ui-freezerbox', this).css({width:'',height:''});
        // Clear the current grid
        $('.ui-freezerbox-grid', this).empty();
        // Create grid
        var table = $('<table border="1" cellspacing="0"/>');
        // Add col header row
        var tr = $('<tr/>').append('<th/>');

        for (var c = 0; c < col; c++) {
          var th = $('<th class="ui-freezerbox-grid-colheader"/>').html("<div class='ui-freezerbox-colheader-inner'>"+set['col_labels'][c]+"</div>");
          tr.append(th); // APPENDING COLUMNS!
          // edit on click
          if(!set.readonly){
            th.click(function(e){
              e.stopPropagation();
              if(!$(this).attr('ineditmode')){
                $('.ui-freezerbox-edit-header').remove();
                $('.ui-freezerbox-grid-colheader, .ui-freezerbox-grid-rowheader').attr('ineditmode', '');
                var i = $('<input class="ui-freezerbox-edit-header" value="'+$('div', this).text()+'"/>');
                $(this).css('position', 'relative').attr('ineditmode', true).append(i);
                i.focus(); // set focus on first click
                var me = $(this);
                $(i).change(function(){
                  var newval = $(this).val();
                    $this.freezerbox('set_label', 'col_labels', me.index()-1, newval);
                    $('.ui-freezerbox-grid-colheader, .ui-freezerbox-grid-rowheader').attr('ineditmode', '');
                });
                // click outside -> exit edit mode
                $this.click(function(e){
                  $(i).trigger('change');
                });
              }
            });
          }
        }
        table.append(tr);
        var fb_id = $('.ui-freezerbox', this).attr('id');
        // Add rows
        for (var r = 1; r <= row; r++) {
          // Add row header cell
          var th = $('<th class="ui-freezerbox-grid-rowheader"/>').html("<div class='ui-freezerbox-rowheader-inner'>"+set['row_labels'][r-1]+"</div>");
          tr = $('<tr/>').append(th); // APNEDING ROWS!!!
          if(!set.readonly){
            th.click(function(e){
              e.stopPropagation();
              if(!$(this).attr('ineditmode')){
                $('.ui-freezerbox-edit-header').remove();
                $('.ui-freezerbox-grid-colheader, .ui-freezerbox-grid-rowheader').attr('ineditmode', '');
                var i = $('<input class="ui-freezerbox-edit-header" value="'+$('div', this).text()+'"/>');
                $(this).css('position', 'relative').attr('ineditmode', true).append(i);
                i.focus(); // set focus on first click
                var me = $(this);
                $(i).change(function(){
                  var newval = $(this).val();
                    $this.freezerbox('set_label', 'row_labels', me.parent().index()-1, newval);
                    $('.ui-freezerbox-grid-colheader, .ui-freezerbox-grid-rowheader').attr('ineditmode', '');
                });
                // click outside -> exit edit mode
                $this.click(function(e){
                  $(i).trigger('change');
                });
              }
            });
          }
          // Add data cells
          for (var c = 0; c < col; c++) {
            tr.append($('<td/>').attr('id',fb_id + '_cell_' + letters.charAt(c % 26) + r));
            //tr.append($('<td/>').attr('id',fb_id + '_cell_' + c + '-'+ (r-1) )); -- NBK - revert
          }
          table.append(tr);
        }
        $('.ui-freezerbox-grid', this).append(table);
        
        // Init the cell contents
        $('[id^="'+fb_id+'_cell_"]', this).each(function() {
          $('<div class="ui-freezerbox-cell"/>')
            .append('<div class="ui-freezerbox-cell-desc"/>')
            .append('<div class="ui-freezerbox-cell-colorbox"/>')
            .append('<div class="ui-freezerbox-cell-icon" style="display: none"/>')
            .appendTo(this);
          if (!set.readonly) {
            $('.ui-freezerbox-cell', this).droppable({
              accept: '.ui-freezerbox-cell',
              hoverClass: 'ui-state-hover',
              drop: function(evt, ui) {
                var target_key = $(this).parent().attr('id').replace(/.+_/,'');
                if (($('.ui-freezerbox-cell-desc a', this).length < 1) ||
                    window.confirm('Are you sure you want to overwrite cell, ' + target_key)) {
                  // Work around: Fix error "Cannot read property 'options' of undefined" when calling the
                  // statement directly; now we delay call for a millisecond
                  window.setTimeout(function () {
                    $this.freezerbox('move_cell', ui.draggable.parent().attr('id').replace(/.+_/,''), target_key);
                  }, 1);
                }
              }
            })
            .hover(function() {
              $this.freezerbox('toggle_icons', $(this), true);
            }, function() {
              $this.freezerbox('toggle_icons', $(this), false);
            });
          }
          var key = $(this).attr('id').replace(/.+_/, '');
          //var key = $(this).attr('id').split('_').reverse()[0] -- NBK - revert
          $this.freezerbox('set_fbcell', key, set);
        });
        
        // Set freezer box color
        $this.freezerbox('set_color', set.color);
        
        $this.freezerbox('_resize');
      });
    },

    toggle_icons: function(cell, show) {
        cell.find('.ui-freezerbox-cell-icon').toggle(show);
        cell.find('.ui-freezerbox-cell-colorbox').toggle(!show);
    },

    set_fbcell: function (key, set) {
      return this.each(function (i) {
        var $this = $(this);

        var fb_id = $('.ui-freezerbox', this).attr('id');
        var cell = $('#'+fb_id+'_cell_'+key + ' .ui-freezerbox-cell');
        // Remove draggable from cell
        cell.filter('.ui-draggable')
          .css('cursor','')
          .draggable('destroy');
        // Clear the contents of the divs of the cell
        $('[class^="ui-freezerbox-cell-"]', cell).empty();
        $('.ui-freezerbox-cell-colorbox', cell)
          .css({
            'background-color': '',
             border: ''
          })
          .removeAttr('title');

        var data = set.cell_data[key];
        if (data) {
          $this.freezerbox('load_cellform', key, set);
          // Get the data from the cell form for the desc & color for the grid cell
          var desc = [];
          var desc_done = false;
          var color_name = [];
          // Get the text fields
          $(':text,select,textarea', $('#'+set.cellform_id)).each(function(idx, e) {
            var $e = $(e);
            var val = '';
            if ($e.is('[name*="_color"]')) {
              color_name.push($e.val());
            }
            else if ($e.is(':text,textarea')) {
              val = $e.val();
            }
            else if ($e.is('select')) {
              val = $(':selected', $e).text();
            }
            if (!desc_done && (val !== '')) {
              if (desc.length < 1) {
                desc_done = (val.length > 23);
                desc.push(desc_done ? val.substr(0,20) + '...' : val);
              }
              else {
                desc_done = (desc.join('<br/>').length + val.length > 23);
                if (!desc_done) {
                  desc.push(val);
                  desc_done = (desc.length > 2);
                }
              }
            }
          });
          if (desc.length < 1) {
            desc.push('(No data specified)');
          }
          // Change the desc to it's html
          var desc_html = '';
          $.each(desc, function(idx, d) {
            desc[idx] = $('<span/>').text(d).html();
          });
          desc_html = desc.join('<br/>');
          if (!set.readonly) {
            cell
              .css('cursor','move')
              .draggable({
                containment: $('.ui-freezerbox', this),
                cursor: "move",
                revert: true,
                revertDuration: 0,
                snap: '.ui-freezerbox-cell',
                snapMode: "inner",
                zIndex: 100
              });
            $('.ui-freezerbox-cell-desc', cell).append($('<a href="#" title="Edit cell"/>').html(desc_html));
            $('.ui-freezerbox-cell-icon', cell).append('<a href="#" class="ui-icon ui-icon-trash" title="Clear cell"/><a href="#" class="ui-icon ui-icon-copy" title="Copy cell"/><a href="#" class="ui-icon ui-icon-clipboard" title="Paste copied cell"/>');
          }
          else {
            $('.ui-freezerbox-cell-desc', cell).html(desc_html);
          }
          if (color_name.length > 0) {
            // Use only the first _colorselect
            var color = $('#'+set.cellform_id+' input[name*="_color"]:first').colorselect('get_color', color_name[0]);
            if (color !== '') {
              $('.ui-freezerbox-cell-colorbox', cell)
                .css({
                  'background-color': $('#'+set.cellform_id+' input[name*="_color"]').colorselect('get_color', color_name[0]),
                  border: '1px solid gray'
                })
                .attr('title', color_name[0]);
            }
          }
        }
        else if (!set.readonly) {
          $('.ui-freezerbox-cell-icon', cell).append('<a href="#" class="ui-icon ui-icon-pencil" title="Edit cell"/><a href="#" class="ui-icon ui-icon-clipboard" title="Paste copied cell"/>');
        }
        // Bind the click events for the icons
        $('.ui-freezerbox-cell-desc a, .ui-icon-pencil', cell)
          .click(function() {
            $('#freezerbox_cellkey').val(key);
            $('#freezerbox_id').val(fb_id);
            $('#'+set.cellform_id).dialog("open");
            return false;
          });
        $('.ui-icon-trash', cell)
          .click(function() {
            $('#freezerbox_cellkey').val(key);
            $('#freezerbox_id').val(fb_id);
            if (window.confirm('Are you sure you want to clear cell, ' + key + '?')) {
              $this.freezerbox('delete_cell', key);
              $this.freezerbox('toggle_icons', cell, false);
            }
            return false;
          });
        $('.ui-icon-copy', cell)
          .click(function() {
            $this.freezerbox('copy_cell', key);
            return false;
          });
        $('.ui-icon-clipboard', cell)
          .toggle($('[name="freezerbox_copiedcell"]').val() != '')
          .click(function() {
            if (($('.ui-icon-pencil', $(this).parent()).length > 0) ||
                window.confirm('Are you sure you want to overwrite cell, ' + key)) {
              $this.freezerbox('paste_cell', key);
              $this.freezerbox('toggle_icons', cell, false);
            }
            return false;
          });
      });
    },
    
    delete_cell: function (key) {
      return this.each(function (i) {
        var $this = $(this);
        
        var set = $this.freezerbox('_get_settings');
        if (set.cell_data[key])
          delete set.cell_data[key];
        $this.freezerbox('_set_settings', set);
        $this.freezerbox('set_fbcell', key, set);
      });
    },
    
    move_cell: function (src_key, target_key) {
      //console.log(src_key+','+target_key);
      return this.each(function (i) {
        var $this = $(this);
        
        var set = $this.freezerbox('_get_settings');
        set.cell_data[target_key] = set.cell_data[src_key];
        delete set.cell_data[src_key];
        $this.freezerbox('_set_settings', set);
        $this.freezerbox('set_fbcell', target_key, set);
        $this.freezerbox('set_fbcell', src_key, set);
      });
     },

    copy_cell: function(key) {
      return this.each(function (i) {
        var $this = $(this);

        if ($('[name="freezerbox_copiedcell"]').val() == '') {
          $('.ui-icon-clipboard').show();
        }
        var set = $this.freezerbox('_get_settings');
        $('[name="freezerbox_copiedcell"]').val(JSON.stringify(set.cell_data[key]));
      });
    },

      paste_cell: function(key) {
      return this.each(function (i) {
        var $this = $(this);

        var set = $this.freezerbox('_get_settings');
        set.cell_data[key] = $.parseJSON($('[name="freezerbox_copiedcell"]').val());
        $this.freezerbox('_set_settings', set);
        $this.freezerbox('set_fbcell', key, set);
      });
    },
    
    set_color: function (color_name) {
      return this.each(function (i) {
        var text_color = 'white';
        // If the color is light, set the text_color to black
        switch (color_name) {
          case "natural":
          case "pink":
          case "white":
          case "yellow": text_color = 'black';
        }
        if (color_name !== '(None)') {
          $('.ui-freezerbox-grid th', this)
            .removeClass('ui-widget-header')
            .css({
              'background-color': $('[name="freezerbox_info_color"]', this).colorselect('get_color', color_name), 
              color: text_color
            });
        } 
        else {
          $('.ui-freezerbox-grid th', this)
            .css({
              'background-color':'', 
              color:''
            })
            .addClass('ui-widget-header');
        }
      });
    },

    set_size: function (size) {
      return this.each(function (i) {
        var $this = $(this);
        // Get size freezer box
        if (size.search(/(\d+)x(\d+)/) > -1) {
          if ($('#freezerbox_info_custom_size', this).length > 0) {
            var asize = size.split('x');
            $('#freezerbox_info_custom_size', this).hide();
            $('[name="freezerbox_info_custom_row_number"]', this).val(asize[0]);
            $('[name="freezerbox_info_custom_col_number"]', this).val(asize[1]);
          }
          // Re-init the grid
          $this.freezerbox('init_fbgrid');
        }
        else if (size === 'Custom...') {
          $('#freezerbox_info_custom_size', this).show();
        }
        else {
          $.error('Size ' + size + ' is not a valid size.');
        }
      });
    },
    
    load_cellform: function (key, set) {
      var $this = $(this).first();
      var json_data = (set.cell_data[key] ? JSON.stringify(set.cell_data[key]) : $('[name="freezerbox_newcell"]', $this).val());
      var form = $('#'+set.cellform_id);
      form.populate($this.freezerbox('_json_to_populate', json_data));
      $('input[name*="_color"]', form).each(function(idx, e) {
        $(this).colorselect('set_selbyname', $(this).val());
      })
      return this;
    },
    
    save_cellform: function (key, set) {
      var $this = $(this).first();
      set.cell_data[key] = $('#'+set.cellform_id).serializeArray();
      $this.freezerbox('_set_settings', set);
      $this.freezerbox('set_fbcell', key, set);
      return this;
    },

    swap_labels: function(){
      var $this = $(this).first();
      var set = $.extend({}, $this.freezerbox('_get_settings'));
      var setnew = JSON.parse(JSON.stringify(set));
      setnew['row_labels'] = set['col_labels'];
      setnew['col_labels'] = set['row_labels'];
      $this.freezerbox('_set_settings', setnew);

      // reset labels
      $('.ui-freezerbox-grid-colheader').each(function(c){
        $('div', this).text(setnew['col_labels'][c]);
      });
      $('.ui-freezerbox-grid-rowheader').each(function(r){
        $('div', this).text(setnew['row_labels'][r]);
      });

    },

    set_label: function(type, idx, value){
      var $this = $(this).first();
      // var set = $.extend({}, $this.freezerbox('_get_settings'));
      set = $.extend({}, $this.freezerbox('_get_settings'), ($('[name="freezerbox_info_size"]', this).is('select') ? {
            size: $('[name="freezerbox_info_size"]', this).val(),
            color: $('[name="freezerbox_info_color"]', this).colorselect('get_selbyname')
          } : {}));

      set[type][idx] = value;
      // if set the first row/colum ->make sure out-of-bounds cells correlate with the 1st value:
      if(idx==0){
        // grid size
        if (set.size.search(/(\d+)x(\d+)/) > -1) {
          var lastIdx = type=='row_labels' ? parseInt(RegExp.$1) : parseInt(RegExp.$2);
        }else if (set.size === 'Custom...') {
          var lastIdx = type=='row_labels' ? parseInt($('[name="freezerbox_info_custom_row_number"]', this).val()) : parseInt($('[name="freezerbox_info_custom_col_number"]', this).val());
        }
        // numeric?
        var vals = isNaN(Number(value)) ? ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'] : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25];
        for(var i=lastIdx; i<set[type].length; i++){
          set[type][i] = vals[i];
        }

      }
      $this.freezerbox('_set_settings', set);

      // reset labels
      $('.ui-freezerbox-grid-colheader').each(function(c){
        $('div', this).text(set['col_labels'][c]);
        $('input', this).remove();
      });
      $('.ui-freezerbox-grid-rowheader').each(function(r){
        $('div', this).text(set['row_labels'][r]);
        $('input', this).remove();
      });

    },
    
    import_json: function(json_data) {
      var fbinfo_flds = {
        "freezerbox_info_name_mandatory":"name",
        "freezerbox_info_size":"size",
        "freezerbox_info_color":"color",
        //"freezerbox_info_loc":"loc",
        "freezerbox_info_box":"box",
        "freezerbox_info_shelf":"shelf",
        "freezerbox_info_rack":"rack",
        "freezerbox_info_desc":"desc",
        "cell_data":"cell_data",
        "freezerbox_info_row_labels": "row_labels", // added by Masha Belyi
        "freezerbox_info_col_labels": "col_labels" // added by Masha Belyi
      };
      return this.each(function (i) {
        var $this = $(this);
        // Assign the settings from the json object
        var set = $this.freezerbox('_get_settings');
        var data = eval(json_data);
        var custom_row = '';
        var custom_col = '';
        if (data && (data.length > 0)) {
          $.each(data, function(idx, map) {
            var set_key = fbinfo_flds[map.name];
            if (set[set_key] !== undefined) {
              set[set_key] = map.value;
            }
            else if (map.name === 'freezerbox_info_custom_row_number') {
              custom_row = map.value;
            }
            else if (map.name === 'freezerbox_info_custom_col_number') {
              custom_col = map.value;
            }
          });
          if (set.size === 'Custom...') {
            set.size = custom_row + 'x' + custom_col;
          }
          $this.freezerbox('_set_settings', set);
          $this.freezerbox('init_fbinfo', set);
        }
      });
    },
    
    export_json: function() {
      var $this = $(this).first();
      var data = $('.ui-freezerbox-info', $this).serializeArray();
      // Prep the cell_data before saving to json_data
      var set = $this.freezerbox('_get_settings');
      set.size = $('[name="freezerbox_info_size"]').val();

      // added by Masha Belyi. Store cor+col label values
      data.push({"name":"freezerbox_info_row_labels", "value":set['row_labels']});
      data.push({"name":"freezerbox_info_col_labels", "value":set['col_labels']});
      //******

      // Remove any cell data that is not showing
      // NBK - revert to using key of format "A1", from MB's "0-0"
      if (set.size.search(/(\d+)x(\d+)/) > -1) {
        var last_row = parseInt(RegExp.$1);
        var last_col_idx = parseInt(RegExp.$2)-1;
      }else if (set.size === 'Custom...') {
        var last_row = parseInt($('[name="freezerbox_info_custom_row_number"]', this).val());
        var last_col_idx = parseInt($('[name="freezerbox_info_custom_col_number"]', this).val())-1;
      }
      var last_col = String.fromCharCode(last_col_idx + "A".charCodeAt(0));

      $.each(set.cell_data, function(key, value) {
        if (key.search(/([A-Z]+)(\d+)/) > -1) { // reverted by NBK
        //if ( key.search(/(\d+)-(\d+)/) > -1){ // added by MB ***
          var row = parseInt(RegExp.$2);
          var col = RegExp.$1;	// reverted by NBK
          if ((row > last_row) || (col > last_col)) {
            delete set.cell_data[key];
          }
        }
      });
      
      data.push({"name":"cell_data","value":set.cell_data});
      return JSON.stringify(data);
    },

    //////////////////////////////////////////////////
    // Private methods
    
    // Returns the settings for the first matched element
    _get_settings: function () {
      var $this = $(this).first();
      var set = $.parseJSON($('[name="freezerbox_settings"]', $this).val());
      set.cell_data = $.parseJSON(set.cell_data);
      return set;
    },
    
    _set_settings: function (set) {
      var json_set = $.extend({}, set, {
        cell_data: JSON.stringify(set.cell_data)
      });
      $('[name="freezerbox_settings"]', this).val(JSON.stringify(json_set));
      return this;
    },
    
    _resize: function() {
      return this.each(function (i) {
        var $this = $(this);
        $('.ui-freezerbox', $this).width(Math.min($(window).width(), Math.max($('.ui-freezerbox-info table', $this).outerWidth(true), $('.ui-freezerbox-grid table', $this).outerWidth(true))));
        $this.trigger('resize.freezerbox');
      });
    },
    
    _get_fb_id: function () {
      var cnt = 1;
      while ($('#freezerbox_'+cnt).length > 0)
        cnt++;
      return 'freezerbox_' + cnt;  
    },
    
    //internal method to convert into json format used by "populate", cloned from parent_form_script.js
    _json_to_populate: function (json) {
      var obj = eval(json);
      var result = [];
      try {
        $.each(obj, function(idx, o) {
          result.push('"' + o.name + '" : ' + JSON.stringify(o.value));
        });
      }
      catch(e) {}
      return eval('Object({' + result.join() + '})');
    }
    
  };

  $.fn.freezerbox = function(method) {
    // Method calling logic
    if (freezerbox_methods[method]) {
      return freezerbox_methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if ( typeof method === 'object' || !method) {
      return freezerbox_methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.freezerbox');
    }
  };
isready= true;
})(jQuery);
