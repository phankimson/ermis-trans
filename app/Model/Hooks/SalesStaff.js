'use strict'

const SalesStaff = exports = module.exports = {}

SalesStaff.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

SalesStaff.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
