var ErmisAdd3 = function () {
  var $kGrid = jQuery('#grid');
  var $kGridSubject = jQuery('#grid_subject');
  var $kGridReference = jQuery('#grid_reference');
  var $kGridBarcode = jQuery('#grid_barcode');
    initChangeSelect= function(){

      var inventory = $("select[name='inventory_receipt']").data("kendoDropDownList");
      inventory.bind('change', function (e) {
          $kGrid.data('kendoGrid').dataSource.data([]);
          $kGridBarcode.data('kendoGrid').dataSource.data([]);
      });

    }

    return {

        init: function () {
            initChangeSelect();
        }

    };

}();

jQuery(document).ready(function () {
    ErmisAdd3.init();
});
