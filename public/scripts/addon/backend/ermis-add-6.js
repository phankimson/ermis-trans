var ErmisAdd = function () {
  var $export = '';
  var data = GetAllDataForm('#form-search');
  var initPrintFreight= function(){
          var obj = {};
          jQuery.each(data.columns, function (k, col) {
              if (col.key === 'text' || col.key === 'password' || col.key === 'number') {
                  if (jQuery('input[name="' + col.field + '"]').hasClass('number-price') || jQuery('input[name="' + col.field + '"]').hasClass('number')) {
                      obj[col.field] = jQuery('input[name="' + col.field + '"]').data("kendoNumericTextBox").value();
                  } else {
                      obj[col.field] = jQuery('input[name="' + col.field + '"]').val().trim();
                      if (col.type === 'date') {
                          obj[col.field] = formatDateDefault(obj[col.field]);
                      } else if (col.type === 'datetime') {
                          obj[col.field] = formatDateTimeDefault(obj[col.field]);
                      }
                  }

              } else if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("droplist")) {
                  obj[col.field] = jQuery('.droplist[name="' + col.field + '"]').data('kendoDropDownList').value();
              } else if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("multiselect")) {
                  var arr = jQuery('.multiselect[name="' + col.field + '"]').data('kendoMultiSelect').value();
                  obj[col.field] = arr.join();
              } else if (col.key === 'textarea') {
                  obj[col.field] = jQuery('textarea[name="' + col.field + '"]').val();
              } else if (col.key === 'checkbox') {
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
              }else if (col.key === 'radio') {
                  obj[col.field] = jQuery('input[name="' + col.field + '"]:checked').val();
              }
          });
        var $kprint = jQuery('#printbill');
        var postdata = { data: JSON.stringify(obj)};
        RequestURLWaiting(Ermis.link+'-print', 'json', postdata, function (result) {
            if (result.status === true) {
              if(result.customer){
                jQuery('.customer_code').text(result.customer.code);
                jQuery('.customer_name').text(result.customer.name);
                jQuery('.customer_address').text(result.customer.address);
                jQuery('.customer_phone').text(result.customer.phone);
                jQuery('.customer_taxcode').text(result.customer.tax_code);
                jQuery('.customer_fax').text(result.customer.fax);
                jQuery('.customer_contact').text(result.customer.full_name_contact);
                jQuery('.customer_contact_phone').text(result.customer.telephone1_contact);
                jQuery('.customer_payment_method').text(result.customer.payment_method);
              }
                var total_amount_ = 0;
                var total_quantity_ = 0;
                var total_surchange_ = 0;
                jQuery.each(result.detail, function (k, v) {
                  var copy = jQuery('.load_print').first().clone(true);
                  copy.find(".stt").text(k+1);
                  copy.find(".date_voucher").text(FormatDate(v.date_voucher));
                  copy.find(".transport_code").text(v.transport_code);
                  copy.find(".sender_address").text(v.sender_address);
                  copy.find(".receiver_address").text(v.receiver_address);
                  copy.find(".name").text(v.name);
                  copy.find(".lot_number").text(v.lot_number);
                  copy.find(".quantity").text(FormatNumber(v.quantity));
                  copy.find(".price").text(FormatNumber(v.price));
                  copy.find(".surcharge_amount").text(FormatNumber(v.surcharge_amount));
                  copy.find(".surcharge").text(v.surcharge);
                  copy.find(".total_amount").text(FormatNumber(v.total_amount));
                  copy.removeClass('hidden');
                  copy.removeClass('load_print');
                  copy.insertAfter( ".load_print" );
                  total_amount_ += v.total_amount;
                  total_quantity_ += v.quantity;
                  total_surchange_ += v.surcharge_amount;
                })
                jQuery('.total_amount_').text(FormatNumber(total_amount_));
                jQuery('.total_quantity_').text(FormatNumber(total_quantity_));
                jQuery('.total_surchange_').text(FormatNumber(total_surchange_));
                jQuery('.vat').text(FormatNumber(total_amount_ * 0.1));
                jQuery('.total_amount_include_vat').text(FormatNumber(total_amount_ * 1.1));
                $kprint.removeClass('hidden');
                $export.data("kendoDialog").close();
                setTimeout(function(){
                $kprint.print();
                }, 300);
                setTimeout(function(){
                  $kprint.addClass('hidden');
                }, 500);

              }else{
                  kendo.alert(result.message);
              }
        }, true);
    }

    var initExcel = function(){
      var obj = {};
      jQuery.each(data.columns, function (k, col) {
          if (col.key === 'text' || col.key === 'password' || col.key === 'number') {
              if (jQuery('input[name="' + col.field + '"]').hasClass('number-price') || jQuery('input[name="' + col.field + '"]').hasClass('number')) {
                  obj[col.field] = jQuery('input[name="' + col.field + '"]').data("kendoNumericTextBox").value();
              } else {
                  obj[col.field] = jQuery('input[name="' + col.field + '"]').val().trim();
                  if (col.type === 'date') {
                      obj[col.field] = formatDateDefault(obj[col.field]);
                  } else if (col.type === 'datetime') {
                      obj[col.field] = formatDateTimeDefault(obj[col.field]);
                  }
              }

          } else if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("droplist")) {
              obj[col.field] = jQuery('.droplist[name="' + col.field + '"]').data('kendoDropDownList').value();
          } else if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("multiselect")) {
              var arr = jQuery('.multiselect[name="' + col.field + '"]').data('kendoMultiSelect').value();
              obj[col.field] = arr.join();
          } else if (col.key === 'textarea') {
              obj[col.field] = jQuery('textarea[name="' + col.field + '"]').val();
          } else if (col.key === 'checkbox') {
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
          }else if (col.key === 'radio') {
              obj[col.field] = jQuery('input[name="' + col.field + '"]:checked').val();
          }
      });
      var postdata = { data: JSON.stringify(obj)};
      RequestURLWaiting(Ermis.link+'-excel', 'json', postdata, function (result) {
          if (result.status === true) {
            var url = Ermis.link+'-DownloadExcel';
            window.open(url);
            }else{
                kendo.alert(result.message);
            }
      }, true);

    }

    var initKendoUiDialog = function () {
      jQuery('.btn_export').on('click',function(){
        if($export){
          $export.data("kendoDialog").open();
        }else{
          $export = $("#export").kendoDialog({
              width: "400px",
              title: "Export",
              closable: true,
              modal: true,
              actions: [
                  { text: "Export Excel", action: initExcel },
                  { text: "Print", action: initPrintFreight },
                  { text: "Close", primary: true }
              ]
          });
        }

      })
    };

    return {

        init: function () {
          initKendoUiDialog();
        }

    };

}();

jQuery(document).ready(function () {
    ErmisAdd.init();
});
