'use strict'
const Hash = use('Hash')
const General = use('App/Model/PosGeneralPlan')  // EDIT
const Detail = use('App/Model/PosDetailPlan')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const HistoryAction = use('App/Classes/HistoryAction')
const Docso = use('App/Classes/docso')
const Menu = use('App/Model/Menu')
const Inventory = use('App/Model/Inventory')  // EDIT
const Company = use('App/Model/Company')  // EDIT
const Option = use('App/Model/Option')  // EDIT
const Closing = use('App/Model/Closing')  // EDIT
const PrintTemplate = use('App/Model/PrintTemplate')  // EDIT
const Database = use('Database')

var moment = require('moment')

class TransferIssuePlanGeneralController{
  constructor () {
      this.type = 3  // EDIT Receipt = 1 , Issue = 2 , Transfer = 3
      this.key = "transfer-issue-plan-general"  // EDIT
      this.menu = "pos_transfer_plan_inventory"
      this.print = 'PCK%'
    }
  * show (request, response){
      const title = Antl.formatMessage('transfer_issue_plan_general.title')  // EDIT
      const date_range = yield Option.query().where('code','DATE_RANGE_INVENTORY').first()
      const end_date = moment().format('DD/MM/YYYY')
      const start_date = moment().subtract((date_range.value - 1), 'days').format('DD/MM/YYYY')
      const inventory = yield request.session.get('inventory')
      const data = yield General.query().where('inventory', inventory)
      .where('type', this.type)
      .where('inventory', inventory)
      .leftJoin('transport', 'transport.id', 'pos_general_plan.transport')
      .innerJoin('inventory','inventory.id','pos_general_plan.inventory_receipt')
      .whereBetween('pos_general_plan.date_voucher',[moment().subtract((date_range.value - 1), 'days')
      .format('YYYY-MM-DD'),moment().format('YYYY-MM-DD') ]).select('pos_general_plan.*','inventory.name as inventory_receipt','transport.code as transport').fetch()
      const print = yield PrintTemplate.query().where('code', 'LIKE', this.print).fetch()
      const show = yield response.view('pos/pages/transfer_issue_plan_general', {key : this.key ,title: title , data: data.toJSON() , end_date : end_date , start_date : start_date , print : print.toJSON() })  // EDIT
      response.send(show)
  }
  * get (request, response){
    try {
        const data = JSON.parse(request.input('data'))
        const inventory = yield request.session.get('inventory')
        var arr = []
        if(data.active != "" && data.active != null){
          arr = yield General.query().where('pos_general_plan.inventory', inventory).where('pos_general_plan.type', this.type)
          .whereBetween('pos_general_plan.date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD') ,moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
          .leftJoin('transport', 'transport.id', 'pos_general_plan.transport')
          .innerJoin('inventory','inventory.id','pos_general_plan.inventory_receipt')
          .where('active',data.active)
          .select('pos_general_plan.*','inventory.name as inventory_receipt','transport.code as transport').fetch()
        }else{
          arr = yield General.query().where('pos_general_plan.inventory', inventory).where('pos_general_plan.type', this.type)
          .whereBetween('pos_general_plan.date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
          .leftJoin('transport', 'transport.id', 'pos_general_plan.transport')
          .innerJoin('inventory','inventory.id','pos_general_plan.inventory_receipt')
          .select('pos_general_plan.*','inventory.name as inventory_receipt','transport.code as transport').fetch()
      }
      if(arr){
          response.json({ status: true  , data : arr.toJSON() })
      }else{
          response.json({ status: false ,  message: Antl.formatMessage('messages.no_data') })
      }
    } catch (e) {
      response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message})
    }
  }

  * detail (request, response){
    try {
        const data = JSON.parse(request.input('data'))
        const arr = yield Detail.query().where("pos_detail_plan.general",data)
            .innerJoin('unit', 'unit.id', 'pos_detail_plan.unit')
            .innerJoin('goods', 'goods.id', 'pos_detail_plan.item_id')
            .select("pos_detail_plan.*","pos_detail_plan.id as detail","goods.date_voucher as date_voucher").orderBy('id', 'desc').fetch()
        if(arr){
            response.json({ status: true  , data : arr.toJSON() })
        }else{
            response.json({ status: false ,  message: Antl.formatMessage('messages.no_data') })
        }
      } catch (e) {
      response.json({ status: false , error : true,  message: Antl.formatMessage('messages.error') + ' '+e.message })
      }
  }
      * unwrite (request, response){
  try {
        const data = JSON.parse(request.input('data'))
        if(data){
        const action = 4
        const arr = yield General.find(data)
        const closing = yield Closing.query().where('date',moment(arr.date_voucher,"YYYY-MM-DD").format("MM/YYYY")).count('* as total')
        if(closing[0].total == 0){
        const detail = yield Detail.query().where('general',data).fetch()
        // Lưu lịch sử
        const menu = yield Menu.query().where('code',this.menu).first()
        let hs = new HistoryAction()
        var rs = hs.insertRecord(action,request.currentUser.id,menu.id,JSON.stringify(arr)+'@'+JSON.stringify(detail))
        yield rs.save()
        //
        arr.active = 0
        yield arr.save()
        //DETAIL
          for(let d of detail){
            d.active = 0
            yield d.save()
          }
        response.json({ status: true , message: Antl.formatMessage('messages.unrecored_success') })
      }else{
       response.json({ status: false , message: Antl.formatMessage('messages.locked_period') })
      }
      }else{
      response.json({ status: false  , message: Antl.formatMessage('messages.unrecored_fail')})
      }
    } catch (e) {
      response.json({ status: false , message: Antl.formatMessage('messages.unrecored_error')})
    }
  }
  * write (request, response){
    try {
          const data = JSON.parse(request.input('data'))
          if(data){
            const action = 4
            const arr = yield General.find(data)
            const closing = yield Closing.query().where('date',moment(arr.date_voucher,"YYYY-MM-DD").format("MM/YYYY")).count('* as total')
            if(closing[0].total == 0){
              const detail = yield Detail.query().where('general',data).fetch()
              // Lưu lịch sử
              const menu = yield Menu.query().where('code',this.menu).first()
              let hs = new HistoryAction()
              var rs = hs.insertRecord(action,request.currentUser.id,menu.id,JSON.stringify(arr)+'@'+JSON.stringify(detail))
              yield rs.save()
              //
              arr.active = 1
              yield arr.save()
              // DELTAIL
                for(let d of detail){
                  d.active = 1
                  yield d.save()
                }
              response.json({ status: true , message: Antl.formatMessage('messages.recored_success') })
            }else{
             response.json({ status: false , message: Antl.formatMessage('messages.locked_period') })
            }
          }else{
            response.json({ status: false  , message: Antl.formatMessage('messages.recored_fail')})
          }

    } catch (e) {
    response.json({ status: false , message: Antl.formatMessage('messages.recored_error')})
    }
  }
  * delete (request, response){
    try {
          const data = JSON.parse(request.input('data'))
          if(data){
            const action = 5
            const arr = yield General.find(data)
            const closing = yield Closing.query().where('date',moment(arr.date_voucher,"YYYY-MM-DD").format("MM/YYYY")).count('* as total')
            if(closing[0].total == 0){
            const detail = yield Detail.query().where('general',data).fetch()
            // Lưu lịch sử
            const menu = yield Menu.query().where('code',this.menu).first()
            let hs = new HistoryAction()
            var rs = hs.insertRecord(action,request.currentUser.id,menu.id,JSON.stringify(arr)+'@'+JSON.stringify(detail))
            yield rs.save()
            //
            yield arr.delete()
            // DETAIL
              for(let d of detail){
                yield d.delete()
              }

            response.json({ status: true , message: Antl.formatMessage('messages.delete_success') })
          }else{
           response.json({ status: false , message: Antl.formatMessage('messages.locked_period') })
          }
          }else{
            response.json({ status: false ,message: Antl.formatMessage('messages.delete_fail')  })
          }
    } catch (e) {
      response.json({ status: false , message: Antl.formatMessage('messages.delete_error')})
    }
  }
  * prints (request, response){
    try {
    const data = JSON.parse(request.input('data'))
    const print = yield PrintTemplate.query().where('id', data.voucher ).first()
      const general = yield General.find(data.id)
      const detail = yield Detail.query().where("pos_detail_plan.general",data.id).orderBy('id', 'desc').fetch()
      const stock = yield request.session.get('inventory')
      const inventory = yield Inventory.query().where('id',stock).first()
      const inventory_receipt = yield Inventory.query().where('id',general.inventory_receipt).first()
      const company = yield Company.query().where('id',inventory.company).first()
      const signer = yield Option.query().where('code','SIGNER').first()
      let hs = new Docso()
      var reps = {
          "{company}": company.name,
          "{company_address}": company.address,
          "{day}": moment(general.date_voucher , "YYYY-MM-DD").format('DD'),
          "{month}": moment(general.date_voucher , "YYYY-MM-DD").format('MM'),
          "{year}": moment(general.date_voucher , "YYYY-MM-DD").format('YYYY'),
          "{warehouse_receipt}" : inventory_receipt.name,
          "{warehouse_receipt_place}" : inventory_receipt.address,
          "{voucher}" : general.voucher,
          "{number}" : general.total_number,
          "{amount}" : general.total_amount,
          "{amount_letter}" : hs.docso.doc(general.total_amount) +" đồng",
          "{warehouse}" : inventory.name,
          "{warehouse_place}" : inventory.address,
          "{chief_accountant}" : signer.value1,
          "{storekeeper}" : signer.value3,
          "{writer}" : signer.value4,
          "{day_voucher}" : moment().format('DD'),
          "{month_voucher}" : moment().format('MM'),
          "{year_voucher}" : moment().format('YYYY'),
        };
        var template = print.text
        for (var val in reps) {
          template = template.split(val).join(reps[val]);
        }
      var detail_content = ''
      var l = 1
          for(let d of detail){
            detail_content += "<tr style = 'height:25%;'><td style = 'width:6.22837%;text-align:center;vertical-align:top;border-width:1px;border-style:solid;border-color:#595959;'>" + l + "</td >";
            detail_content += "<td style = 'width:30.6805%;text-align:center;vertical-align:top;border-width:1px;border-style:solid;border-color:#595959;' ><span style = 'text-align:center;background-color:#ffffff;'>" + d.name + "</span></td>";
            detail_content += "<td style = 'width:7.7278%;text-align:center;vertical-align:top;border-width:1px;border-style:solid;border-color:#595959;' ><span style = 'text-align:center;background-color:#ffffff;'>" + d.code + "</span></td>";
            detail_content += "<td style = 'width:8.41984%;text-align:center;vertical-align:top;border-width:1px;border-style:solid;border-color:#595959;' ><span style = 'text-align:center;background-color:#ffffff;'>" + d.unit + "</span></td>";
            detail_content += "<td style = 'width:10.6113%;text-align:center;vertical-align:top;border-width:1px;border-style:solid;border-color:#595959;' ><span style = 'text-align:center;background-color:#ffffff;'>" + Antl.formatNumber(d.quantity) + "</span></td>";
            detail_content += "<td style = 'width:8.65052%;text-align:center;vertical-align:top;border-width:1px;border-style:solid;border-color:#595959;' ><span style = 'text-align:center;background-color:#ffffff;'></span></td>";
            detail_content += "</tr>";
            l++
          }
          response.json({ status: true , print_content: template , detail_content : detail_content})

      } catch (e) {
    response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error') + ' '+e.message})
      }
  }

}
module.exports = TransferIssuePlanGeneralController
