/**
 * 对object进行排序
 */

const sortObject = (obj, keyOrder, dontSortByUnicode) => {
  if (!obj) return;
  const res = {};

  if (keyOrder) {
    keyOrder.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        res[key] = obj[key];
        delete obj[key];
      }
    });
  }

  const keys = Object.keys(obj);
  !dontSortByUnicode && keys.sort();
  keys.forEach((key) => {
    res[key] = obj[key];
  });

  return res;
};

module.exports = sortObject;
