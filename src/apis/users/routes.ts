import { Hono } from 'hono/tiny'
import validations from './validations'
import controllers from './controllers'
import auth from '../../utils/auth'

const router = new Hono({ strict: false })

router.get('/', auth.authorize, controllers.getUser)

router.patch('/', validations.patchUser, auth.authorize, controllers.patchUser)

router.put('/photo', validations.putUserPhoto, auth.authorize, controllers.putUserPhoto)

router.put('/files', controllers.putTempFiles)

router.delete('/photo', auth.authorize, controllers.deleteUserPhoto)

export default router
