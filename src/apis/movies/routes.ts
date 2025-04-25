import { Hono } from 'hono/tiny'
import validations from './validations'
import controllers from './controllers'
import auth from '../../utils/auth'

const router = new Hono({ strict: false })

router.get('/', validations.getMovies, auth.authorize, controllers.getMovies)

router.get('/:id', validations.getMovie, auth.authorize, controllers.getMovie)

router.post('/', validations.postMovie, auth.authorize, controllers.postMovie)

router.patch('/:id', validations.patchMovie, auth.authorize, controllers.patchMovie)

router.delete('/:id', validations.deleteMovie, auth.authorize, controllers.deleteMovie)

router.put('/:id/cover', validations.putMovieCover, auth.authorize, controllers.putMovieCover)

router.delete('/:id/cover', validations.deleteMovieCover, auth.authorize, controllers.deleteMovieCover)

export default router
