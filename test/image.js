import {join, dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import test from 'ava'
import {truwrap, createImage} from '../index.js'

const image = createImage({
	name: 'test',
	file: join(dirname(fileURLToPath(import.meta.url)), '/media/test.png'),
	height: 1,
})

test('Testing image handling', t => {
	const tw = truwrap({
		mode: 'container',
	})

	tw.write(image.render({
		nobreak: false,
		align: 1,
	}))

	t.snapshot(tw.end())
})
