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
    
    $("div,table").css({
            "font-family": "Arial, Helvetica, sans-serif",
            "font-size": "11px",
            "background-color": "#eeeeee",
            "width": "98%",
            "margin": "2px 2px 2px 2px",
            "padding": "2px 2px 2px 2px"
        });
        $("table").css({
            "background-color": "#f6f6f6"
        });
    


    
    
    
    
    $("#addwellbox").click(my_widget_script.createWellbox);
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
    var size;
    
      size=(my_widget_script.getSize.bind($('select[name="size"]')))();
      alert ("well box is under construction, the size is: "+ size)
       
        },
  
  
   getSize:function(){
  
    var Nrow=0;
    var Ncol=0;
     var value= $(this).val();
    
    if (value == "6")
    {Nrow=6; Ncol=6;}
   
     else if (value == "12")
     {Nrow=12; Ncol=12;}
     
     else if (value == "24")
    {Nrow=24; Ncol=24;}
    
     else if (value == "custom")
    {Nrow=0; Ncol=0;}
  
    console.log("size is: "+ value);
    
  
    return value; 
}
 

}
