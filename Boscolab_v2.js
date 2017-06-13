my_widget_script =
{
  init:function (mode, json_data) {
    //this method is called when the form is being constructed
    // parameters
    // mode = if it equals 'view' than it should not be editable
    //        if it equals 'edit' then it will be used for entry
    //        if it equals 'view_dev' same as view,  does some additional checks that may slow things down in production
    //        if it equals 'edit_dev' same as edit,   does some additional checks that may slow things down in production

    // json_data will contain the data to populate the form with, it will be in the form of the data
    // returned from a call to to_json or empty if this is a new form.
    //By default it calls the parent_class's init.

    //TO DO write code specific to your form
    //this.parent_class.init(mode, json_data);
    
    
    $("#addwellbox").click(my_widget_script.createWellbox);
    
        
    $("#addCircle").click(my_widget_script.addCircle)
      
      $("container").css({
      width: "25%",
      "background-color": "red"
      }); 
    
 /*   $("#wellboxTable").css({
  width: "80%",
  margin: "0 auto",
  
}); */
      
    
   /*  if (mode == "view") {
            
       $("#addwellbox").hide();
        
    my_widget_script.parent_class.readonly();
     } */
  
  },

  to_json:function () {
    //should return a json string containing the data entered into the form by the user
    //whatever is return from the method is persisted in LabArchives.  must not be binary data.
    //called when the user hits the save button, when adding or editing an entry


    //TO DO write code specific to your form
    return this.parent_class.to_json();
  },

  from_json:function (json_data) {
    //populates the form with json_data
    //TO DO write code specific to your form
    this.parent_class.from_json(json_data);
  },

  test_data:function () {
    //during development this method is called to populate your form while in preview mode
    //TO DO write code specific to your form
    return this.parent_class.test_data();
  },

  is_valid:function (b_suppress_message) {
    //called when the user hits the save button, to allow for form validation.
    //returns an array of dom elements that are not valid - default is those elements marked as mandatory
    // that have no data in them.
    //You can modify this method, to highlight bad form elements etc...
    //LA calls this method with b_suppress_message and relies on your code to communicate issues to the user
    //Returning an empty array [] or NULL equals no error
    //TO DO write code specific to your form

    return this.parent_class.is_valid(b_suppress_message);
  },

  is_edited:function () {
    //should return true if the form has been edited since it was loaded or since reset_edited was called
    return this.parent_class.is_edited();
  },

  reset_edited:function () {
    //typically called have a save
    //TO DO write code specific to your form
    return this.parent_class.reset_edited();
  },
  
  createWellbox: function(){
    
    $("#addwellbox").hide();
    
     // If this element is already a freezerbox widget, destroy it and re-init it
    my_widget_script.destroy();
    
    var wellbox_id= my_widget_script._get_wb_id();
    var size=( function () { 
      value= $(this).val()
    // if (value == "custom") { value=0};
      return value
        }).bind($('select[name="size"]'))();
   
   // alert ("well box is under construction, the size is: "+ size)
      
      
		var row = 2;
        var col = 3;
     
        if ((/(\d+)x(\d+)/).test(size)) {
          
          //x = size.match(/(\d+)x(\d+)/).val;
          row = parseInt(RegExp.$1);
          col = parseInt(RegExp.$2);
        }
        else if (set.size === 'Custom...') {
          //row = parseInt($('[name="freezerbox_info_custom_row_number"]', this).val());
         // col = parseInt($('[name="freezerbox_info_custom_col_number"]', this).val());
         
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
          
          
        	alert("custom grid");
        	end
        }
  
        // Clear the width and height of the div
        $('.ui-freezerbox', this).css({width:'',height:''});
        // Clear the current grid
        $('.ui-freezerbox-grid', this).empty();
        
        
        
        // Create grid
        var table = $('<table id="wellbox" border="1" bordercolor="lightgrey" cellspacing="0"></table>');
        
    // Add col header row
        var tr = $('<tr></tr>').append('<th></th>');

        for (var c = 0; c < col; c++) {
          var th = $('<th class="ui-freezerbox-grid-colheader"></th>').html("<div class='ui-freezerbox-colheader-inner'>"+"</div>");
          
          th.css({"background-color": "GhostWhite", "height": "50px", "width": "100px"});
          
          tr.append(th); // APPENDING COLUMNS!
          // edit on click
        }
        table.append(tr);
        
    // Add rows
        for (var r = 1; r <= row; r++) {
          
          // Add row header cell
          var th = $('<th class="ui-freezerbox-grid-rowheader"></th>').html("<div class='ui-freezerbox-rowheader-inner'>"+"</div>");
         th.css({"background-color": "GhostWhite", "height": "100px", "width": "50px"});
          
          tr = $('<tr></tr>').append(th); // APNEDING ROWS!!!
          
          // Add data cells
          for (var c = 0; c < col; c++) {
            tr.css({"height": "100px", "width": "50px"});
            
            var svg= '<svg id="mysvg" width="100" height="100">'+
            '<circle cx="50%" cy="50%" r="50%" stroke="black" stroke-width="2" fill="transparent" ></circle>'+
            '<foreignObject x="20" y="20" width="100" height="100">'+ 
                '<div id="addText"><a href="#" ><span class="ui-button-text"><font size="1.75">Add Text</font></span></a> </div> '+
                '<div><a href="#" id="addCircle"><span class="ui-button-text"><font size="1.75">Add Cover Slip</font></span></a></div></foreignObject>'+
             '</svg>'
                
                tr.append($('<td>'+svg+'</td>'));
   
          }
          
          table.append(tr);     
        }
   
    $("#wellboxentry").append(table);
    
    my_widget_script.parent_class.resize_container();
    
    var fb_id = $('.ui-freezerbox', this).attr('id');
    $('.ui-freezerbox-grid', this).append(table);
      
    
   //run the code to add text or draw circle inside the well amd then make the buttons disappear
   
   /* $(".addText").click( function(e){
      my_widget_script.ShowDialog(false);
      e.preventDefault();  
        }); */
    
     $("#addText").click( function(){
      
      $( "#dialog" ).dialog({
       resizable: false,
      height: "auto",
      width: 400,
      modal: true,
      buttons: {
        "Save": function() {
          my_widget_script.saveText();
        },
        Cancel: function() {
          $(this).dialog( "close" );
        }
      }
      });
    
      });
    
  },
 
  
  saveText: function()
  {
    //save the text and commit to the well
    var txt = $("#textBox").val();
    alert("you submitted this text: "+ txt);
    $("#dialog").dialog( "close" );
  },

  
  addCircle: function(){
  $('.ui-freezerbox', this).remove()
  },
  
  destroy: function(){
   $(this).remove();
  },
  
    _get_wb_id: function () {
      var cnt = 1;
      while ($('#wellbox_'+cnt).length > 0)
        cnt++;
      return 'wellbox_' + cnt;  
    },
  
_resize: function() {
      return this.each(function (i) {
        var $this = $(this);
        $('.ui-freezerbox', $this).width(Math.min($(window).width(), Math.max($('.ui-freezerbox-info table', $this).outerWidth(true), $('.ui-freezerbox-grid table', $this).outerWidth(true))));
        $this.trigger('resize.freezerbox');
      });
    },
  
    
}
