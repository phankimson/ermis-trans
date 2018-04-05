'use strict'

const Reasons = exports = module.exports = {}

Reasons.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

Reasons.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
