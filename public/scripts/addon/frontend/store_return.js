var Ermis = function () {
  var $kGrid = jQuery('#grid');
  var voucher = '';
  var $kGridBarcode = jQuery('#grid_barcode');
  var myWindow1 = jQuery("#form-window-barcode");
  var $kWindow1 = '';
  var dataId = '';
  var c = false;

  var initStatus = function (status){
    var action =  jQuery("#form-action-2");
    if(status == 0){
     action.find('input[name="voucher"]').val(voucher);
     action.find('input[name="date_voucher"]').val(moment().format('DD/MM/YYYY'));
     action.find('input[name="description"]').val(transText.pay_daily+' - '+moment().format('DD/MM/YYYY'));
     jQuery(".cancel").on("click",initCancel);
     jQuery(".payment").on("click",initReturnPayment);
     jQuery(".search_barcode").on("click",initBarcodeForm);
     jQuery(".cancel-window").on("click",initClose);
    //jQuery("#barcode").on("blur",initScanBarcode)
    //jQuery("#voucher").on("blur",initBlurSaleInvoice)
    jQuery(".print").addClass('disabled').attr("readonly","readonly");
    jQuery(".print").off('click');
  }else if(status == 1){//Cancel
    jQuery("#form-load").find('input','select').val("");
    action.find('input[name="voucher"]').val(voucher);
    jQuery("#voucher").val("");
    jQuery('select[name="subject"]').data("kendoDropDownList").value(1)
    action.find('input[name="description"]').val(transText.pay_daily+' - '+moment().format('DD/MM/YYYY'));
    var grid = $kGrid.data('kendoGrid');
    grid.dataSource.data([]);
      }else if(status==2){//Payment success
        jQuery(".print").removeClass('disabled').removeAttr("readonly");
        jQuery(".print").on('click',initPrint);
        jQuery('.payment,.cancel').off("click");
        jQuery(".payment,.cancel").addClass('disabled').attr("readonly","readonly");
      }else if (status == 3){ // Print
        jQuery(".print").addClass('disabled').attr("readonly","readonly");
        jQuery(".print").off('click');
        jQuery(".payment,.cancel").removeClass('disabled').removeAttr("readonly");
        jQuery('.payment').on("click",initReturnPayment);
        jQuery('.cancel').on("click",initCancel);
        jQuery('input').not('.not_clear').val("");
        jQuery('textarea').val("");
        var grid = $kGrid.data('kendoGrid');
        grid.dataSource.data([]);
        action.find('input[name="voucher"]').val(voucher);
        action.find('input[name="date_voucher"]').val(moment().format('DD/MM/YYYY'));
        action.find('input[name="description"]').val(transText.pay_daily+' - '+moment().format('DD/MM/YYYY'));
      }
  }


  var initReturnPayment = function(e){
    var jQuerylink = jQuery(e.target);
    e.preventDefault();
    if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
        $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
            if (confirmed) {
                var load = jQuery("#form-action-2");
                var obj = {};
                obj.description = jQuery("#form-action-2 input[name='description']").val();
                obj.receiver_fullname = jQuery("#form-action-2 input[name='receiver_fullname']").val();
                obj.receiver_phone = jQuery("#form-action-2 input[name='receiver_phone']").val();
                obj.identity_card = jQuery("#form-action-2 input[name='identity_card']").val();
                obj.detail = $kGrid.data("kendoGrid").dataSource.data();
                if(obj.detail.length > 0 && obj.receiver_fullname && obj.receiver_phone){
                  var postdata = { data: JSON.stringify(obj)};
                  RequestURLWaiting(Ermis.link+'-payment', 'json', postdata, function (result) {
                      if (result.status === true) {
                         kendo.alert(result.message);
                         dataId = result.dataId;
                         load.find('input[name="voucher"]').val(result.voucher);
                         initStatus(2);
                      } else {
                         kendo.alert(result.message);
                      }
                  }, true);
                }else{
                    kendo.alert(transText.return_is_missing);
                }

            }
        });
    }
    jQuerylink.data('lockedAt', +new Date());
  }
  var initPrint = function (e) {
      var jQuerylink = jQuery(e.target);
      e.preventDefault();
      if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
          //$.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
          //    if (confirmed) {
                  var obj = {};
                      obj.id = dataId;
                      var postdata = { data: JSON.stringify(obj) };
                      RequestURLWaiting(Ermis.link+'-print', 'json', postdata, function (result) {
                          if (result.status === true) {
                              var decoded = $("<div/>").html(result.print_content).text();
                              if (result.detail_content) {
                                  decoded = decoded.replace('<tr class="detail_content"></tr>', result.detail_content);
                              }
                              PrintForm(jQuery('#print'), decoded);
                              jQuery('#print').html("");
                              initStatus(3);
                          }else {
                              kendo.alert(result.message);
                          }
                      }, true);

      }
      jQuerylink.data('lockedAt', +new Date());
  };

  var initCancel = function(){
        initStatus(1);
  }

  var initScanBarcode = function(e){
    var $this = e.currentTarget ? e.currentTarget : e
    var jQuerylink = jQuery(e.target);
    if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
    var obj = {};
    obj.value = jQuery($this).val()?jQuery($this).val():jQuery($this).attr("data-id");
    if(obj.value){
      var postdata = { data: JSON.stringify(obj) };
      RequestURLWaiting(Ermis.link+'-scan', 'json', postdata, function (result) {
          if (result.status === true) {
            var i = result.data;
            var grid = $kGrid.data("kendoGrid");
            var dataItem  = grid.dataSource.get(i.id);
            if(dataItem){
              var row = grid.tbody.find("tr[data-uid='" + dataItem.uid + "']");
              var selectedItem = grid.dataItem(row);
              }else{
                grid.dataSource.insert(0 , i);
                var row = $kGrid.find("tr:eq(1)");
                grid.select(row);
            }
            setTimeout(function() {
              jQuery($this).val("");
              jQuery($this).focus();
            }, 1);
          }else{
              kendo.alert(result.message);
          }
      }, true);
    }

  }
  jQuerylink.data('lockedAt', +new Date());
  }


    var initClose = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if ($kWindow1.element.is(":hidden") === false) {
                $kWindow1.close();
                var grid = $kGridBarcode.data('kendoGrid');
                grid.dataSource.data([]);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };


  var onChange = function () {
      var grid = this;
      var dataItem = grid.dataItem(grid.select());
      jQuery('#form-action input').not(".not_load").each( function (k, v) {
          if(jQuery(v).hasClass('date')){
            jQuery(v).val(FormatDate(dataItem[jQuery(v).attr('name')]));
          }else{
            jQuery(v).val(dataItem[jQuery(v).attr('name')]);
          }

      });
  };
  var initKendoUiDialog = function () {
      $kWindow1 = myWindow1.kendoWindow({
          width: "800px",
          title: "",
          visible: false,
          actions: [
              "Pin",
              "Minimize",
              "Maximize",
              "Close"
          ],
          modal: true
      }).data("kendoWindow").center();

      $kWindow1.title("Tìm kiếm bưu kiện");
  };

  var initBarcodeForm = function () {
      $kWindow1.open();
  };

  var initKendoGridBarcode = function () {
     var grid = $kGridBarcode.kendoGrid({
          dataSource: {
              data: []
          },
          selectable: "multiple, row",
          height: jQuery(window).height() * 0.5,
          sortable: true,
          pageable: true,
          filterable: true,
          columns: Ermis.columns_barcode
     }).data("kendoGrid");
     grid.thead.kendoTooltip({
       filter: "th",
       content: function (e) {
           var target = e.target; // element for which the tooltip is shown
           return $(target).text();
       }
   });

     grid.table.on("click", ".k-checkbox", selectRow);
      //bind click event to the checkbox
      //grid.table.on("click", ".k-checkbox" , selectRow);
      jQuery('#header-chb-b').change(function(ev){
          var checked = ev.target.checked;
          $kGridBarcode.find('.k-checkbox').not("#header-chb-b").each(function (idx, item) {
              if(checked){
                  if(!$(item).closest('tr').is('.k-state-selected')){
                      $(item).click();
                  }
              } else {
                  if($(item).closest('tr').is('.k-state-selected')){
                      $(item).click();
                  }
              }
          });

      });

      jQuery(".choose_barcode").bind("click", function () {
          var checked = [];
          for(var i of checkedData){
            var grid = $kGrid.data("kendoGrid");
            var dataItem  = grid.dataSource.get(i.id);
            if(dataItem){
              var row = grid.tbody.find("tr[data-uid='" + dataItem.uid + "']");
              var selectedItem = grid.dataItem(row);
            }else{
              grid.dataSource.insert(0 , i);
              var row = $kGrid.find("tr:eq(1)");
              grid.select(row);
              $kGridBarcode.find('.k-checkbox[id="'+i.id+'"]').click();
            }
          }
          $kWindow1.close();
          checkedData = [];
      });
      var checkedData = [];

      //on click of the checkbox:
      function selectRow() {
          var checked = this.checked,
              row = $(this).closest("tr"),
              grid = $kGridBarcode.data("kendoGrid"),
              dataItem = grid.dataItem(row);
          if (checked) {
             checkedData.push(dataItem)
              //-select the row
              row.addClass("k-state-selected");
          } else {
              checkedData = checkedData.filter(x => x.id != dataItem.id)
              //-remove selection
              row.removeClass("k-state-selected");
          }
      }
          jQuery("#barcode").on("blur",initScanBarcode)

  };

  var initGetDataBarcode = function () {
    jQuery('#search_data').on('click', function () {
        var obj = {};
        var filter = GetAllDataForm('#form-window-barcode', 2);
        jQuery.each(filter.columns, function (k, col) {
            if (col.key === 'text' || col.key === 'password' || col.key === 'number') {
                obj[col.field] = jQuery('input[name="' + col.field + '"]').val().trim();
            } else if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("droplist")) {
                obj[col.field] = jQuery('.droplist[name="' + col.field + '"]').data('kendoDropDownList').value();
            } else if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("multiselect")) {
                var arr = jQuery('.multiselect[name="' + col.field + '"]').data('kendoMultiSelect').value();
                obj[col.field] = arr.join();
            } else if (col.key === 'textarea') {
                obj[col.field] = jQuery('textarea[name="' + col.field + '"]').val();
            }  else if (col.key === 'checkbox') {
                if (jQuery('input[name="' + col.field + '"]').parent().hasClass('checked')) {
                    if (col.type === 'boolean') {
                        obj[col.field] = true;
                    } else if (col.type === 'number'){
                        obj[col.field] = 1;
                    }else {
                        obj[col.field] = '1';
                    }
                } else {
                    if (col.type === 'boolean') {
                        obj[col.field] = false;
                    }else if (col.type === 'number'){
                        obj[col.field] =  0;
                    } else {
                        obj[col.field] = '0';
                    }
                }
            } else if (col.key === 'radio') {
                obj[col.field] = jQuery('input[name="' + col.field + '"]:checked').val();
            }
        });
        var postdata = { data: JSON.stringify(obj) };
        RequestURLWaiting(Ermis.link+'-load', 'json', postdata, function (result) {
            if (result.status === true) {
                var grid = $kGridBarcode.data("kendoGrid");
                var ds = new kendo.data.DataSource({ data: result.data });
                grid.setDataSource(ds);
                grid.dataSource.page(1);
            }else {
                kendo.alert(result.message);
            }
        }, true);
    });
  };

    var initKendoGrid = function () {
        dataSource = new kendo.data.DataSource({
            data: Ermis.data,
            aggregate: Ermis.aggregate,
            batch: true,
            pageSize: 20,
            schema: {
                model: {
                    id: "id",
                    fields: Ermis.field
                }
            }
        });
        var initKendoUiDropList = function () {
            jQuery(".droplist").kendoDropDownList({
                filter: "startswith"
            });
        };
      var grid =  $kGrid.kendoGrid({
            dataSource: dataSource,
            change: onChange,
            selectable: "row",
            height: jQuery(window).height() * 0.5,
            columns: Ermis.columns
        });

        grid.data("kendoGrid").thead.kendoTooltip({
          filter: "th",
          content: function (e) {
              var target = e.target; // element for which the tooltip is shown
              return $(target).text();
          }
      });


    };

    var initVoucherMasker = function () {
        var data = Ermis.voucher;
        var char = 'x';
        var number = parseInt(data.length_number);
        if (data.suffixed) {
            voucher = data.prefix + char.repeat(number) + data.suffixed;
        } else {
            voucher = data.prefix + char.repeat(number);
        }
    };

  var initKendoUiNumber = function () {
      $(".number").kendoNumericTextBox({
          format: "n0",
          step: 1
      });
  }
  var initKendoUiNumberPrice = function () {
      $(".number-price").kendoNumericTextBox({
          format: "n0",
          step: 1000,
          min : 0
      });
  }

  var initKendoUiPercent = function () {
      $(".percent").kendoNumericTextBox({
          format: "n0",
          max : 100,
          min : 0
      });
  }
  var initKendoUiDropList = function () {
      jQuery(".droplist").kendoDropDownList({
          filter: "startswith"
      });
  };

  var initKeyCode = function () {
      jQuery(document).keyup(function (e) {
          if (e.keyCode === 13) {
            if(e.target.id == "barcode"){
              initScanBarcode(e.target);
            }
          }
      });
  };

    return {

        init: function () {
          initKendoGrid();
          initVoucherMasker();
          initStatus(0);
          initKendoUiNumber();
          initKendoUiNumberPrice();
          initKendoUiPercent();
          initKendoUiDropList();
          initKeyCode();
          initKendoUiDialog();
          initKendoGridBarcode();
          initGetDataBarcode();
        }

    };

}();

jQuery(document).ready(function () {
    Ermis.init();
});
