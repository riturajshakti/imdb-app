import { Next, Context } from 'hono';
import { validate } from 'super-easy-validator';

async function getRatings(c: Context, next: Next) {
  try {
    const params = c.req.param()
    const query = c.req.query()
    const rules = {
      movieId: 'uuid',
      limit: 'optional|string|natural',
      page: 'optional|string|natural',
      rating: 'optional|string|enums:1,2,3,4,5',
    }
    const {errors} = validate(rules, {...query, ...params})
    if(errors) {
      return c.json({message: errors[0]}, 400)
    }

    return next()
  } catch (error) {
    console.log(error)
    return c.json({message: 'server error'}, 500)
  }
}

async function postRating(c: Context, next: Next) {
  try {
		const body = await c.req.json()
    const rules = {
			movie: 'uuid',
			review: 'string|min:1|max:100',
			rating: 'natural|max:5',
    }
    const {errors} = validate(rules, body)
    if(errors) {
      return c.json({message: errors[0]}, 400)
    }
		c.set('body', body)
    return next()
  } catch (error) {
    console.log(error)
    return c.json({message: 'server error'}, 500)
  }
}

async function patchRating(c: Context, next: Next) {
  try {
		const param = c.req.param()
		const body = await c.req.json()
    const rules = {
      id: 'uuid',
      review: 'optional|string|min:1|max:100',
			rating: 'optional|natural|max:5',
    }
    const {errors} = validate(rules, {...param, ...body})
    if(errors) {
      return c.json({message: errors[0]}, 400)
    }
		c.set('body', body)
    return next()
  } catch (error) {
    console.log(error)
    return c.json({message: 'server error'}, 500)
  }
}

async function deleteRating(c: Context, next: Next) {
  try {
		const param = c.req.param()
    const rules = {
      id: 'uuid'
    }
    const {errors} = validate(rules, param)
    if(errors) {
      return c.json({message: errors[0]}, 400)
    }
    return next()
  } catch (error) {
    console.log(error)
    return c.json({message: 'server error'}, 500)
  }
}

const validations = {
  getRatings,
  postRating,
  patchRating,
  deleteRating,
}

export default validations