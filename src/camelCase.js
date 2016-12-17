/**
 * Created by Yun on 2016-12-10.
 */

export function concat(prefix, ...others) {
  return prefix + others.map(v=>v[0].toUpperCase()+v.substr(1)).join('');
}