/**
 * Created by Yun on 2016-12-10.
 */

import {computed} from 'mobx';
import camelCase from "camelcase";

function defineComputedProperty(target, name, descriptor){
  Object.defineProperty(
    target,
    name,
    descriptor
  );
  computed(target, name, descriptor);
}

// Add by PizzaLiu on 2017-03-22 for reg array and msg array.
function validateFunc(reg, msg) {
  const errMsg = 'ValidationError';
  if (Array.isArray(reg)) {
    if (reg.length == 1) {
      reg = reg[0];
      msg = msg[0];
    } else {
      return function (value) {
        return (reg[0].test ? reg[0].test(value) : reg[0](value)) ? (validateFunc(reg.slice(1), msg.slice(1)))(value) : msg[0] || errMsg;
      };
    }
  }

  return reg.test
    ? (value=>reg.test(value)?undefined:(msg||errMsg))
    : reg;
}

export function getValidateError() {
  return this.constructor.__validateFields.find(key =>this[key]);
}

export function getIsValid() {
  return !this.validateError;
}

export default function validate(reg, msg){
  const test = validateFunc(reg, msg);

  return function (target, name, args){
    const validateName = camelCase('validateError', name);
    const descriptor = {
      configurable: true,
      enumerable: false,
      get: function getter() {
        return test(this[name], this);
      }
    };

    defineComputedProperty(target, validateName, descriptor);

    const clazz = target.constructor;

    if (clazz.hasOwnProperty('__validateFields')){
      clazz.__validateFields.push(validateName);
    } else {
      Object.defineProperty(clazz, '__validateFields', {
        configurable: true,
        enumerable: false,
        value: [validateName],
      })
    }

    if (!target.hasOwnProperty('validateError')) {
      defineComputedProperty(target, 'validateError', {
        configurable: true,
        enumerable: false,
        get: getValidateError,
      })
    }
    if (!target.hasOwnProperty('isValid')) {
      defineComputedProperty(target, 'isValid', {
        configurable: true,
        enumerable: false,
        get: getIsValid,
      })
    }
  }
}
