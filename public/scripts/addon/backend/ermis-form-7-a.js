var Ermis = function () {
    var $kGrid = jQuery('#grid');
    var $kGridList = jQuery('#list');
    var end; var start;
    var data = [];
    var dataSource = '';
    var $table = jQuery('#table');


    var initGetColunm = function () {
        data = GetAllDataForm('#form-search');
        return data;
    };

    var initHideShow = function () {
        jQuery('.btn-hide').on('click', function () {
            jQuery('#btn-show').show(1000);
            jQuery('#form-search').hide(1000);
        });
        jQuery('.btn-show').on('click', function () {
            jQuery('#btn-show').hide(1000);
            jQuery('#form-search').show(1000);
        });
    };

    initBindData = function(data,data1){
        jQuery("#code").text(data1.code)
        jQuery("#name").text(data1.name)
        jQuery("#date_voucher").text(FormatDate(data1.date_voucher))
        jQuery("#transport_station_send").text(data1.transport_station_send)
        jQuery("#transport_station_receive").text(data1.transport_station_receive)
        jQuery("#sender_fullname").text(data1.sender_fullname)
        jQuery("#receiver_fullname").text(data1.receiver_fullname)
        if(data.length > 0){
          jQuery.each(data,function(k,v){
            jQuery("#step"+v.status).iCheck('check');
          })
        }else{
            jQuery(".step").iCheck('uncheck');
        }

    }


    var initKendoUiContextMenu = function () {
        jQuery("#context-menu").kendoContextMenu({
            target: ".md-card-content"
        });
    };
    var initTable = function () {
        $table.bootstrapTable({
            data: Ermis.data,
        });
        jQuery(function () {
            jQuery('#toolbar').find('select').change(function () {
                $table.bootstrapTable('destroy').bootstrapTable({
                    exportDataType: jQuery(this).val(),
                });
            });
        });
    };


    var initSearchData = function (e) {
        jQuery('.get_data').on('click', function () {
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
            var postdata = { data: JSON.stringify(obj) };
            RequestURLWaiting(Ermis.link+'-Get', 'json', postdata, function (result) {
                if (result.status === true) {
                    initBindData(result.data,result.goods)
                    jQuery('#report').hide(1000);
                }else {
                    kendo.alert(result.message);
                }
            }, true);
        })

    };

    var initKendoStartDatePicker = function () {
        start = jQuery("#start").kendoDatePicker({
            change: startChange,
            format: "dd/MM/yyyy"
        }).data("kendoDatePicker");
        function startChange() {
            var startDate = start.value(),
            endDate = end.value();

            if (startDate) {
                startDate = new Date(startDate);
                startDate.setDate(startDate.getDate());
                end.min(startDate);
            } else if (endDate) {
                start.max(new Date(endDate));
            } else {
                endDate = new Date();
                start.max(endDate);
                end.min(endDate);
            }
        }
    };
    var initKendoEndDatePicker = function () {
        end = jQuery("#end").kendoDatePicker({
            change: endChange,
            format: "dd/MM/yyyy"
        }).data("kendoDatePicker");
        function endChange() {
            var endDate = end.value(),
            startDate = start.value();

            if (endDate) {
                endDate = new Date(endDate);
                endDate.setDate(endDate.getDate());
                start.max(endDate);
            } else if (startDate) {
                end.min(new Date(startDate));
            } else {
                endDate = new Date();
                start.max(endDate);
                end.min(endDate);
            }
        }
    };
    var initKendoUiDropList = function () {
        jQuery(".droplist").kendoDropDownList({
            filter: "contains"
        });
    };

    var initKendoItemDropList = function(){
      jQuery("#item").kendoDropDownList({
        template: '#= barcode # | #= name # | #= size #',
        dataTextField: "barcode",
        dataValueField: "id",
        virtual: {
            itemHeight: 26
        },
        height: 520,
        dataSource: {
            data : Ermis.item,
            pageSize: 80,
            serverPaging: true,
            serverFiltering: true
        },
          filter: "contains"
      });


        //This is a helper method that serializes values into a understandable format for the server.
        //This method is not obligatory to use. Instead, you need to send the value in a format that is understandable for the server.
        function convertValues(value) {
            var data = {};

            value = $.isArray(value) ? value : [value];

            for (var idx = 0; idx < value.length; idx++) {
                data["values[" + idx + "]"] = value[idx];
            }

            return data;
        }
    }

    var initKendoButton = function () {
        jQuery("#search_grid").kendoButton();
    };


    return {

        init: function () {
            initKendoUiContextMenu();
            initKendoStartDatePicker();
            initKendoEndDatePicker();
            initKendoUiDropList();
            initKendoItemDropList();
            initGetColunm();
            initHideShow();
            initSearchData();
            initTable();
        }

    };

}();

jQuery(document).ready(function () {
    Ermis.init();
});
