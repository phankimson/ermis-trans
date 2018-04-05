var Charts = function () {
        var mg_linked_charts_id1 = '#mg_chart_linked_revenue',
            mg_linked_charts_id2 = '#mg_chart_linked_cost',
            mg_linked_charts_id3 = '#mg_chart_linked_full';
  var initChartsCostRevenue = function(data1,data2,data3){
    // linked charts
    setTimeout(function(){
          mg_linked_charts_id1_height = $(mg_linked_charts_id1).height(),
          mg_linked_charts_id2_height = $(mg_linked_charts_id2).height(),
          mg_linked_charts_id3_height = $(mg_linked_charts_id3).height();

        if ($(mg_linked_charts_id1).length && $(mg_linked_charts_id2).length && $(mg_linked_charts_id3).length) {
          var mg_linked_charts_id1_width = $(mg_linked_charts_id1).width(),
              mg_linked_charts_id2_width = $(mg_linked_charts_id2).width(),
              mg_linked_charts_id3_width = $(mg_linked_charts_id3).width();

              data = MG.convert.date(data1, 'date');
              MG.data_graphic({
                  data: data,
                  linked: true,
                  width: mg_linked_charts_id1_width,
                  height: mg_linked_charts_id1_height,
                  xax_count: 4,
                  target: mg_linked_charts_id1
              });

              data = MG.convert.date(data2, 'date');
              MG.data_graphic({
                  data: data,
                  area: false,
                  linked: true,
                  width: mg_linked_charts_id2_width,
                  height: mg_linked_charts_id2_height,
                  xax_count: 4,
                  target: mg_linked_charts_id2
              });

              data = MG.convert.date(data3, 'date');
               MG.data_graphic({
                   data: data,
                   width: mg_linked_charts_id3_width,
                   height: mg_linked_charts_id3_height,
                   right: 40,
                   color: '#8C001A',
                   target: mg_linked_charts_id3,
                   x_accessor: 'date',
                   y_accessor: 'value'
               });

        }

     }, 100);


  }

  // date range

  var $dp_start = $('#uk_dp_start'),
      $dp_end = $('#uk_dp_end');
  var date_range =  function() {

      var start_date = UIkit.datepicker($dp_start, {
          format:'DD.MM.YYYY'
      });

      var end_date = UIkit.datepicker($dp_end, {
          format:'DD.MM.YYYY'
      });

      $dp_start.on('change',function() {
          end_date.options.minDate = $dp_start.val();
          setTimeout(function() {
              $dp_end.focus();
          },300);
      });

      $dp_end.on('change',function() {
          start_date.options.maxDate = $dp_end.val();
      });
  }





  var initGetData = function(){
    var obj = {};
     obj.start_date = $dp_start.val();
     obj.end_date = $dp_end.val();
     obj.inventory = jQuery("#stock").val();
     var postdata = { data: JSON.stringify(obj) };
     RequestURLWaiting('charts-get', 'json', postdata, function (result) {
         if (result.status === true) {
           initChartsCostRevenue(result.m1,result.m2,result.m3)

         }else {
             kendo.alert(result.message);
         }
     }, true);
  }



  var initStatus = function(){
    jQuery("#get_data").on("click",initGetData);
    $window.on('debouncedresize', function () {
        initChartsCostRevenue();
    })

    $window.on('resize',function() {
        ch_distributed_series.update();
    });
  }
    return {

        init: function () {
          initStatus();
          date_range();
          initChartsCostRevenue(Charts.m1,Charts.m2,Charts.m3);

        }

    };

}();

jQuery(document).ready(function () {
    Charts.init();
});
