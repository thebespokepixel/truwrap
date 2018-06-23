/* ─────────────────────╮
 │ truwrap panel writer │
 ╰──────────────────────┴────────────────────────────────────────────────────── */

import _ from 'lodash'

/**
 * Organise a block of delimited text into a panel
 * @private
 * @param  {string} buffer_ Input plain text.
 * @param  {string} delimiter_ Field delimiter.
 * @param  {Number} width_ Panel width.
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

	const setSpacer = (spacerSize, min) =>
		_.max([
			Math.floor((width_ -
				(spacerCols.length * spacerSize)) /
				(maxCols - spacerCols.length + 1)
			),
			min
		]) - 1

	const configuration = {}
	const max = setSpacer(16, 5)
	const min = setSpacer(4, 3)

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
	return {
		content: tableData,
		configuration
	}
}
