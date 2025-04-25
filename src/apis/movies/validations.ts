import { Next, Context } from 'hono';
import { validate } from 'super-easy-validator';

async function getMovies(c: Context, next: Next) {
  try {
    const query = c.req.query()
    const rules = {
      limit: 'optional|string|natural',
      page: 'optional|string|natural',
      search: 'optional|string',
    }
    const {errors} = validate(rules, query)
    if(errors) {
      return c.json({message: errors[0]}, 400)
    }

    return next()
  } catch (error) {
    console.log(error)
    return c.json({message: 'server error'}, 500)
  }
}

async function getMovie(c: Context, next: Next) {
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

async function postMovie(c: Context, next: Next) {
  try {
		const body = await c.req.json()
    const rules = {
			name: 'string|min:3',
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

async function patchMovie(c: Context, next: Next) {
  try {
		const param = c.req.param()
		const body = await c.req.json()
    const rules = {
      id: 'uuid',
      name: 'optional|string|min:3',
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

async function deleteMovie(c: Context, next: Next) {
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

async function putMovieCover(c: Context, next: Next) {
  try {
		const formData = await c.req.formData()
    const cover = formData.get('cover')
    if (!cover) {
      return c.json({message: 'cover is required'}, 400)
    }
    if (!(cover instanceof File)) {
      return c.json({message: 'cover must be a file'}, 400)
    }
    if(!cover.type.startsWith('image/')) {
      return c.json({message: 'cover must be an image file'}, 415)
    }
    c.set('cover', cover)
    return next()
  } catch (error) {
    console.log(error)
    return c.json({message: 'server error'}, 500)
  }
}

async function deleteMovieCover(c: Context, next: Next) {
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
  getMovies,
  getMovie,
  postMovie,
  patchMovie,
  deleteMovie,
  putMovieCover,
  deleteMovieCover
}

export default validations