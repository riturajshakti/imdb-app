import { Next, Context } from 'hono'
import { validate } from 'super-easy-validator'

async function postLogin(c: Context, next: Next) {
	try {
		const body = await c.req.json()
		c.set('body', body)

		const rules = {
			email: 'email',
			password: 'string|min:3|max:15'
		}
		const { errors } = validate(rules, body)
		if (errors) {
			return c.json({ message: errors[0] }, 400)
		}

		return next()
	} catch (error) {
		console.log(error)
		return c.json({ message: 'server error' }, 500)
	}
}

async function postRegister(c: Context, next: Next) {
	try {
		const body = await c.req.json()
		c.set('body', body)

		const rules = {
			name: 'name',
			email: 'email',
			password: 'string|min:3|max:15',
			gender: 'string|enums:male,female'
		}
		const { errors } = validate(rules, body)
		if (errors) {
			return c.json({ message: errors[0] }, 400)
		}

		return next()
	} catch (error) {
		console.log(error)
		return c.json({ message: 'server error' }, 500)
	}
}

const validations = {
	postLogin,
	postRegister
}

export default validations
