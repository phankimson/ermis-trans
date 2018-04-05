'use strict'
const Inventory = use('App/Model/Inventory')
const Option = use('App/Model/Option')  // EDIT
const PosCash = use('App/Model/PosCash')  // EDIT
const Goods = use('App/Model/Goods')  // EDIT
const Antl = use('Antl')

var moment = require('moment')
class PosHomeController{

    * show (request, response){
        const inventory = yield Inventory.query().where('active',1).fetch()
        // Lấy doanh thu tất cả kho
        const date_range = yield Option.query().where("code","DATE_RANGE_CHART").first()
        const end_date = moment().format('DD/MM/YYYY')
        const start_date = moment().subtract((date_range.value - 1), 'days').format('DD/MM/YYYY')

        var m1 = []
        var m2 =[]
        var m3 =[]
        const data1 = yield PosCash.query()
       .innerJoin('pos_general', 'pos_general.id', 'pos_cash.general_id')
       .whereIn('pos_general.type',[7,8])
       .where('pos_general.active', 1).whereIn('pos_general.status',[1,2])
       .whereBetween('pos_general.date_voucher',[moment(start_date , "DD/MM/YYYY").format('YYYY-MM-DD'),moment(end_date , "DD/MM/YYYY").format('YYYY-MM-DD') ])
       .groupByRaw('pos_general.date_voucher,pos_general.type').select('pos_general.date_voucher as date','pos_general.type').sum('pos_cash.total_amount as amount')

         for(var d of data1){
           if(d.type == 7){
             m1.push({date : moment(d.date).add(1, 'days').format('YYYY-MM-DD'),
                          value : d.amount
             })
           }else{
             m2.push({date : moment(d.date).add(1, 'days').format('YYYY-MM-DD'),
                          value : d.amount
             })
           }
         }

         const data2 = yield Goods.query()
        .where('active', 1)
        .whereBetween('date_voucher',[moment(start_date , "DD/MM/YYYY").format('YYYY-MM-DD'),moment(end_date , "DD/MM/YYYY").format('YYYY-MM-DD') ])
        .groupBy('date_voucher').select('date_voucher as date').sum('total_amount as amount')

        for(var d of data2){
            m3.push({date : moment(d.date).add(1, 'days').format('YYYY-MM-DD'),
                         value : d.amount
            })

        }

        const index = yield response.view('pos.pages.index',{stock: inventory.toJSON() , m1 : m1 , m2 : m2, m3:m3,end_date :end_date,start_date:start_date})
        response.send(index)
    }


    * get (request, response){
      try {
       const data = JSON.parse(request.input('data'))

       var m1 = []
       var m2 =[]
       var m3 =[]
       const data1 = yield PosCash.query()
      .innerJoin('pos_general', 'pos_general.id', 'pos_cash.general_id')
      .whereIn('pos_general.type',[7,8])
      .TypeWhere('pos_general.inventory',data.inventory)
      .where('pos_general.active', 1).whereIn('pos_general.status',[1,2])
      .whereBetween('pos_general.date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
      .groupBy('pos_general.date_voucher').select('pos_general.date_voucher as date','pos_general.type as type').sum('pos_cash.total_amount as amount')

        for(var d of data1){
          if(d.type == 7){
            m1.push({date : moment(d.date).add(1, 'days').format('YYYY-MM-DD'),
                         value : d.amount
                    })
          }else{
            m2.push({date : moment(d.date).add(1, 'days').format('YYYY-MM-DD'),
                         value : d.amount
                    })
          }
        }

        const data2 = yield Goods.query()
       .where('active', 1)
       .TypeWhere('transport_station_send',data.inventory)
       .whereBetween('date_voucher',[moment(data.start_date , "DD/MM/YYYY").format('YYYY-MM-DD'),moment(data.end_date , "DD/MM/YYYY").format('YYYY-MM-DD') ])
       .groupBy('date_voucher').select('date_voucher as date').sum('total_amount as amount')

       for(var d of data2){
           m3.push({date : moment(d.date).add(1, 'days').format('YYYY-MM-DD'),
                        value : d.amount
           })

       }


     response.json({ status: true ,  m1 : m1, m2:m2 , m3:m3 })

     } catch (e) {
     response.json({ status: false , message: Antl.formatMessage('messages.no_data_found') +e.message})
     }
    }

     * login (request, response){
        const session = request.currentUser
        if(!session){
        const inventory = yield Inventory.query().where('active',1).fetch()
        const index = yield response.view('pos/pages/login',{ inventory: inventory.toJSON() })
        response.send(index)
        }else{
        response.redirect('index')
        }
    }

}
module.exports = PosHomeController
