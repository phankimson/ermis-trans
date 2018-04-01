﻿var Ermis = function () {
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


    var initKendoGrid = function () {
        dataSource = {
            data: Ermis.data,
            pageSize: 20,
            aggregate: Ermis.aggregate,
        };
      var grid = $kGrid.kendoGrid({
            dataSource: dataSource,
            selectable: "row",
            filterable: true,
            groupable: true,
            sortable: {
                  mode: "multiple",
                  allowUnsort: true,
                  showIndexes: true
                  },
            pageable: {
                refresh: true,
                pageSizes: true,
                buttonCount: 5
            },
            columns: Ermis.columns
        });
        grid.data("kendoGrid").thead.kendoTooltip({
          filter: "th",
          content: function (e) {
              var target = e.target; // element for which the tooltip is shown
              return $(target).text();
          }
      });
        $kGrid.on("dblclick", "tr.k-state-selected", function () {
          alert('a')
        });
    };
    var initGridList = function () {
        var dataSource = new kendo.data.TreeListDataSource({
            data: Ermis.data,
            schema: {
                model: {
                    id: "id",
                    parentId: "parent_id",
                    fields: Ermis.field,
                    expanded: true
                },

            }
        });
      var grid = $kGridList.kendoTreeList({
            dataSource: dataSource,
            height: jQuery(window).height() * 0.75,
            groupable: true,
            sortable: true,
            pageable: false,
            filterable: true,
            columns: Ermis.columns
        });

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
        $table.bootstrapTable('destroy').bootstrapTable({
            exportDataType: 'all',
        });
    };

    var initReport = function (e) {
        jQuery('.get_report').on('click', function () {
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
                    jQuery('#report').show( "fast", function showNext() {
                        $table.bootstrapTable('load', result.data);
                    });
                    jQuery('#grid').hide(1000);
                    jQuery('#list').hide(1000);
                }else{
                    kendo.alert(result.message)
                }
            }, true);
        })

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
                    if (jQuery('#grid').attr('id') === 'grid') {
                        dataSource = new kendo.data.DataSource({ data: result.data, aggregate: Ermis.aggregate, schema: { model: { fields: Ermis.field } } });
                        var grid = $kGrid.data("kendoGrid");
                        grid.setDataSource(dataSource);
                        $kGrid.show(1000);
                    } else if (jQuery('#list').attr('id') === 'list') {
                        dataSource = new kendo.data.TreeListDataSource({
                            data: result.data,
                            schema: {
                                model: {
                                    id: "id",
                                    parentId: "parent_id",
                                    fields: Ermis.field,
                                    expanded: true
                                },

                            }
                        });
                        var grid_list = $kGridList.data("kendoTreeList");
                        grid_list.setDataSource(dataSource);
                        $kGridList.show(1000);
                    }
                    jQuery('#report').hide(1000);
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
        template: '#= code # | #= name # ',
        dataTextField: "code",
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
    calculateAmount = function (quantity, price) {
        if (price !== 0) {
            price = price.replace(",", "");
        }
        amount = quantity * price;
        return kendo.toString(amount, 'n0');
    };
    calculatePriceAggregate = function () {
        var data = dataSource.data();
        var total = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i].quantity > 0) {
                var a = data[i].price.replace(",", "");
                total += data[i].quantity * a;
            }
        }
        return kendo.toString(total, 'n0');
    };
    calculateNumber = function () {
        var data = dataSource.data();
        var total = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i].quantity > 0) {
                total += parseInt(data[i].quantity);
            }
        }
        return kendo.toString(total, 'n0');
    };

    return {

        init: function () {
            initKendoGrid();
            initGridList();
            initKendoUiContextMenu();
            initKendoStartDatePicker();
            initKendoEndDatePicker();
            initKendoUiDropList();
            initKendoItemDropList();
            initGetColunm();
            initHideShow();
            initSearchData();
            initReport();
            initTable();
        }

    };

}();

jQuery(document).ready(function () {
    Ermis.init();
});
