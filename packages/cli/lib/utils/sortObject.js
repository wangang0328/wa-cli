/**
 * 对object进行排序
 */
/**
 * 对 object 排序
 * @param {Record<string, any>} obj
 * @param {string[]} keyOrder 排列的顺序
 * @param {boolean} dontSortByUnicode 是否根据字符排序
 * @returns
 */
const sortObject = (obj, keyOrder, dontSortByUnicode) => {
	if (!obj) return
	const res = {}

	if (keyOrder) {
		keyOrder.forEach((key) => {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				res[key] = obj[key]
				delete obj[key]
			}
		})
	}

	const keys = Object.keys(obj)

	!dontSortByUnicode && keys.sort()

	keys.forEach((key) => {
		res[key] = obj[key]
	})

	return res
}

module.exports = sortObject
