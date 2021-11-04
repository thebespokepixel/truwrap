/* ───────────────╮
 │ truwrap colour │ Colour handling, here for optimisation
 ╰────────────────┴──────────────────────────────────────────────────────────── */

import _ from 'lodash'
import {simple, palette} from 'trucolor'
import {TemplateTag, replaceSubstitutionTransformer} from 'common-tags'

export const clr = _.merge(
	simple({format: 'sgr'}),
	palette({format: 'sgr'},
		{
			title: 'bold #9994D1',
			bright: 'bold rgb(255,255,255)',
			dark: '#333',
		}),
)

export const colorReplacer = new TemplateTag(
	replaceSubstitutionTransformer(
		/([a-zA-Z]+?)[:/|](.+)/,
		(match, colorName, content) => `${clr[colorName]}${content}${clr[colorName].out}`,
	),
)
