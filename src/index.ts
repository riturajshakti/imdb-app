import { Hono } from 'hono/tiny'
import constants from './utils/constants'
import authRoutes from './apis/auth/routes'
import userRoutes from './apis/users/routes'
import movieRoutes from './apis/movies/routes'
import ratingRoutes from './apis/ratings/routes'
import { cors } from 'hono/cors'

const app = new Hono({ strict: false })
app.use(cors())

app.get('/api', (c) => c.json({ message: 'server running ⚡⚡⚡' }))

app.route('/api/auth', authRoutes)
app.route('/api/users', userRoutes)
app.route('/api/movies', movieRoutes)
app.route('/api/ratings', ratingRoutes)

app.notFound((c) => c.json({ message: 'route not found' }, 405))

app.onError((error, c) => {
	console.log(error)
	return c.json({ message: 'server error' }, 500)
})

// https://imdb-app.riturajshakti.workers.dev/api
export default {
	async fetch(request, env, ctx): Promise<Response> {
		constants.env = env
		return app.fetch(request, env, ctx)
	}
} satisfies ExportedHandler<Env>
