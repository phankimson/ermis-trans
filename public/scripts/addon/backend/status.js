var Ermis = function () {
    var data = [];
    var myWindow1 = jQuery("#form-window-edit");
    var $kWindow1 = '';
    var dataId = '';
    var initGetColunm = function () {
        data = GetAllDataForm('#form-action');
        return data;
    };
    var bindData = function(v){
      jQuery(".uk-table tbody").find('tr').not('.load').remove();
      jQuery.each(v, function (k, d) {
        var copy = jQuery(".uk-table tbody").find('tr:eq(0)').clone(true);
        copy.removeClass('hidden').removeClass('load');
        copy.find('td').eq(0).text(moment(d.date_voucher, "YYYY-MM-DD").add('days', 1).format('DD/MM/YYYY'));
        copy.find('td').eq(1).text(d.name);
        copy.find('td').eq(2).find('a').text(d.code);
        copy.find('td').eq(3).text(d.sender_fullname);
        copy.find('td').eq(4).text(d.receiver_fullname);
        copy.find('td').eq(5).text(d.lot_number);
        copy.find('td').eq(6).text(d.transport_station_send);
        copy.find('td').eq(7).text(d.transport_station_receive);
        if(d.status == 0){
          copy.find('td').eq(8).html('<span class="uk-badge uk-badge-muted">'+transText.not_warehoused+'</span>');
        }else if(d.status == 1){
          copy.find('td').eq(8).html('<span class="uk-badge uk-badge-info">'+transText.goods_in_sender+'</span>');
        }else if(d.status == 2){
          copy.find('td').eq(8).html('<span class="uk-badge uk-badge-alert">'+transText.goods_in_vehicle+'</span>');
        }else if(d.status == 3){
          copy.find('td').eq(8).html('<span class="uk-badge uk-badge-info">'+transText.goods_in_receiver+'</span>');
        }else if(d.status == 4){
          copy.find('td').eq(8).html('<span class="uk-badge uk-badge-success">'+transText.goods_delivered+'</span>');
        }
        if(d.active == 1){
          copy.find('td').eq(9).html('<i class="material-icons md-color-light-blue-600 md-24"></i>');
        }else if(d.active == 0){
          copy.find('td').eq(9).html('');
        }
          copy.find('td').eq(10).find('a').removeClass("disabled").attr('data-id',d.id);
          jQuery(".uk-table").find('tbody').append(copy);
        })
    }
    var initPaging = function(){
      jQuery('[data-uk-pagination]').on('select.uk.pagination', function(e, pageIndex){
        var postdata = { data: JSON.stringify(pageIndex+1) };
        RequestURLWaiting(Ermis.link+'-page', 'json', postdata, function (result) {
            if (result.status === true) {
                bindData(result.data);
            } else {
                kendo.alert(result.message);
            }
        }, true);
    });
    }

    var initTotal = function(){
      jQuery("input[name=price],input[name=surcharge_amount]").on("blur",function(){
        var price = jQuery("input[name='price']").data("kendoNumericTextBox").value();
        var surcharge_amount = jQuery("input[name='surcharge_amount']").data("kendoNumericTextBox").value();
        var total = price + surcharge_amount;
        jQuery("input[name=total_amount]").val(FormatNumber(total));
      })
    }

    var initFilter = function(){

        var obj = {};
        jQuery.each(data.columns, function (k, col) {
          if(col.field != undefined){
            if (col.null === true && !jQuery('input[name="' + col.field + '"]').val()) {
                crit = false;
                return false;
            } else {
                crit = true;
            }

            if (col.key === 'text' || col.key === 'password' || col.key === 'number') {
                if (jQuery('input[name="' + col.field + '"]').hasClass('number-price') || jQuery('input[name="' + col.field + '"]').hasClass('number')) {
                    obj[col.field] = jQuery('input[name="' + col.field + '"]').data("kendoNumericTextBox").value();
                } else {
                    obj[col.field] = jQuery('input[name="' + col.field + '"]').val().trim();
                    if (col.type === 'date') {
                        obj[col.field] = formatDateDefault(obj[col.field]);
                    }
                }

            } else if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("droplist")) {
                obj[col.field] = jQuery('.droplist[name="' + col.field + '"]').data('kendoDropDownList').value();
            } else if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("multiselect")) {
                var arr = jQuery('.multiselect[name="' + col.field + '"]').data('kendoMultiSelect').value();
                obj[col.field] = arr.join();
            } else if (col.key === 'textarea') {
                obj[col.field] = jQuery('textarea[name="' + col.field + '"]').val().trim();
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
            } else if (col.key === 'radio') {
                obj[col.field] = jQuery('input[name="' + col.field + '"]:checked').val();
            }else if (col.key === 'select' && jQuery('select[name="' + col.field + '"]').hasClass('selectized')) {
                  obj[col.field]  = jQuery('#'+col.field).val()
            }
          }
        });
        var postdata = { data: JSON.stringify(obj) };
        RequestURLWaiting(Ermis.link+'-filter', 'json', postdata, function (result) {
            if (result.status === true) {
              bindData(result.data);
            } else {
                kendo.alert(result.message);
            }
        }, true);
    }
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

        $kWindow1.title("Sửa thông tin bưu kiện");
    };


    var initEditForm = function () {
        $kWindow1.open();
    };


      var initKendoDatePicker = function () {
          jQuery(".date-picker").kendoDatePicker({
              format: "dd/MM/yyyy"
          }).data("kendoDatePicker");

      };

    var initSave = function(e){
      var jQuerylink = jQuery(e.target);
      e.preventDefault();
      if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
          $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
              if (confirmed) {
                  var obj = {}; var crit = true;
                  obj.id = dataId;
                    jQuery("#tabs_anim select.droplist").each(function() {
                        obj[jQuery(this).attr("name")] = jQuery(this).data('kendoDropDownList').value();
                     });
                     jQuery("#tabs_anim input").each(function() {
                         if(jQuery(this).hasClass("convert_number")){
                            obj[jQuery(this).attr("name")] = ConvertNumber(jQuery(this).val());
                         }else if(jQuery(this).attr('type') == 'checkbox' && !jQuery(this).hasClass('not_save')){
                           if (jQuery(this).parent().hasClass('checked')) {
                               obj[jQuery(this).attr("name")] = 1;
                           }else{
                               obj[jQuery(this).attr("name")] = 0;
                           }
                         }else{
                            obj[jQuery(this).attr("name")] = jQuery(this).val();
                         }
                      });
                      jQuery("#tabs_anim textarea").each(function() {
                          obj[jQuery(this).attr("name")] = jQuery(this).val();
                       });
                    if(crit == true){
                    var postdata = { data: JSON.stringify(obj)};
                    RequestURLWaiting(Ermis.link+'-save', 'json', postdata, function (result) {
                        if (result.status === true) {
                          $kWindow1.close();
                          var copy = jQuery(".approved[data-id='"+dataId+"']").parents("tr").eq(0);
                          copy.find('td').eq(1).text(obj.name);
                          copy.find('td').eq(3).text(obj.sender_fullname);
                          copy.find('td').eq(4).text(obj.receiver_fullname);
                          copy.find('td').eq(5).text(obj.lot_number);
                          copy.find('td').eq(7).text(FormatDropList(obj.transport_station_receive,'transport_station_receive'));
                          kendo.alert(result.message);
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

    var initApproved = function(e){
      var jQuerylink = jQuery(e.target);
      e.preventDefault();
      if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
        dataId = jQuery(e.currentTarget).attr('data-id');
        var postdata = { data: JSON.stringify(dataId) };
        RequestURLWaiting(Ermis.link+'-get', 'json', postdata, function (result) {
            if (result.status === true) {
              jQuery('#tabs_anim input,select').not(".not_load").each( function (k, v) {
                  if(jQuery(v).hasClass('date') || jQuery(v).hasClass('date_voucher')){
                    jQuery(v).val(FormatDate(result.data[jQuery(v).attr('name')]));
                  }else if(jQuery(v).hasClass('droplist')){
                    jQuery('.droplist[name="' + jQuery(v).attr('name')+ '"]').data('kendoDropDownList').value(result.data[jQuery(v).attr('name')]);
                  }else if(jQuery(v).hasClass('number-price')){
                    var name = jQuery(v).attr('name');
                    if(name){
                      jQuery('input[name="' + name +'"]').data("kendoNumericTextBox").value(result.data[name]);
                    }
                  }else if(jQuery(v).attr('type') == 'checkbox'){
                         if (result.data[jQuery(v).attr('name')] == 1) {
                           jQuery(v).parent().addClass('checked')
                         }else{
                           jQuery(v).parent().removeClass('checked')
                         }
                  }else{
                    jQuery(v).val(result.data[jQuery(v).attr('name')]);
                  }
              });
              jQuery(".step").iCheck('uncheck');
              jQuery(".step").removeAttr('disabled');
              if(result.history.length > 0){
                jQuery.each(result.history,function(k,v){
                  jQuery("#step"+v.status).iCheck('check');
                  jQuery("#step"+v.status).attr('disabled','disabled');
                  jQuery("#step"+v.status).addClass('not_save');
                })
              }else{
                  jQuery(".step").iCheck('uncheck');
              }
            } else {
                kendo.alert(result.message);
            }
        }, true);
        initEditForm()
      }
      jQuerylink.data('lockedAt', +new Date());
    }
    var initPrint = function(e){
      var jQuerylink = jQuery(e.target);
      e.preventDefault();
      if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
      var $kprint = jQuery('#printbill');
      var dataId = jQuery(e.currentTarget).attr('data-id');
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
              $kprint.find('.total_amount').text(FormatNumber(result.data.total_amount));
              $kprint.find('.total').text(FormatNumber(result.data.total_amount));
              $kprint.find('.sale_staff').text(result.data.sale_staff);
              $kprint.find('.note').text(result.data.note);
              $kprint.find('.user').text(result.data.user_name);
              $kprint.find('.payment_method').text(result.data.payment_method);
              $kprint.find('.surcharge_amount').text(FormatNumber(result.data.surcharge_amount));
              $kprint.removeClass('hidden');
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
      jQuerylink.data('lockedAt', +new Date());
    }

    var initClose = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if ($kWindow1.element.is(":hidden") === false) {
                $kWindow1.close();
            }
        }
        jQuerylink.data('lockedAt', +new Date());
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
              filter: "contains"
          });
      };


    var initStatus = function(){
      jQuery('.approved.disabled').off("click");
      jQuery('.approved').on("click",initApproved);
      jQuery('.print').on("click",initPrint);
      jQuery('#filter').on("click",initFilter);
      jQuery('.cancel').on("click",initClose);
      jQuery('.save').on("click",initSave);
    }

    return {
        //main function to initiate the module
        init: function () {
          initGetColunm();
          initPaging();
          initStatus();
          initTotal();
          initKendoDatePicker();
          initKendoUiDialog();
          initKendoUiDropList();
          initKendoUiNumber();
          initKendoUiNumberPrice();
          initKendoUiPercent();
        }
    };
}();

jQuery(document).ready(function () {
    Ermis.init();
});
