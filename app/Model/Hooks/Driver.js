'use strict'

const Driver = exports = module.exports = {}

Driver.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

Driver.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
