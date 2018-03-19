'use strict'

const TypeService = exports = module.exports = {}

TypeService.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

TypeService.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
