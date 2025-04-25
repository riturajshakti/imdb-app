import {Hono} from 'hono/tiny'
import validations from './validations'
import controllers from './controllers'

const router = new Hono({strict: false})

router.post('/login', validations.postLogin, controllers.postLogin)

router.post('/register', validations.postRegister, controllers.postRegister)

export default router
