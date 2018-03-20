'use strict'
const Antl = use('Antl')
const Helpers = use('Helpers')
const Menu = use('App/Model/Menu')
const Inventory = use('App/Model/Inventory')  // EDIT
const Goods = use('App/Model/Goods')  // EDIT
const Company = use('App/Model/Company')  // EDIT
const Option = use('App/Model/Option')  // EDIT
const Closing = use('App/Model/Closing')  // EDIT
const PrintTemplate = use('App/Model/PrintTemplate')  // EDIT
const Voucher = use('App/Model/NumberIncreases')  // EDIT
const General = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const GeneralPlan = use('App/Model/PosGeneralPlan')  // EDIT
const DetailPlan = use('App/Model/PosDetailPlan')  // EDIT
const Driver = use('App/Model/Driver')  // EDIT
const Suplier = use('App/Model/Suplier')  // EDIT
const Transport = use('App/Model/Transport')  // EDIT
const VoucherMask = use('App/Classes/VoucherMask')  // EDIT
const HistoryAction = use('App/Classes/HistoryAction')  // EDIT
const HistoryGoods = use('App/Classes/HistoryGoods')  // EDIT
const Surcharge = use('App/Model/Surcharge')  // EDIT
const Database = use('Database')
var moment = require('moment')

class TransferIssueInventoryVoucherController{
  constructor () {
      this.type = 3  // EDIT Receipt = 1 , Issue = 2 , Transfer = 3
      this.key = "transfer-issue-inventory-voucher"  // EDIT
      this.menu = "pos_transfer_issue_inventory_voucher"
      this.voucher = 'INVENTORY_TRANSFER_ISSUE_%'
      this.print = 'PCK%'
    }

