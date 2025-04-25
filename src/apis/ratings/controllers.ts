import { Context } from 'hono'
import helpers from '../../utils/helpers'
import constants from '../../utils/constants'

async function getRatings(c: Context) {
	try {
		interface Payload {
			limit?: string | number
			page?: string | number
			rating?: '1' | '2' | '3' | '4' | '5'
		}

		let { limit = '10', page = '1', rating } = c.req.query() as Payload
		limit = +limit
		page = +page
		const skip = (page - 1) * limit
		const movieId = c.req.param('movieId')

		let stmt = await (constants.env.DB as D1Database)
			.prepare(`SELECT * FROM movies WHERE id = ?`)
			.bind(movieId)
			.all()
		const movie = (stmt.results || [])[0]

		if(!movie) {
			return c.json({message: 'movie not found'}, 404)
		}

		let list = [movie.id, limit, skip]
		if(rating) {
			list.splice(1, 0, rating)
		}
		stmt = await (constants.env.DB as D1Database)
			.prepare(`SELECT * FROM ratings WHERE movie = ? ${rating ? 'and rating = ?' : ''} ORDER BY createdAt DESC LIMIT ? OFFSET ?`)
			.bind(...list)
			.all()
		const ratings = stmt.results || []

		list = [movie.id]
		if(rating) {
			list.push(rating)
		}
		const countStmt = await (constants.env.DB as D1Database)
			.prepare(`SELECT COUNT(*) as count FROM ratings WHERE movie = ? ${rating ? 'and rating = ?' : ''}`)
			.bind(...list)
			.first<{ count: number }>()
		const count = countStmt?.count || 0

		return c.json({ ratings, count })
	} catch (error) {
		console.error(error)
		return c.json({ message: 'server error' }, 500)
	}
}

async function postRating(c: Context) {
	try {
		interface Payload {
			movie: string
			review: string
			rating: 1 | 2 | 3 | 4 | 5
		}
		const user = c.get('user') as User
		const { movie: movieId, review, rating } = c.get('body') as Payload
		const id = helpers.uuid()
		const createdAt = new Date().getTime()

		let stmt = await (constants.env.DB as D1Database)
			.prepare(`SELECT * FROM movies WHERE id = ?`)
			.bind(movieId)
			.all()
		const movie = (stmt.results || [])[0]
		if(!movie) {
			return c.json({message: 'movie not found'}, 404)
		}

		stmt = await (constants.env.DB as D1Database)
			.prepare(`SELECT * FROM ratings WHERE movie = ? and user = ?`)
			.bind(movieId, user.id)
			.all()
		const ratingData = (stmt.results || [])[0]
		if(ratingData) {
			return c.json({message: 'a rating already exist'}, 409)
		}

		await (constants.env.DB as D1Database)
			.prepare('insert into ratings(id, movie, user, rating, review, createdAt) values(?, ?, ?, ?, ?, ?)')
			.bind(id, movie.id, user.id, rating, review, createdAt)
			.run()
		
		const avgStmt = await (constants.env.DB as D1Database)
			.prepare('SELECT AVG(rating) as average FROM ratings WHERE movie = ?')
			.bind(movie.id)
			.first<{ average: number }>()
		const average = avgStmt?.average || 0

		await (constants.env.DB as D1Database)
			.prepare('update movies set rating = ? where id = ?')
			.bind(average, movie.id)
			.run()

		const _rating = { id, movie: movie.id, user: user.id, rating, review, createdAt }
		return c.json({ rating: _rating, movieRating: average }, 201)
	} catch (error) {
		console.log(error)
		return c.json({ message: 'server error' }, 500)
	}
}

async function patchRating(c: Context) {
	try {
		interface Payload {
			review?: string
			rating?: 1 | 2 | 3 | 4 | 5
		}
		const id = c.req.param('id')
		const user = c.get('user') as User
		let { rating: ratingValue, review } = c.get('body') as Payload

		const stmt = await (constants.env.DB as D1Database)
			.prepare(`SELECT * FROM ratings WHERE id = ?`)
			.bind(id)
			.all()
		const rating = (stmt.results || [])[0]
		if(!rating) {
			return c.json({message: 'rating not found'}, 404)
		}
		if(rating.user !== user.id) {
			return c.json({message: 'permission denied'}, 403)
		}

		await (constants.env.DB as D1Database)
			.prepare('update ratings set rating = ?, review = ? where id = ?')
			.bind(ratingValue ?? rating.rating, review ?? rating.review, id)
			.run()
		
		const avgStmt = await (constants.env.DB as D1Database)
			.prepare('SELECT AVG(rating) as average FROM ratings WHERE movie = ?')
			.bind(rating.movie)
			.first<{ average: number }>()
		const average = avgStmt?.average || 0

		await (constants.env.DB as D1Database)
			.prepare('update movies set rating = ? where id = ?')
			.bind(average, rating.movie)
			.run()

		return c.json({ message: 'rating updated successfully', movieRating: average })
	} catch (error) {
		console.log(error)
		return c.json({ message: 'server error' }, 500)
	}
}

async function deleteRating(c: Context) {
	try {
		const id = c.req.param('id')
		const user = c.get('user') as User

		const stmt = await (constants.env.DB as D1Database)
			.prepare(`SELECT * FROM ratings WHERE id = ?`)
			.bind(id)
			.all()
		const rating = (stmt.results || [])[0]
		if(!rating) {
			return c.json({message: 'rating not found'}, 404)
		}
		if(rating.user !== user.id) {
			return c.json({message: 'permission denied'}, 403)
		}

		await (constants.env.DB as D1Database)
			.prepare('delete from ratings where id = ?')
			.bind(id)
			.run()

		const avgStmt = await (constants.env.DB as D1Database)
			.prepare('SELECT AVG(rating) as average FROM ratings WHERE movie = ?')
			.bind(rating.movie)
			.first<{ average: number }>()
		const average = avgStmt?.average || 0

		await (constants.env.DB as D1Database)
			.prepare('update movies set rating = ? where id = ?')
			.bind(average, rating.movie)
			.run()
		return c.json({ message: 'rating deleted successfully', movieRating: average })
	} catch (error) {
		console.log(error)
		return c.json({ message: 'server error' }, 500)
	}
}

const controllers = {
	getRatings,
	postRating,
	patchRating,
	deleteRating,
}

export default controllers
