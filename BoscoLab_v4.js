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
    
        
    $("#addwellbox").click(function() {my_widget_script.createWellbox()});
     
    var oldSizeTxt="";
    var oldSize=[0,0];
    var newSize=[0,0];

    $('select[name="size"]').on('focus', function () {
        // Store the current value on focus and on change
        oldSizeTxt = this.value;
      	oldSize= my_widget_script.getSize(oldSizeTxt);
    }).change(function() {
        // Do something with the previous value after the change
      alert("oldSize is: "+oldSize);
		newSize= my_widget_script.getSize($(this).val());
      alert("NewSize is: "+newSize);
      my_widget_script.changeTableSize(oldSize, newSize);
    });
   
    
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
  
  createWellbox: function(size){
    var sizeTxt1=( function () {  
      return $(this).val();
        }).bind($('select[name="size"]'))();
     size= my_widget_script.getSize(sizeTxt1); 
    
    var row= size[0];
    var col= size[1];
    $("#addwellbox").hide();
    
     // If this element is already a freezerbox widget, destroy it and re-init it
    my_widget_script.destroy();
    
    var wellbox_id= my_widget_script._get_wb_id();
    
        // Clear the current grid
        $('.ui-freezerbox-grid', this).empty();
        
    
        // Create grid
        var table = $('<table class="ui-freezerbox-grid" id="wellbox" border="1" bordercolor="lightgrey" cellspacing="0"></table>');
        
    	// Add col header row
        var tr = $('<tr></tr>').append('<th></th>');

        for (var c = 0; c < col; c++) {
          var th = $('<th class="ui-freezerbox-grid-colheader"></th>').html("<div class='ui-freezerbox-colheader-inner'>"+"</div>");
           	  th.css({"background-color": "GhostWhite", "height":"50px", "max-height": "70px", "max-width": "100px"});
              tr.append(th); // APPENDING COLUMNS!
          
            //Adding the text edit icon
            var addText_div= document.createElement('a');
            addText_div.setAttribute('href', "#");
            addText_div.setAttribute('id','addText');
            addText_div.setAttribute('title','Edit');
            addText_div.className="ui-icon ui-icon-pencil";
            addText_div.setAttribute('x','10');
            addText_div.setAttribute('y','10');
            th.append(addText_div);
  
            //Edit on click
        }
        table.append(tr);
        
    	 // Add rows
        for (var r = 1; r <= row; r++) {
          
          // Add row header cell
          	var th = $('<th class="ui-freezerbox-grid-rowheader"></th>').html("<div class='ui-freezerbox-rowheader-inner'>"+"</div>");
         	    th.css({"background-color": "GhostWhite", "height": "100px", "width": "50px", "max-width": "70px"});
          
          	tr = $('<tr></tr>').append(th); // APNEDING ROWS!!!
            //Adding the text edit icon
            var addText_div= document.createElement('a');
            addText_div.setAttribute('href', "#");
            addText_div.setAttribute('id','addText');
            addText_div.setAttribute('title','Edit');
            addText_div.className="ui-icon ui-icon-pencil";
            addText_div.setAttribute('x','10');
            addText_div.setAttribute('y','10');
            th.append(addText_div);
          

          // Add data cells
          for (var c = 0; c < col; c++) {            
            tr.css({"height": "100px", "width": "100px"});
            var td= $('<td></td>').attr({ id: 'cell_r'+r+'_c'+c});
            my_widget_script.setTableCell(td, r, c)
            tr.append(td);
          }
          
          table.append(tr);     
        };
    
   
    $("#wellboxentry").append(table);
    
    my_widget_script.parent_class.resize_container();
    
    var fb_id = $('.ui-freezerbox', this).attr('id');
    $('.ui-freezerbox-grid', this).append(table);

    //Edit the headers
    my_widget_script.editHeaders();
    
   //Edit the cells(wells)       
   my_widget_script.editCells();
 
  },
 
  
  saveText: function(thecell)
  {
    //save the text and commit to the well
    
    var txt= $("#textBox").val();
    alert("you submitted this text: "+ txt);
    
    var myTxt= document.createElement('p');
    myTxt.append(document.createTextNode(txt));
    myTxt.setAttribute('id', 'myTxt');
    myTxt.setAttribute('title', txt);
    myTxt.style.fontSize='xx-small';
    myTxt.style.wordWrap = "break-word";
    myTxt.style.overflow='hidden';
    myTxt.style.whiteSpace='nowrap';
    myTxt.style.margin='0 0 0 10px';
    myTxt.style.textOverflow='ellipsis';
    myTxt.style.lineHeight='normal';
    myTxt.style.boxSizing = "border-box";
    //For old Firefox
    myTxt.style.MozBoxSizing = "border-box";
   // myTxt.style.position='absolute';
    
    $(thecell).append(myTxt);
    $("#dialog").dialog( "close" );
  },
  
  modifyText: function(thecell){
   var myTxt= $(thecell).find('#myTxt');
   myTxt.text($("#textBox").val());
   $("#dialog").dialog( "close" );
  },

  changeTableSize: function(oldSize, newSize){
  
    var dr= newSize[0]-oldSize[0];
    var dc= newSize[1]-oldSize[1];

    
    if (dr>0 && dc>0){    
      // Add new rows      
      //Add Row Header
      var th=my_widget_script.setHeader();
      th.css({"background-color": "GhostWhite", "height": "100px", "width": "50px", "max-width": "70px"});
      $("#wellbox").append(th);
      
      for (var r=oldSize[0]; r < newSize[0]; r++) {
         
          var tr= $('<tr></tr>').css({"height": "100px", "width": "100px"});
          tr.append(th);
          $("#wellbox").find('tr').eq(r).after(tr);

    	  // Append data cells to the rows
          for (var c = 1; c <= oldSize[1]; c++) {           
            var td= $('<td></td>').attr({ id: 'cell_r'+r+'_c'+c});
             my_widget_script.setTableCell(td, r, c);
            tr.append(td);
          }
        }
        
   //Add new columns
   
    for (r=0; r<=newSize[0]; r++){
      tr= $("#wellbox").find('tr').eq(r);
      
      for (var c = (oldSize[1]+1); c <= newSize[1]; c++) {
      	if (r==0){  
          // Add col header row 
          var th=my_widget_script.setHeader();
           	  th.css({"background-color": "GhostWhite", "height":"50px", "max-height": "70px", "max-width": "100px"});
              tr.append(th);   
      	} 
        else {
      		var td= $('<td></td>').attr({ id: 'cell_r'+r+'_c'+c}).css({"height": "100px", "width": "100px"});
        	my_widget_script.setTableCell(td, r, c);
            tr.append(td);          
        } 
      }}
      
      /* Get the new size and old size again
      $('select[name="size"]').on('focus', function () {
        // Store the current value on focus and on change
        oldSizeTxt = this.value;
      	oldSize= my_widget_script.getSize(oldSizeTxt);
    }).change(function() {
        // Do something with the previous value after the change
      alert("oldSize is: "+oldSize);
		newSize= my_widget_script.getSize($(this).val());
      alert("NewSize is: "+newSize);
    }); */

      } else if(dr<0 && dc<0 ){
          
        for (var r= oldSize[0]; r=newSize[0]+1; r--){
            
          $("#wellbox").find('tr').eq(r).remove();
            for (var c= oldSize[1]; c=newSize[1]+1; c--){
              
              td= $('<td></td>').attr({ id: 'cell_r'+r+'_c'+c})
           //   $("#wellbox").find('td').remove();
            }
          }

      } else if (dr>0 && dc<0){
          
      } else if (dr<0 && dc>0){
         
      }

    
    my_widget_script.parent_class.resize_container();
    
    //Edit the headers
    my_widget_script.editHeaders();
    
   //Edit the cells(wells)       
    my_widget_script.editCells();
  
  },
  
  getSize: function(sizeTxt){

		var row=0;
        var col=0;
     
        if ((/(\d+)x(\d+)/).test(sizeTxt)) {
          
          //x = size.match(/(\d+)x(\d+)/).val;
          row = parseInt(RegExp.$1);
          col = parseInt(RegExp.$2);
        }
        else if (sizeTxt === 'Custom...') {
          
          //row = parseInt($('[name="freezerbox_info_custom_row_number"]', this).val());
         // col = parseInt($('[name="freezerbox_info_custom_col_number"]', this).val());
        
     $("#custom_rows").show();
     $("#custom_cols").show();  
     $("#buildCustom").show();
          
  
         var rowctr = $('#wellbox >tbody >tr').length - 1;  
         var colctr= $('#wellbox tr:eq(1) td').length ;
         
  
         var oldSize= [rowctr,colctr];
         var newSize= [0,0];
          
          
     $('[name="in_rows"], [name="in_cols"]').spinner({
                min: 1,
                max: 15,
                stop: function(evt, ui) {
                  var n = parseInt($(this).val());
                  if (!isNaN(n) && (n > 0) && (n <= 15)) {
                    
                    newSize= [($('#in_rows').val()),($('#in_cols').val())];
                    
                   $("#buildCustom").click(function() {my_widget_script.changeTableSize(oldSize, newSize)});
                  }
                  else {
                    window.alert('Please enter a number between 1 and 15.');
                  }
                }
              }); 
          
          // Make custom size input boxes spinners
         /*   $('[name="Custom_rows"],[name="Custom_cols"]')
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
        	end */
        }
    
    var size= [row,col];
    return size;
  
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
  
  setTableCell: function(td, r, c){
     		
    		//Adding the text edit icon
            var addText_div= document.createElement('a');
            addText_div.setAttribute('href', "#");
            addText_div.setAttribute('id','addText');
            addText_div.setAttribute('title','Edit');
            addText_div.className="ui-icon ui-icon-pencil";
            addText_div.setAttribute('x','50');
            addText_div.setAttribute('y','5');
            
            //Adding the slip icon
            var addSlip_div= document.createElement('a');
            addSlip_div.setAttribute('href', "#");
            addSlip_div.setAttribute('id','addSlip');
            addSlip_div.setAttribute('title','Add Cover Slip');
            addSlip_div.className="ui-icon ui-icon-bullet";
            addSlip_div.setAttribute('x','50');
            addSlip_div.setAttribute('y','10');
			
            //'<circle cx="50%" cy="50%" r="50%" stroke="black" stroke-width="2" fill="transparent" ></circle>';
            var circle_div = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            $(circle_div).attr("cx", "50%")
              			 .attr("cy", "50%")
              			 .attr("r", 50)
              			 .css("fill","transparent")
              			 .css("stroke","black")
              			 .css("stroke-width","2");              
            
            var foreignObject= document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
            $(foreignObject).attr({id: 'fo_r'+r+'_c'+(c+1)})
              				.attr("x", 12).attr("y", 17)
              				.attr("width", 75)
              				.attr("height", 65)
              				.attr("overflow", 'hidden');
  
            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            $(svg).attr({id: 'mysvg_r'+r+'_c'+(c+1)}).attr("width", 100).attr("height", 100).attr('position', 'relative');
            svg.appendChild(circle_div);
            svg.appendChild(foreignObject);
            foreignObject.append(addText_div);
            foreignObject.append(addSlip_div);
            
            td.append(svg);
  },
  
  setHeader: function(){
  // Add row header cell
          	var th = $('<th class="ui-freezerbox-grid-rowheader"></th>').html("<div class='ui-freezerbox-rowheader-inner'>"+"</div>");
         	    
                     //Adding the text edit icon
            var addText_div= document.createElement('a');
            addText_div.setAttribute('href', "#");
            addText_div.setAttribute('id','addText');
            addText_div.setAttribute('title','Edit');
            addText_div.className="ui-icon ui-icon-pencil";
            addText_div.setAttribute('x','10');
            addText_div.setAttribute('y','10');
            th.append(addText_div);
    return th;
  },
  
  editHeaders: function(){
        
    //Code for the edit icon for the row and column headers:
      $("#wellbox tr").each(function(){
      
      $('th', this).each(function () {
        
        //the icons are set to hidden unless we hover over the cell
        $(this).find("#addText").hide();
    
        //hover over the cell to show the icons and trigger actions on click
     $(this).hover(
      function(){
       var cell=$(this)
        cell.find("#addText").show();
        
        
      //show the dialog box on click for icon Edit
      cell.find("#addText").click( function(event){
      var c = cell.parent().children().index(cell);
  	  var r = cell.parent().parent().children().index(cell.parent());
        
      $( "#dialog" ).dialog({
       resizable: false,
      height: "auto",
      width: 400,
      modal: true,
      buttons: {
        "Save": function() {
          
          if( (cell.find("#myTxt")).length>0){
            
            my_widget_script.modifyText(cell);
          
         } else {  
          	my_widget_script.saveText(cell);
           cell.find('#myTxt').css({ 'height': '20px', 'width':'60px', 'margin':'0 0 0 10px'});       
       }
        },
        
        "delete": function(){
          $("#textBox").val('');
        },
        Cancel: function() {
          $(this).dialog( "close" );
        }
      }
        
    });
             	 
   });
          },   
      function(){$(this).find("#addText").hide()}
    )
                 
       })
 
        });
},
  
  editCells: function(){
   $("#wellbox tr").each(function(){
      
      $('td', this).each(function () {
        
        //the icons are set to hidden unless we hover over the cell
        $(this).find("#addText").hide();
        $(this).find("#addSlip").hide();
    
        //hover over the cell to show the icons and trigger actions on click
     	$(this).hover(
      	function(){
       	var cell=$(this)
        cell.find("#addText").show();
        cell.find("#addSlip").show();
        
        
      //show the dialog box on click for icon Edit
      cell.find("#addText").click( function(event){
      var c = cell.parent().children().index(cell);
  	  var r = cell.parent().parent().children().index(cell.parent());
        
      $( "#dialog" ).dialog({
       resizable: false,
      height: "auto",
      width: 400,
      modal: true,
      buttons: {
        "Save": function() {
          
          if( (cell.find("#myTxt")).length>0){
            my_widget_script.modifyText('#fo_r'+r+'_c'+c);      
            
          } else {  
          	my_widget_script.saveText('#fo_r'+r+'_c'+c);
            cell.find('#myTxt').css({ 'height':'65px', 'width':'70px', 'margin':'28px 0 0 0'});

          }
        },
        "delete": function(){
          $("#textBox").val('');
        },
        Cancel: function() {
          $(this).dialog( "close" );
        }
      }
    });
          
             	 
   });
        
     //Draw a slip cover(circle) on click for icon circle
        cell.find("#addSlip").click( function(event){ 
        var c = cell.parent().children().index(cell);
  	  	var r = cell.parent().parent().children().index(cell.parent());
          
     var slip = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            
     $(slip).attr("cx", "75%")
            .attr("cy", "75%")
            .attr("r", 8)
            .css("fill","orange");
          $('#mysvg_r'+r+'_c'+c).append (slip);
          var c= document.createElement('canvas');
          c.width= 10;
          c.height= 10;
          
        });   

          },   
      function(){$(this).find("#addText").hide();
                 $(this).find("#addSlip").hide();}
    )
                 
       })
 
        });
  }

}
