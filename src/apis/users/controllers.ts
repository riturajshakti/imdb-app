import { Context } from 'hono'
import helpers from '../../utils/helpers'
import constants from '../../utils/constants'

async function getUser(c: Context) {
	try {
		let user = c.get('user')
		delete user.password
		return c.json({ user })
	} catch (error) {
		console.error(error)
		return c.json({ message: 'server error' }, 500)
	}
}

async function patchUser(c: Context) {
	try {
		interface Payload {
			email?: string
			oldPassword?: string
			password?: string
		}

		const user = c.get('user')
		const { email, oldPassword, password } = c.get('body') as Payload
		console.log(user)

		const queries = []
		let entries = []
		if (email && email !== user.email) {
			const data = await (constants.env.DB as D1Database)
				.prepare(`SELECT * FROM users WHERE email = ?`)
				.bind(email)
				.run()
			if (data.results.length) {
				return c.json({ message: 'email already exist' }, 409)
			}
			queries.push('email = ?')
			entries.push(email)
		}

		let token
		if (password && oldPassword) {
			let hash = await helpers.hash(oldPassword)
			if (user.password !== hash) {
				return c.json({ message: 'authorization failed' }, 401)
			}
			hash = await helpers.hash(password!)
			queries.push('password = ?')
			entries.push(hash)
			const tokenData = {
				id: user.id,
				hash: hash.slice(-10)
			}
			token = await helpers.createJwt(tokenData)
		}

		if (queries.length) {
			await (constants.env.DB as D1Database)
				.prepare(`update users set ${queries.join(', ')} where id = ?`)
				.bind(...entries, user.id)
				.run()
		}
		return c.json({ message: 'user updated successfully', token })
	} catch (error) {
		console.log(error)
		return c.json({ message: 'server error' }, 500)
	}
}

async function putUserPhoto(c: Context) {
	try {
		const user = c.get('user') as User
		const photo = c.get('photo') as File
		const url = await helpers.uploadFileR2('users/' + user.id, photo, c)

		if (user.photo) {
			await helpers.deleteFileR2(user.photo, c)
		}

		await (constants.env.DB as D1Database).prepare('update users set photo=? where id=?').bind(url, user.id).run()

		return c.json({ photo: url }, 201)
	} catch (error) {
		console.log(error)
		return c.json({ message: 'server error' }, 500)
	}
}

async function putTempFiles(c: Context) {
	function getFileMeta(file: File) {
		return {
			name: file.name,
			lastModified: file.lastModified,
			size: file.size,
			type: file.type
		}
	}
	try {
		const fd = await c.req.formData()

		const name = fd.get('name')
		const age = fd.get('age')

		let image = fd.get('image') as any
		if (image) {
			image = getFileMeta(image)
		}

		let songs = (fd.getAll('songs') ?? []) as any
		songs = songs.map((e: File) => getFileMeta(e))

		const data = { name, age, image, songs }
		return c.json({ data }, 201)
	} catch (error) {
		console.log(error)
		return c.json({ message: 'server error' }, 500)
	}
}

async function deleteUserPhoto(c: Context) {
	try {
		const user = c.get('user') as User

		if (user.photo) {
			await helpers.deleteFileR2(user.photo, c)
		}

		await (constants.env.DB as D1Database).prepare('update users set photo=? where id=?').bind(null, user.id).run()

		return c.json({ message: 'photo deleted successfully' })
	} catch (error) {
		console.log(error)
		return c.json({ message: 'server error' }, 500)
	}
}

const controllers = {
	getUser,
	patchUser,
	putUserPhoto,
	deleteUserPhoto,
	putTempFiles
}

export default controllers
