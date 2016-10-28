/* ─────────────────────╮
 │ truwrap panel writer │
 ╰──────────────────────┴────────────────────────────────────────────────────── */

import _ from 'lodash'

/**
 * Organise a block of delimited text into a panel
 * @param  {string} buffer_ Input plain text
 * @return {object} The columnify configuration.
 */
export default function (buffer_, delimiter_, width_) {
	let longIdx = 0
	let maxCols = 0
	const spacerCols = []
	const tableData = []

	_.forEach(_.split(buffer_.trim(), '\n'), (row, rowIdx) => {
		const columnData = {}

		_.forEach(_.split(row, delimiter_), (col, colIdx) => {
			if (col === ':space:') {
				spacerCols.push(colIdx)
				columnData[`spacer${colIdx}`] = ' '
			} else if (spacerCols.includes(colIdx)) {
				columnData[`spacer${colIdx}`] = ' '
			} else {
				columnData[`c${colIdx}`] = col
			}
			if (colIdx > maxCols) {
				maxCols = colIdx
				longIdx = rowIdx
			}
		})

		tableData.push(columnData)
	})

	const configuration = {}
	const max = _.max([Math.floor((width_ - (spacerCols.length * 16)) / (maxCols - spacerCols.length + 1)), 5]) - 1
	const min = _.max([Math.floor((width_ - (spacerCols.length * 4)) / (maxCols - spacerCols.length + 1)), 3]) - 1

	Object.keys(tableData[longIdx]).forEach(idx => {
		if (idx.includes('spacer')) {
			configuration[idx] = {
				maxWidth: 16,
				minWidth: 4
			}
		} else {
			configuration[idx] = {
				maxWidth: _.max([min, max]),
				minWidth: _.min([min, max])
			}
		}
	})

	// console.dir(tableData)
	// console.dir(configuration)

	return {
		content: tableData,
		configuration
	}
}