    * show (request, response){
        const title = Antl.formatMessage('transfer_issue_inventory_voucher.title')  // EDIT
        const inventory = yield request.session.get('inventory')
        const voucher = yield Voucher.query().where('inventory',inventory).where('code','LIKE',this.voucher).first()
        const stock = yield Inventory.query().whereNot('id',inventory).where('active',1).fetch()
        const driver = yield Driver.query().where('active',1).fetch()
        const transport = yield Transport.query().where('active',1).fetch()
        const surcharge = yield Surcharge.query().where('type',2).where('active',1).fetch()
        const item  = yield Goods.query().where('active',1)
        .where("transport_station_send",inventory)
        .select("id as item_id","goods.*").fetch()
        const print = yield PrintTemplate.query().where('code', 'LIKE', this.print).fetch()
        const show = yield response.view('pos/pages/transfer_issue_inventory_voucher', {key : this.key ,title: title ,surcharge : surcharge.toJSON(),driver : driver.toJSON() , transport : transport.toJSON(), voucher : voucher, item : item.toJSON() , print : print.toJSON() , stock : stock.toJSON()})  // EDIT
        response.send(show)
    }
    * reference (request, response){
      try {
      const data = JSON.parse(request.input('data'))
      const inventory = yield request.session.get('inventory')
      const arr  = yield GeneralPlan.query().where('pos_general_plan.type', this.type).whereNot('pos_general_plan.status',3).where('pos_general_plan.inventory',inventory)
      .innerJoin('transport','transport.id','pos_general_plan.transport')
      .where('reference_by',0)
      .whereBetween('pos_general_plan.date_voucher',[moment(data.start , "DD/MM/YYYY").format('YYYY-MM-DD'),moment(data.end , "DD/MM/YYYY").format('YYYY-MM-DD') ])
      .select('pos_general_plan.*','transport.name as transport')
      .fetch()
      if(arr){
          response.json({ status: true  , data : arr.toJSON() })
      }else{
          response.json({ status: false  ,  message: Antl.formatMessage('messages.no_data')})
      }
      } catch (e) {
        response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message})
      }
    }

    * load (request, response){
      try {
      const data = JSON.parse(request.input('data'))
      const inventory = yield request.session.get('inventory')
      var arr  = []
      if(!data.filter_field){
        arr  = yield Goods.query().where('active',1)
        .where("inventory",inventory)
        .where("transport_station_receive",data.inventory_receipt)
        .select("id as item_id","goods.*").fetch()
      }else{
        if(data.filter_field == 'date_voucher'){
          arr  = yield Goods.query().where('active',1)
          .where("inventory",inventory)
          .where("transport_station_receive",data.inventory_receipt)
          .where(data.filter_field,moment(data.filter_value,"DD/MM/YYYY").format("YYYY-MM-DD"))
          .select("id as item_id","goods.*").fetch()
        }else{
          arr  = yield Goods.query().where('active',1)
          .where("inventory",inventory)
          .where("transport_station_receive",data.inventory_receipt)
          .where(data.filter_field,"LIKE",'%'+data.filter_value+'%')
          .select("id as item_id","goods.*").fetch()
        }

      }
      if(arr){
          response.json({ status: true  , data : arr.toJSON() })
      }else{
          response.json({ status: false,  message: Antl.formatMessage('messages.no_data')  })
      }
      } catch (e) {
        response.json({ status: false , error : true,  message: Antl.formatMessage('messages.error') + ' '+e.message })
      }
    }

    * scan (request, response){
      const data = JSON.parse(request.input('data'))
      const inventory = yield request.session.get('inventory')
      var arr = null
      try{
        if(data.id){
          arr = yield Detail.query()
          .where('general',data.id)
          .where('code',data.value)
          .first()
        }
        if(arr == null){
          arr = yield Goods.query().where('code',data.value)
          .where("inventory",inventory)
          .where("transport_station_receive",data.inventory_receipt)
          .select("id as item_id","goods.*").first()
        }
        if(arr){
            response.json({ status: true  , data : arr })
        }else{
            response.json({ status: false , message: Antl.formatMessage('messages.barcode_not_found')  })
        }
      } catch (e) {
        response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message})
      }
    }
    * save (request, response){
       try {
            const data = JSON.parse(request.input('data'))
            if(data){
              const closing = yield Closing.query().where('date',moment(data.date_voucher,"YYYY-MM-DD").format("MM/YYYY")).count('* as total')
              if(closing[0].total == 0){
                var general = []
                var status = 1
                var action = 0
                var removeId = []
                const inventory = yield request.session.get('inventory')
                const permission = JSON.parse(yield request.session.get('permission'))
                const user = yield request.auth.getUser()
                if(data.id){
                  general = yield General.find(data.id)
                  var v = general.voucher
                  action = 4
                }else{
                  action = 2
                  general = new General()
                  // Lưu số nhảy
                  const voucher = yield Voucher.query().where('inventory',inventory).where('code','LIKE',this.voucher).first()

                  // Load Phiếu tự động
                    let vm = new VoucherMask()
                    var v = vm.Convert(voucher)
                  const number = voucher.value + 1
                  const length_number = voucher.length_number
                  if((number+"").length > voucher.length_number){
                    voucher.value = 1
                    voucher.length_number = length_number + 1
                  }else{
                    voucher.value = number
                  }
                  yield voucher.save()
                  general.user = user.id
                 }
                 if(permission.p){
                   status = 1
                 }
                 //Lấy giá trị subject
                 const trs = yield Transport.findBy('id',data.transport)
                 if(trs.suplier){
                   general.subject = trs.subject
                   general.subject_key = 'suplier'
                 }
                  general.inventory = inventory
                  general.type = this.type
                  general.voucher = v
                  general.driver = data.driver
                  general.transport = data.transport
                  general.description = data.description
                  general.date_voucher = data.date_voucher
                  general.traders = data.traders
                  general.inventory_receipt = data.inventory_receipt
                  general.inventory_issue = inventory
                  general.total_number = data.total_number
                  general.total_amount = (data.rental_fees + data.hire_surcharge)?(parseInt(data.rental_fees) + parseInt(data.hire_surcharge)):0
                  general.rental_fees = data.rental_fees ? data.rental_fees : 0
                  general.hire_surcharge = data.hire_surcharge  ? data.hire_surcharge : 0
                  general.reference = data.reference
                  general.status = status
                  general.active = 1
                  yield general.save()
                  for(var d of data.detail){
                    var detail = []
                    if(d.detail){
                      detail = yield Detail.find(d.detail)
                    }else{
                      detail = new Detail()
                    }
                    const goods = yield Goods.find(d.item_id)
                    goods.inventory = 0
                    goods.status = 2
                    yield goods.save()

                    // Lưu lịch sử hàng gửi
                    let hg = new HistoryGoods()
                    var rg = hg.insertRecord(goods.id,0,2)
                    yield rg.save()
                    //

                    detail.general = general.id
                    detail.item_id = d.item_id
                    detail.name = d.name
                    detail.unit = 1
                    detail.code = d.code
                    detail.quantity = d.quantity
                    detail.lot_number = d.lot_number
                    detail.status = status
                    detail.active = 1
                    yield detail.save()
                    removeId.push(detail.id)
                  }
                  var remove = yield Detail.query().where("general",general.id).whereNotIn('id',removeId).fetch()
                  for(var r of remove.toJSON()){
                    const r_detail = yield Detail.find(r.id)

                    const goods = yield Goods.find(r_detail.item_id)
                    goods.inventory = goods.transport_station_send
                    yield goods.save()

                    yield r_detail.delete()
                  }
                  //Lưu vào bảng kế hoạch
                  const general_p = yield GeneralPlan.find(data.reference_id)
                  if(general_p){
                    general_p.reference_by  = general.id
                    yield general_p.save()
                  }
                  // Lưu lịch sử
                  const menu = yield Menu.query().where('code',this.menu).first()
                  let hs = new HistoryAction()
                  var rs = hs.insertRecord(action,request.currentUser.id,menu.id,JSON.stringify(general)+'@'+JSON.stringify(detail))
                  yield rs.save()
                  //
                  var detail_load = yield Detail.query().where("general",general.id)
                  .innerJoin('goods','goods.id','pos_detail.item_id')
                  .select("pos_detail.*","pos_detail.id as detail","goods.transport_station_receive","goods.date_voucher","goods.sender_fullname").orderBy('pos_detail.id', 'desc').fetch()
               response.json({ status: true  , message: Antl.formatMessage('messages.update_success') , voucher_name : v , dataId :  general.id , detail :  detail_load.toJSON()})
              }else{
               response.json({ status: false , message: Antl.formatMessage('messages.locked_period') })
              }
            }else{
            response.json({ status: false  , message: Antl.formatMessage('messages.update_fail')})
            }
        } catch (e) {
        response.json({ status: false , message: Antl.formatMessage('messages.update_error') + ' ' +e.message})
        }
    }
    * bind (request, response){
      try {
      const data = JSON.parse(request.input('data'))
        if(data){
          var general = yield General.find(data)
              general = yield General.query().where('pos_general.id',data).select('pos_general.*').first()
          var detail = yield Detail.query().where("general",general.id)
              .innerJoin('goods','goods.id','pos_detail.item_id')
              .select("pos_detail.*","pos_detail.id as detail","goods.transport_station_receive","goods.date_voucher","goods.sender_fullname").orderBy('pos_detail.id', 'desc').fetch()
        response.json({ status: true  , general : general , detail : detail.toJSON() })
        }else{
        response.json({ status: false  , message: Antl.formatMessage('messages.update_fail')})
        }
        } catch (e) {
        response.json({ status: false ,error:true,  message: Antl.formatMessage('messages.error') + ' '+e.message})
        }
    }

    * rbind (request, response){
      try {
      const data = JSON.parse(request.input('data'))
        if(data){
          var general = yield GeneralPlan.find(data)
              general = yield GeneralPlan.query().where('pos_general_plan.id',data).select('pos_general_plan.*').first()
          var detail = yield DetailPlan.query().where("general",general.id)
              .innerJoin('goods','goods.id','pos_detail_plan.item_id')
              .select("pos_detail_plan.*","pos_detail_plan.id as detail","goods.transport_station_receive","goods.date_voucher","goods.sender_fullname").orderBy('pos_detail_plan.id', 'desc').fetch()
        response.json({ status: true  , general : general , detail : detail.toJSON() })
        }else{
        response.json({ status: false  , message: Antl.formatMessage('messages.update_fail')})
        }
      } catch (e) {
        response.json({ status: false ,error :true,  message: Antl.formatMessage('messages.error') + ' '+e.message})
      }
    }
}
module.exports = TransferIssueInventoryVoucherController
