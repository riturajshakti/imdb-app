import { Next, Context } from 'hono';
import { validate } from 'super-easy-validator';

async function patchUser(c: Context, next: Next) {
  try {
		const body = await c.req.json()
    const rules = {
      email: 'optional|email',
      oldPassword: 'optional|string|min:3|max:15',
      password: 'optional|string|min:3|max:15'
    }
    const {errors} = validate(rules, {...body})
    if(errors) {
      return c.json({message: errors[0]}, 400)
    }
    if(body.password && !body.oldPassword) {
      return c.json({message: 'oldPassword is required'}, 400)
    }
		c.set('body', body)
    return next()
  } catch (error) {
    console.log(error)
    return c.json({message: 'server error'}, 500)
  }
}

async function putUserPhoto(c: Context, next: Next) {
  try {
		const formData = await c.req.formData()
    const photo = formData.get('photo')
    if (!photo) {
      return c.json({message: 'photo is required'}, 400)
    }
    if (!(photo instanceof File)) {
      return c.json({message: 'photo must be a file'}, 400)
    }
    c.set('photo', photo)
    return next()
  } catch (error) {
    console.log(error)
    return c.json({message: 'server error'}, 500)
  }
}

const validations = {
  patchUser,
  putUserPhoto
}

export default validations