interface User {
  id: string
  name: string
  email: string
  password: string
  photo?: string
  gender: 'male' | 'female'
  createdAt: number | Date
}

interface Movie {
  id: string
  name: string
  cover?: string
  user: string
  rating: number
  createdAt: number | Date
}

interface Rating {
  id: string
  movie: string
  user: string
  rating: number
  review: string
  createdAt: number | Date
}
