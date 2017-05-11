freezerbox_form_script =
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
    $('#the_form')
      .hide()
      // TODO: Any scripts in the form will get run again, is there a way prevent this?
      .wrapInner('<form id="freezerbox_cellform"/>')
      .append('<div id="freezerbox"/>')
      .show();
    // Move this hidden field back in the_form; it was moved to freezerbox_cell form in the wrapInner call
    $('input[name="is_freezerbox2"]').prependTo('#the_form');
    $('#freezerbox')
      .freezerbox({
        cellform_id: 'freezerbox_cellform',
        cellform_isvalid: this.parent_class.is_valid,
        readonly: (mode.indexOf('view') > -1)
      })
      .bind('resize.freezerbox', function() {
        freezerbox_form_script.parent_class.resize_container();
      });

    // Temporarily rename the hidden field so we can do the normal 
    // parent_form_script.init; otherwise we are going in a circular reference
    $('input[name="is_freezerbox2"]').attr('name','is_freezerbox2_disabled');
    // Temporarily map the from_json to this from_json
    var save_fromjson = this.parent_class.from_json;  // save parent class from_json func
    this.parent_class.from_json = this.from_json;
    
    this.parent_class.init(mode, json_data);  // default
    
    this.parent_class.from_json = save_fromjson;      // restore parent class from_json func
    $('input[name="is_freezerbox2_disabled"]').attr('name','is_freezerbox2'); // restore hidden field

    if ((mode.indexOf('edit') > -1) && ((json_data === '') || (json_data === '[]') || (json_data === '{}'))) {
      $.widget_proxy.widget_app.import_csv_file('is_freezerbox2');
    }

  },

  to_json:function () {
    //should return a json string containing the data entered into the form by the user
    //whatever is return from the method is persisted in LabArchives.  must not be binary data.
    //called when the user hits the save button, when adding or editing an entry
    return  $('#freezerbox').freezerbox('export_json');
    //return this.parent_class.to_json();	// default
  },

  from_json:function (json_data) {
    //populates the form with json_data
    $('#freezerbox').freezerbox('import_json', json_data);
    //this.parent_class.from_json(json_data);	// default
  },

  test_data:function () {
    //during development this method is called to populate your form while in preview mode
    return '[]';
    //return '[{"name":"freezerbox_info_name_mandatory","value":"Eileen\'s FB TEST"},{"name":"freezerbox_info_size","value":"12x12"},{"name":"freezerbox_info_color","value":"natural"},{"name":"freezerbox_info_loc","value":"Lab Frig 1"},{"name":"freezerbox_info_desc","value":"Testing beta version"},{"name":"cell_data","value":{"new":[{"name":"test_name_mandatory","value":""},{"name":"date","value":""},{"name":"test_number","value":""},{"name":"test_color","value":""}],"B1":[{"name":"test_name_mandatory","value":"Bacteria"},{"name":"date","value":"11-2-2012"},{"name":"test_number","value":"1234"},{"name":"test_color","value":"green"}],"D2":[{"name":"test_name_mandatory","value":"Fungus"},{"name":"date","value":"10-1-2012"},{"name":"test_number","value":"789"},{"name":"test_color","value":"red"}],"L12":[{"name":"test_name_mandatory","value":"Disease"},{"name":"date","value":"1-1-2012"},{"name":"test_number","value":"435"},{"name":"test_color","value":"purple"}]}}]';
    //return this.parent_class.test_data();
  },

  is_valid:function (b_suppress_message) {
    //called when the user hits the save button, to allow for form validation.
    //returns an array of dom elements that are not valid - default is those elements marked as mandatory
    // that have no data in them.
    //You can modify this method, to highlight bad form elements etc...
    //LA calls this method with b_suppress_message and relies on your code to communicate issues to the user
    //Returning an empty array [] or NULL equals no error

    return this.parent_class.is_valid(b_suppress_message, $('#freezerbox form.ui-freezerbox-info').attr('id'));  // default
  },

  is_edited:function () {
    //should return true if the form has been edited since it was loaded or since reset_edited was called
    return this.parent_class.is_edited();
  },

  reset_edited:function () {
    //typically called have a save
    return this.parent_class.reset_edited();
  },
  
  my_type_of_widget: function() {
  	return ($('input[name="is_freezerbox2"]').length > 0);
  },

  import_csv_file: function(data) {

    function col_to_i(s) {
      var val = 0;
      var base = 'A'.charCodeAt(0) - 1;
      var power = s.length - 1;
      $.each(s, function(i,ch) {
        val += (s.charCodeAt(i) - base) * Math.pow(26,power);
        power -= 1;
      });
      return val;
    }

    if (data.length <= 0) {
      return;
    }

    var header = data.shift();
    //check if the date needs to be re-formatted for the locale
    var date_format = $.datepicker.regional[window.datepicker_locale].dateFormat;
    if (date_format != 'mm/dd/yy') {
      //check the header for any _date fields
      $.each(header, function(h_idx, h) {
        if (h['form_cmds'].indexOf('_date') > -1) {
          $.each(data, function (i, row) {
            if (row[h_idx] != '') {
              var d = $.datepicker.parseDate('mm/dd/yy', row[h_idx], {});
              row[h_idx] = $.datepicker.formatDate(date_format, d, {});
            }
          })
        }
      });
    }

    var re_cell_key = /^([A-Z]+)([1-9]\d*)$/;
    //Max col and row values for 9x9 which is the default
    var col_max = 9;
    var row_max = 9;

    var json_data = [];
    var cell_data_val = {};
    $.each(data, function(i_row, row) {
      var cell_key = row.shift();
      var cell_val = [];
      //check if any cell is outside of 9x9 if so increase the size
      var m = cell_key.match(re_cell_key);
      var col_i = col_to_i(m[1]);
      if (col_i > col_max) {
        col_max = col_i;
      }
      var row_i = parseInt(m[2]);
      if (row_i > row_max) {
        row_max = row_i;
      }
      $.each(row, function (i, fld) {
        cell_val.push({name: header[i+1]['ele_name'],
                       value: fld});
      });
      cell_data_val[cell_key] = cell_val;
    });
    json_data.push({name: 'freezerbox_info_size',
                    value: row_max+'x'+col_max});
    json_data.push({name: 'cell_data',
                    value: cell_data_val});
    this.from_json(JSON.stringify(json_data));
  }
};
parent_form_script.register_widget_type(freezerbox_form_script);
