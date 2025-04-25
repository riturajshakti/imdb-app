import { Context } from 'hono'
import helpers from '../../utils/helpers'
import constants from '../../utils/constants'

async function getMovies(c: Context) {
	try {
		interface Payload {
			limit?: string | number
			page?: string | number
			search?: string
		}

		let { limit = '10', page = '1', search = '' } = c.req.query() as Payload
		limit = +limit
		page = +page
		const skip = (page - 1) * limit

		const stmt = await (constants.env.DB as D1Database)
			.prepare(`SELECT * FROM movies WHERE name LIKE ? ORDER BY createdAt DESC LIMIT ? OFFSET ?`)
			.bind(`%${search}%`, limit, skip)
			.all()
		const movies = stmt.results || []

		const countStmt = await (constants.env.DB as D1Database)
			.prepare(`SELECT COUNT(*) as count FROM movies WHERE name LIKE ?`)
			.bind(`%${search}%`)
			.first<{ count: number }>()
		const count = countStmt?.count || 0

		return c.json({ movies, count })
	} catch (error) {
		console.error(error)
		return c.json({ message: 'server error' }, 500)
	}
}

async function getMovie(c: Context) {
	try {
		const { id } = c.req.param() as {id: string}

		const stmt = await (constants.env.DB as D1Database)
			.prepare(`SELECT * FROM movies WHERE id = ?`)
			.bind(id)
			.all()
		const movie = (stmt.results || [])[0]

		if(!movie) {
			return c.json({message: 'movie not found'}, 404)
		}

		return c.json({ movie })
	} catch (error) {
		console.error(error)
		return c.json({ message: 'server error' }, 500)
	}
}

async function postMovie(c: Context) {
	try {
		const user = c.get('user') as User
		const { name } = c.get('body') as {name: string}
		const id = helpers.uuid()
		const createdAt = new Date().getTime()
		await (constants.env.DB as D1Database)
			.prepare('insert into movies(id, name, user, rating, createdAt) values(?, ?, ?, ?, ?)')
			.bind(id, name, user.id, 0, createdAt)
			.run()
		const movie = { id, name, user: user.id, createdAt }
		return c.json({ movie }, 201)
	} catch (error) {
		console.log(error)
		return c.json({ message: 'server error' }, 500)
	}
}

async function patchMovie(c: Context) {
	try {
		const {id} = c.req.param()
		const user = c.get('user') as User
		const { name } = c.get('body') as {name?: string}

		const stmt = await (constants.env.DB as D1Database)
			.prepare(`SELECT * FROM movies WHERE id = ?`)
			.bind(id)
			.all()
		const movie = (stmt.results || [])[0]

		if(!movie) {
			return c.json({message: 'movie not found'}, 404)
		}

		if(movie.user !== user.id) {
			return c.json({message: 'permission denied'}, 403)
		}

		await (constants.env.DB as D1Database)
			.prepare('update movies set name = ? where id = ?')
			.bind(name, id)
			.run()
		return c.json({ message: 'movie updated successfully' })
	} catch (error) {
		console.log(error)
		return c.json({ message: 'server error' }, 500)
	}
}

async function deleteMovie(c: Context) {
	try {
		const {id} = c.req.param()
		const user = c.get('user') as User

		const stmt = await (constants.env.DB as D1Database)
			.prepare(`SELECT * FROM movies WHERE id = ?`)
			.bind(id)
			.all()
		const movie = (stmt.results || [])[0]

		if(!movie) {
			return c.json({message: 'movie not found'}, 404)
		}

		if(movie.user !== user.id) {
			return c.json({message: 'permission denied'}, 403)
		}

		await (constants.env.DB as D1Database)
			.prepare('delete from movies where id = ?')
			.bind(id)
			.run()
		await (constants.env.DB as D1Database)
			.prepare('delete from ratings where movie = ?')
			.bind(id)
			.run()
		return c.json({ message: 'movie deleted successfully' })
	} catch (error) {
		console.log(error)
		return c.json({ message: 'server error' }, 500)
	}
}

async function putMovieCover(c: Context) {
	try {
		const {id} = c.req.param()
		const user = c.get('user') as User
		const cover = c.get('cover') as File

		const stmt = await (constants.env.DB as D1Database)
			.prepare(`SELECT * FROM movies WHERE id = ?`)
			.bind(id)
			.all()
		const movie = (stmt.results || [])[0]

		if(!movie) {
			return c.json({message: 'movie not found'}, 404)
		}

		if(movie.user !== user.id) {
			return c.json({message: 'permission denied'}, 403)
		}

		if(movie.cover) {
			await helpers.deleteFileR2(movie.cover as string, c)
		}

		const url = await helpers.uploadFileR2('movies/' + movie.id, cover, c)

		await (constants.env.DB as D1Database).prepare('update movies set cover=? where id=?').bind(url, movie.id).run()

		return c.json({ cover: url }, 201)
	} catch (error) {
		console.log(error)
		return c.json({ message: 'server error' }, 500)
	}
}

async function deleteMovieCover(c: Context) {
	try {
		const {id} = c.req.param()
		const user = c.get('user') as User

		const stmt = await (constants.env.DB as D1Database)
			.prepare(`SELECT * FROM movies WHERE id = ?`)
			.bind(id)
			.all()
		const movie = (stmt.results || [])[0]

		if(!movie) {
			return c.json({message: 'movie not found'}, 404)
		}

		if(movie.user !== user.id) {
			return c.json({message: 'permission denied'}, 403)
		}

		if (movie.cover) {
			await helpers.deleteFileR2(movie.cover as string, c)
			await (constants.env.DB as D1Database).prepare('update movies set cover=? where id=?').bind(null, movie.id).run()
		}

		return c.json({ message: 'cover deleted successfully' })
	} catch (error) {
		console.log(error)
		return c.json({ message: 'server error' }, 500)
	}
}

const controllers = {
	getMovies,
	getMovie,
	postMovie,
	patchMovie,
	deleteMovie,
	putMovieCover,
	deleteMovieCover
}

export default controllers
