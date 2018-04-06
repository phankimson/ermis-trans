var Ermis = function () {
  var $kGrid = jQuery('#grid');
  var voucher = '';
  var $kGridSenderReceiver = jQuery('#grid_sender_receiver');
  var myWindow1 = jQuery("#form-window-sender-receiver");
  var $kWindow1 = '';
  var myWindow2 = jQuery("#form-window-payment");
  var $kWindow2 = '';
  var dataType = '';
  var dataId = 0 ;
  var key = 'Alt+';

  var initStatus = function(status){
    shortcut.remove(key + "S");
    shortcut.remove(key + "C");
    shortcut.remove(key + "P");
    if(status == 0){
    jQuery('.voucher').val(voucher);
    jQuery('.date_voucher').val(moment().format('DD/MM/YYYY'));
    jQuery(".print").addClass('disabled').attr("readonly","readonly");
    jQuery(".print").off('click');
    jQuery(".choose_sender_receiver").on("click",initChoose);
    jQuery(".cancel-window").on("click",initClose);
    jQuery(".search_sender").on("click",initFilterForm);
    jQuery(".search_receiver").on("click",initFilterForm);
    jQuery('.payment').on("click",initAgreePayment);
    jQuery('.cancel').on("click",initCancel);
    shortcut.add(key + "S", function (e) { initAgreePayment(e); });
    shortcut.add(key + "C", function (e) { initCancel(e); });
    //jQuery('.agree-payment').on("click",initAgreePayment);
    }else if(status == 1){// CANCEL
    jQuery('input').not('.not_clear').val("");
     jQuery('textarea').val("");
     jQuery('.voucher').val(voucher);
     jQuery('.date_voucher').val(moment().format('DD/MM/YYYY'));
     jQuery("select.droplist").not('.not_clear').each(function() {
       jQuery(this).data('kendoDropDownList').value(0);
      });
      shortcut.add(key + "S", function (e) { initAgreePayment(e); });
      shortcut.add(key + "C", function (e) { initCancel(e); });
    }else if (status == 2){ // payment
      jQuery(".print").removeClass('disabled').removeAttr("readonly");
      jQuery(".print").on('click',initPrint);
      jQuery('.payment,.cancel').off("click");
      jQuery(".payment,.cancel").addClass('disabled').attr("readonly","readonly");
      shortcut.add(key + "P", function (e) { initPrint(e); });
    }else if (status == 3){ // Print
      jQuery(".print").addClass('disabled').attr("readonly","readonly");
      jQuery(".print").off('click');
      jQuery(".payment,.cancel").removeClass('disabled').removeAttr("readonly");
      jQuery('.payment').on("click",initAgreePayment);
      jQuery('.cancel').on("click",initCancel);
      jQuery('input').not('.not_clear').val("");
       jQuery('textarea').val("");
       jQuery('.voucher').val(voucher);
       jQuery('.date_voucher').val(moment().format('DD/MM/YYYY'));
       jQuery("select.droplist").not('.not_clear').each(function() {
         jQuery(this).data('kendoDropDownList').value(0);
        });
        shortcut.add(key + "S", function (e) { initAgreePayment(e); });
        shortcut.add(key + "C", function (e) { initCancel(e); });
    }
  }

  var initKendoGridSenderReceiver= function () {
    var grid = $kGridSenderReceiver.kendoGrid({
          dataSource: {
              data: []
          },
          selectable: "row",
          height: jQuery(window).height() * 0.5,
          sortable: true,
          pageable: true,
          filterable: true,
          columns: Ermis.columns_sender_receiver,
          dataBound: function () {
              var rows = this.items();
              $(rows).each(function () {
                  var index = $(this).index() + 1;
                  var rowLabel = $(this).find(".row-number");
                  $(rowLabel).html(index);
              });
          }
      });
      $kGridSenderReceiver.dblclick(function (e) {
          initChoose(e);
      });
      grid.data("kendoGrid").thead.kendoTooltip({
        filter: "th",
        content: function (e) {
            var target = e.target; // element for which the tooltip is shown
            return $(target).text();
        }
    });
  };

  var initCheckCollect = function(){
    $('input[name=collect]').on('ifClicked', function (ev) {
      jQuery('input[name=collect_amount]').removeClass('disabled');
      jQuery('input[name=collect_amount]').removeAttr('readonly');
     })
     $('input[name=collect]').on('ifUnchecked', function (ev) {
       jQuery('input[name=collect_amount]').addClass('disabled');
       jQuery('input[name=collect_amount]').attr('readonly','');
      })
  }

  initChangePrice = function(){
    jQuery("input[name='price']").bind("blur",function(e){
      var quantity = jQuery('input[name="quantity"]').data("kendoNumericTextBox").value();
      var price = jQuery('input[name="price"]').data("kendoNumericTextBox").value();
      var total = quantity * price;
      jQuery('input[name="fee"]').data("kendoNumericTextBox").value (total);
      jQuery("input[name=total]").val(FormatNumber(total));
    })
  }

  initCaculationVatTotal = function(){
    var fee = jQuery('input[name="fee"]').data("kendoNumericTextBox").value();
    var surcharge_amount = jQuery('input[name="surcharge_amount"]').data("kendoNumericTextBox").value();
    var money = jQuery('input[name="money"]').data("kendoNumericTextBox").value();
    var vat = (surcharge_amount + fee + money) * jQuery('input[name="vat"]').data("kendoNumericTextBox").value() / 100;
    jQuery("input[name=total]").val(FormatNumber(fee+ money+surcharge_amount+vat));
    jQuery("input[name=vat_amount]").val(FormatNumber(vat));
  }

  initChangeVat = function(){
    jQuery("input[name='vat']").bind("blur",function(e){
      initCaculationVatTotal();
    })
  }


  var initChangePaymentMethod = function(){
    jQuery("select[name='payment_method']").bind("change",function(e){
        var val = jQuery(this).val();
          var payment = jQuery('input[name="payment"]').data("kendoNumericTextBox");
          payment.value(jQuery('input[name="fee"]').val());
          jQuery('input[name="refund"]').val(0);
        if(val == 2){
          payment.readonly(true);
        }else{
          payment.readonly(false);
        }
    })
  }

  var initCancel = function(){
    initStatus(1)
  }

  var initChoose = function (e) {
      var jQuerylink = jQuery(e.target);
      e.preventDefault();
      if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
          if ($kGridSenderReceiver.find('tr.k-state-selected').length > 0) {
              var grid = $kGridSenderReceiver.data("kendoGrid");
              var dataItem = grid.dataItem($kGridSenderReceiver.find('tr.k-state-selected'));
              $kWindow1.close();
              var type = '';
              if(dataType == 1){
                type = 'sender_'
              }else{
                type = 'receiver_'
              }
              jQuery.each(Ermis.columns_sender_receiver, function (i, v) {
                  if(v.hidden){
                  if(jQuery('#form-action').find('select[name="' +type+ v.field + '"]').length > 0){
                     jQuery('#form-action').find('select[name="' +type+ v.field + '"]').data('kendoDropDownList').value(dataItem[v.field]);
                   }
                  }else{
                   jQuery('#form-action').find('input[name="' +type+ v.field + '"]').val(dataItem[v.field]);
                  }
              });
          } else {
              kendo.alert(transText.please_select_line_choose);
          }
      }
      jQuerylink.data('lockedAt', +new Date());
  };

  var initFilterForm = function (e) {
      $kGridSenderReceiver.data("kendoGrid").dataSource.data([]);
      dataType = jQuery(e.currentTarget).attr('data-type');
      if(dataType==1){
        jQuery("select[name=subject]").data('kendoDropDownList').value(0);
        jQuery("select[name=sales_staff]").data('kendoDropDownList').value(0);
      }
      jQuery("#form-window-sender-receiver").find(".k-radio#"+dataType+"").prop('checked', true);
      $kWindow1.open();
      jQuery('#search_data').click();
  };

  var initKendoUiDialog = function () {
      $kWindow1 = myWindow1.kendoWindow({
          width: "600px",
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

      $kWindow2 = myWindow2.kendoWindow({
          width: "600px",
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

      $kWindow1.title("Tìm kiếm đối tượng");
      $kWindow2.title("Thanh toán");
  };

  //var initChangeSale = function(){
   //jQuery('input[type=radio][name=radio]').change(function() {
    //    if (this.value == '1') {
    //        jQuery(".for_sender").removeClass('hidden');
    //        jQuery(".for_sender select").removeClass('not_null');
    //        jQuery(".for_company").addClass('hidden');
    //        jQuery(".for_company select").addClass('not_null');
    //        jQuery("select[name='payment_method']").data('kendoDropDownList').value(1)
    //    }
    //    else if (this.value == '2') {
    //        jQuery(".for_company").removeClass('hidden');
    //        jQuery(".for_company select").removeClass('not_null');
    //        jQuery(".for_sender").addClass('hidden');
    //        jQuery(".for_sender select").addClass('not_null');
    //        jQuery("select[name='payment_method']").data('kendoDropDownList').value(2)
    //    }
  //  });
//  }
  var initTotal = function(){
    jQuery("input[name=fee],input[name=surcharge_amount],input[name=money],input[name=vat_amount]").on("blur",function(){
    initCaculationVatTotal();
    })
  }

  var initChangeCompany = function(){
    jQuery("select[name=subject]").data("kendoDropDownList").bind("change", onChange);
    function onChange(e) {
      var obj = e.sender.value();
      var postdata = { data: JSON.stringify(obj)};
      RequestURLWaiting(Ermis.link+'-load', 'json', postdata, function (result) {
          if (result.status === true) {
            jQuery('input[name=sender_fullname]').val(result.data.name);
            jQuery('input[name=sender_address]').val(result.data.address);
            jQuery('input[name=sender_phone]').val(result.data.telephone1_contact);
            jQuery('input[name=sender_email]').val(result.data.email);
            jQuery('select[name=sales_staff]').data("kendoDropDownList").value(result.data.sales_staff)
            if(result.data.payment_method){
              jQuery('select[name=payment_method]').data("kendoDropDownList").value(result.data.payment_method);
            }else{
              jQuery('select[name=payment_method]').data("kendoDropDownList").value(1);
            }
            if(result.receiver){
              jQuery('input[name=receiver_fullname]').val(result.receiver.fullname);
              jQuery('input[name=receiver_phone]').val(result.receiver.phone);
              jQuery('input[name=receiver_address]').val(result.receiver.address);
              jQuery('input[name=receiver_email]').val(result.receiver.email);
            }
          } else {
            jQuery('input[name=sender_fullname]').val("");
            jQuery('input[name=sender_address]').val("");
            jQuery('input[name=sender_phone]').val("");
            jQuery('input[name=sender_email]').val("");
            jQuery('select[name=payment_method]').data("kendoDropDownList").value(1);
            jQuery('select[name=sales_staff]').data("kendoDropDownList").value(0);
            jQuery('input[name=receiver_fullname]').val("");
            jQuery('input[name=receiver_phone]').val("");
            jQuery('input[name=receiver_address]').val("");
            jQuery('input[name=receiver_email]').val("");
                kendo.alert(result.message);
          }
      }, true);
      }
  }

  var initSearchSenderReceiver = function () {
      jQuery('#search_data').on('click', function () {
          var obj = {};
          var filter = GetAllDataForm('#form-window-sender-receiver', 2);
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
          RequestURLWaiting(Ermis.link+'-get', 'json', postdata, function (result) {
              if (result.status === true) {
                  var grid = $kGridSenderReceiver.data("kendoGrid");
                  var ds = new kendo.data.DataSource({ data: result.data });
                  grid.setDataSource(ds);
                  grid.dataSource.page(1);
              }else {
                  kendo.alert(result.message);
              }
          }, true);
      });

  };

  var initPrintTest = function(e){
    var jQuerylink = jQuery(e.target);
    e.preventDefault();
    if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
    var $kprint = jQuery('#printbill');
    JsBarcode("#barcode_voucher", "123456", {format: "CODE128", width:3, height:50 , marginLeft : 25 });
    $kprint.removeClass('hidden');
    $kprint.print();
    }
    jQuerylink.data('lockedAt', +new Date());
  }


  var initPrint = function(e){
    var jQuerylink = jQuery(e.target);
    e.preventDefault();
    if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
    var $kprint = jQuery('#printbill');
    var postdata = { data: JSON.stringify(dataId)};
    RequestURLWaiting(Ermis.link+'-print', 'json', postdata, function (result) {
        if (result.status === true) {
            //JsBarcode("#barcode_voucher", result.data.code , {format: "CODE128", width:3, height:50 , marginLeft : 25 });
            $kprint.find('.voucher_print').text(result.data.code);
            $kprint.find('.date_voucher').text(FormatDate(result.data.date_voucher));
            if(result.data.company_name){
             $kprint.find('.company_name').text(result.data.company_name);
           }else{
             $kprint.find('.company_name').text(result.data.sender_fullname);
           }
            $kprint.find('.sender_fullname').text(result.data.sender_fullname);
            $kprint.find('.sender_company').text(result.data.sender_company);
            $kprint.find('.sender_phone').text(result.data.sender_phone);
            $kprint.find('.sender_email').text(result.data.sender_email);
            $kprint.find('.sender_address').text(result.data.sender_address);
            $kprint.find('.sender_city').text(FormatDropList(result.data.sender_city,'sender_city'));
            $kprint.find('.receiver_fullname').text(result.data.receiver_fullname);
            $kprint.find('.receiver_phone').text(result.data.receiver_phone);
            $kprint.find('.receiver_email').text(result.data.receiver_email);
            $kprint.find('.receiver_address').text(result.data.receiver_address);
            $kprint.find('.receiver_city').text(FormatDropList(result.data.receiver_city,'receiver_city'));
            $kprint.find('.name').text(result.data.name);
            $kprint.find('.unit_quantity').text(result.data.unit_quantity);
            $kprint.find('.quantity').text(result.data.quantity);
            $kprint.find('.price').text(FormatNumber(result.data.price));
            $kprint.find('.fee').text(FormatNumber(result.data.fee));
            $kprint.find('.unit').text(result.data.unit);
            $kprint.find('.lot_number').text(result.data.lot_number);
            $kprint.find('.surcharge_amount').text(FormatNumber(result.data.surcharge_amount));
            $kprint.find('.total_amount').text(FormatNumber(result.data.total_amount));
            $kprint.find('.total').text(FormatNumber(result.data.total_amount));
            $kprint.find('.sale_staff').text(result.data.sale_staff);
            $kprint.find('.note').text(result.data.note);
            $kprint.find('.user').text(result.data.user_name);
            $kprint.find('.payment_method').text(result.data.payment_method);
            $kprint.removeClass('hidden');
            setTimeout(function(){
            $kprint.print();
            }, 300);
            initStatus(3);
            setTimeout(function(){
              $kprint.addClass('hidden');
            }, 500);

          }else{
              kendo.alert(result.message);
          }
    }, true);
    }
    jQuerylink.data('lockedAt', +new Date());
  }



  var initKendoUiDropList = function () {
      jQuery(".droplist").kendoDropDownList({
          filter: "contains"
      });
  };

  var initVoucherMasker = function () {
      var data = Ermis.voucher;
      var char = 'x';
      var number = parseInt(data.length_number);
      if(data.prefix == 'DATE'){
        data.prefix = moment().format("DDMMYYYY")
      }
      if (data.suffixed) {
          voucher = data.prefix + char.repeat(number) + data.suffixed;
      } else {
          voucher = data.prefix + char.repeat(number);
      }
  };


  var initAgreePayment = function(e){
    var jQuerylink = jQuery(e.target);
    e.preventDefault();
    if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
        $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
          jQuery("input[name='total_amount']").val(ConvertNumber(jQuery("input[name='total']").val()));
          jQuery("input[name='payment']").data("kendoNumericTextBox").value(jQuery("input[name='total']").val());
          jQuery("#form-window-payment select[name='subject']").data("kendoDropDownList").value(jQuery("#form-action select[name='subject']").data("kendoDropDownList").value());
          jQuery('input[name="refund"]').val(0)
            if (confirmed) {
                var obj = {}; var crit = true;
                  jQuery("#form-action select.droplist,#form-action1 select.droplist,#form-window-payment select.droplist").not('.not_check').each(function() {
                    if(jQuery(this).data('kendoDropDownList').value() == 0 && !jQuery(this).hasClass("not_null")){
                        jQuery(this).parents('span.droplist').attr('style','border-color: red;');
                        jQuery(this).parents('span.droplist').find('span.k-dropdown-wrap').attr('style','border-color: red;');
                         crit = false;
                    }else{
                      jQuery(this).parents('span.droplist').removeAttr('style');
                      jQuery(this).parents('span.droplist').find('span.k-dropdown-wrap').removeAttr('style');
                      obj[jQuery(this).attr("name")] = jQuery(this).data('kendoDropDownList').value();
                    }
                   });
                   jQuery("#form-action input,#form-action1 input,#form-window-payment input,#form-action1 textarea").not('.not_check').each(function() {
                     if(jQuery(this).val() == 0 && !jQuery(this).hasClass("not_null") || jQuery(this).val() == "" && !jQuery(this).hasClass("not_null") ){
                        if(jQuery(this).hasClass('number-price') || jQuery(this).hasClass('numberic') || jQuery(this).hasClass('number')){
                          jQuery(this).parents('span.k-numeric-wrap').attr('style','border-color: red;');
                        }else{
                          jQuery(this).attr('style','border-color: red;');
                        }
                          crit = false;
                     }else{
                       if(jQuery(this).hasClass("convert_number")){
                          obj[jQuery(this).attr("name")] = ConvertNumber(jQuery(this).val());
                       }else if(jQuery(this).attr('type') == 'checkbox'){
                         if (jQuery(this).parent().hasClass('checked')) {
                             obj[jQuery(this).attr("name")] = 1;
                         }else{
                             obj[jQuery(this).attr("name")] = 0;
                         }
                       }else{
                           obj[jQuery(this).attr("name")] = jQuery(this).val();
                          if(jQuery(this).hasClass('number-price') || jQuery(this).hasClass('numberic') || jQuery(this).hasClass('number')){
                            jQuery(this).parents('span.k-numeric-wrap').removeAttr('style');
                          }else{
                            jQuery(this).removeAttr('style');
                          }
                       }

                     }
                    });
                  if(crit == true){
                  var postdata = { data: JSON.stringify(obj)};
                  RequestURLWaiting(Ermis.link+'-payment', 'json', postdata, function (result) {
                      if (result.status === true) {
                         kendo.alert(result.message);
                         initStatus(2);
                         $kWindow2.close();
                         jQuery('.voucher').val(result.voucher);
                         dataId = result.dataId
                      } else {
                         kendo.alert(result.message);
                      }
                  }, true);
                  }else{
                  kendo.alert(transText.please_fill_field);
                  }
                }
        });
    }
    jQuerylink.data('lockedAt', +new Date());
  }

  var initPaymentForm = function () {
    var crit = true ;
    jQuery("#form-action select.droplist").not(".not_null").not(".hidden").each(function() {
      if(jQuery(this).data('kendoDropDownList').value() == 0){
           crit = false;
           return false;
      }
     });
     jQuery("#form-action1 select.droplist").not(".not_null").not(".hidden").each(function() {
       if(jQuery(this).data('kendoDropDownList').value() == 0){
            crit = false;
            return false;
       }
      });

     jQuery("#form-action input").not(".not_null").not(".hidden").each(function() {
       if(jQuery(this).val() == 0 || jQuery(this).val() == "" ){
            crit = false;
            return false;
       }
      });
      jQuery("#form-action1 input").not(".not_null").not(".hidden").each(function() {
        if(jQuery(this).val() == 0 || jQuery(this).val() == "" ){
             crit = false;
             return false;
        }
       });

    if(crit == true ){
      jQuery("input[name='total_amount']").val(FormatNumber(jQuery("input[name='fee']").val()))
      jQuery("input[name='payment']").data("kendoNumericTextBox").value(jQuery("input[name='fee']").val())
        $kWindow2.open();
    }else{
        kendo.alert(transText.please_fill_field);
    }

    jQuery('input[name="payment"]').on("blur change",function(){
      var total_amount = jQuery("input[name='fee']").val()?parseInt(jQuery("input[name='fee']").val()):0;
      var payment = jQuery('input[name="payment"]').data("kendoNumericTextBox").value();
      jQuery('input[name="refund"]').val(FormatNumber(payment-total_amount));
    })
    return crit;
  };


  var initClose = function (e) {
      var jQuerylink = jQuery(e.target);
      e.preventDefault();
      if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
          if ($kWindow1.element.is(":hidden") === false) {
              $kWindow1.close();
              var grid = $kGridSenderReceiver.data('kendoGrid');
              grid.dataSource.data([]);
          }else if ($kWindow2.element.is(":hidden") === false) {
              $kWindow2.close();
          }
      }
      jQuerylink.data('lockedAt', +new Date());
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

  var initKendoUiNumber = function () {
      $(".number").kendoNumericTextBox({
          format: "n0",
          step: 1,
          min : 0
      });
  }

  var initKendoUiNumberVat = function () {
      $(".number-vat").kendoNumericTextBox({
          format: "n0",
          step: 1,
          min : 0,
          max : 100
      });
  }

  var initKendoDatePicker = function () {
      jQuery(".date-picker").kendoDatePicker({
          format: "dd/MM/yyyy"
      }).data("kendoDatePicker");

  };

  var initKendoUiNumberPrice = function () {
      $(".number-price").kendoNumericTextBox({
          format: "n0",
          step: 1000,
          min : 0
      });
  }

  var initKendoUiNumberic = function () {
      $(".numberic").kendoNumericTextBox({
          format: "n2",
          step: 0.01,
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



    return {

        init: function () {
          initVoucherMasker();
          initStatus(0);
          initKendoUiNumber();
          initKendoUiNumberPrice();
          initKendoUiNumberVat();
          initKendoUiNumberic();
          initKendoDatePicker();
          initKendoUiPercent();
          initKendoUiDropList();
          initKeyCode();
          initKendoUiDialog();
          initSearchSenderReceiver();
          initKendoGridSenderReceiver();
          initChangePaymentMethod();
          initTotal();
          initCheckCollect();
          //initChangeSale();
          initChangeCompany();
          initChangePrice();
          initChangeVat();
        }

    };

}();

jQuery(document).ready(function () {
    Ermis.init();
});
