init_fbgrid= function (set) {
      return this.each(function (i) {
        var $this = $(this);
        
        if (!set) {
          set = $.extend({}, ($('[name="size"]', this).is('select') ? {size: $('[name="freezerbox_info_size"]', this).val()}:{}));
        }
        //var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        // Get size of the freezer box, default to 6x6
        var row = 6;
        var col = 6;
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
        //$this.freezerbox('set_color', set.color);
        
        $this.freezerbox('_resize');
      });
    },
    
    _get_settings= function () {
        var $this = $(this).first();
        var set = $.parseJSON($('[name="freezerbox_settings"]', $this).val());
        set.cell_data = $.parseJSON(set.cell_data);
        return set;
      },
      
    _resize= function() {
        return this.each(function (i) {
          var $this = $(this);
          $('.ui-freezerbox', $this).width(Math.min($(window).width(), Math.max($('.ui-freezerbox-info table', $this).outerWidth(true), $('.ui-freezerbox-grid table', $this).outerWidth(true))));
          $this.trigger('resize.freezerbox');
        });
      }
