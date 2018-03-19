'use strict'

const Surcharge = exports = module.exports = {}

Surcharge.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

Surcharge.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
