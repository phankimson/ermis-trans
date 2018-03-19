var ErmisAdd2 = function () {
    initLoadBarcode = function(){
      var origin_value = ''; var group_value = ''; var style_value = '';var item_value = '';
      var group = $("select[name='group']").data("kendoDropDownList");
      group.bind('change', function (e) {
       var dataItem = e.sender.dataItem();
       group_value = dataItem.text.split(" - ",1);
       jQuery.post( Ermis.link+'-load', function( result ) {
          item_value = (initBarcodeMasker(result.data))
          });
          if(group_value != '' && origin_value != '' && item_value != '' && style_value != ''){
            jQuery("input[name='barcode']").val(group_value+origin_value+item_value+style_value)
          }
      });
      var origin = $("select[name='origin']").data("kendoDropDownList");
      origin.bind('change', function (e) {
       var dataItem = e.sender.dataItem();
       origin_value = dataItem.text.split(" - ",1);
       jQuery.post( Ermis.link+'-load', function( result ) {
          item_value = (initBarcodeMasker(result.data))
          });
          if(group_value != '' && origin_value != '' && item_value != '' && style_value != ''){
            jQuery("input[name='barcode']").val(group_value+origin_value+item_value+style_value)
          }
      });
      var style = $("select[name='style']").data("kendoDropDownList");
      style.bind('change', function (e) {
       var dataItem = e.sender.dataItem();
       style_value = dataItem.text.split(" - ",1);
       jQuery.post( Ermis.link+'-load', function( result ) {
          item_value = (initBarcodeMasker(result.data))
          });
          if(group_value != '' && origin_value != '' && item_value != '' && style_value != ''){
            jQuery("input[name='barcode']").val(group_value+origin_value+item_value+style_value)
          }
      });

    }
    initImage = function(){
       $("#image").kendoUpload({ "multiple": false });
    }
    initToolTip = function(){
      var template = kendo.template($("#toolTipTemplate").html());
      //initialize tooltip to grid tbody with filter cells with given CSS class
       tooltip = $("#grid tbody").kendoTooltip({
           filter: "tr",
           position: "right", 
           width: 150,
           show: function (e) {
              //get current target row
              var currentRow = this.target().closest("tr");
              var grid = $("#grid").data("kendoGrid");
              //get current row dataItem
              var dataItem = grid.dataItem(currentRow);

              //pass the dataItem to the template
              var generatedTemplate = template(dataItem);
              //set the generated template to the content of the tooltip
              this.content.html(generatedTemplate);
          },
      }).data("kendoTooltip");
    }

    return {

        init: function () {
            initLoadBarcode();
            initImage();
            initToolTip();
        }

    };

}();

jQuery(document).ready(function () {
    ErmisAdd2.init();
});
