import { Hono } from 'hono/tiny'
import validations from './validations'
import controllers from './controllers'
import auth from '../../utils/auth'

const router = new Hono({ strict: false })

router.get('/:movieId', validations.getRatings, auth.authorize, controllers.getRatings)

router.post('/', validations.postRating, auth.authorize, controllers.postRating)

router.patch('/:id', validations.patchRating, auth.authorize, controllers.patchRating)

router.delete('/:id', validations.deleteRating, auth.authorize, controllers.deleteRating)

export default router
