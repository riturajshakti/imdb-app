import { Context, Next } from 'hono';
import helpers from './helpers';
import constants from './constants';

async function authorize(c: Context, next: Next) {
  try {
    const authorization = c.req.header('authorization');
    if (!authorization) {
      return c.json({ message: 'authorization failed' }, 401);
    }
    if (!authorization.startsWith('Bearer ')) {
      return c.json({ message: 'authorization failed' }, 401);
    }
    const token = authorization.substring('Bearer '.length);
    const {id, hash} = await helpers.verifyJwt(token) as {id: string; hash: string}
    const user = await (constants.env.DB as D1Database)
			.prepare('select * from users where id = ?')
			.bind(id)
			.run()
    if(!user.results.length) {
      return c.json({message: 'user not found'}, 401)
    }
    if(!(user.results[0] as any as User).password.endsWith(hash)) {
      return c.json({message: 'authorization failed'}, 401)
    }
    c.set('user', user.results[0])
    return next()
  } catch (error) {
    console.log(error)
    return c.json({message: 'server error'}, {status: 500})
  }
}

const auth = {
  authorize
}

export default auth