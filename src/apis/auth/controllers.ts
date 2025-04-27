import { Context } from 'hono'
import helpers from '../../utils/helpers'
import constants from '../../utils/constants'

async function postLogin(c: Context) {
	try {
		interface Payload {
			email: string
			password: string
		}
		const { email, password } = c.get('body') as Payload
		const hash = await helpers.hash(password)
		const user = await (constants.env.DB as D1Database)
			.prepare('select * from users where email = ? and password = ?')
			.bind(email, hash)
			.run()
    if(!user.results.length) {
      return c.json({message: 'user not found'}, 401)
    }
		const token = await helpers.createJwt({id: user.results[0].id})
		return c.json({ token })
	} catch (error) {
		console.log(error)
		return c.json({ message: 'server error' }, 500)
	}
}

async function postRegister(c: Context) {
	try {
		interface Payload {
			name: string
			email: string
			password: string
			gender: 'male' | 'female'
		}
		const { name, email, password, gender } = c.get('body') as Payload

		const _user = await (constants.env.DB as D1Database)
			.prepare('select * from users where email = ?')
			.bind(email)
			.run()
    if(_user.results.length) {
      return c.json({message: 'a user with this email already exists'}, 409)
    }

		const id = helpers.uuid()
		const hash = await helpers.hash(password)
		const createdAt = new Date().getTime()
		await (constants.env.DB as D1Database)
			.prepare('insert into users(id, name, email, password, gender, createdAt) values(?, ?, ?, ?, ?, ?)')
			.bind(id, name, email, hash, gender, createdAt)
			.run()
		const user = { id, name, email, gender, createdAt }
		return c.json({ user }, 201)
	} catch (error) {
		console.log(error)
		return c.json({ message: 'server error' }, 500)
	}
}

const controllers = {
	postLogin,
	postRegister
}

export default controllers
