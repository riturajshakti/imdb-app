import { Context } from 'hono'
import constants from './constants';
import { sign, verify } from 'hono/jwt';

async function createJwt(payload: Record<string, any>) {
	const token = await sign(payload, constants.env.JWT_SECRET);
	return token;
}

async function verifyJwt(token: string) {
	try {
		const payload = await verify(token, constants.env.JWT_SECRET);
		return payload;
	} catch (error) {
		console.log(error)
		return null;
	}
}

function uuid() {
	const array = new Uint8Array(16);
  crypto.getRandomValues(array);

  array[6] = (array[6] & 0x0f) | 0x40
  array[8] = (array[8] & 0x3f) | 0x80

  return [...array].map((byte, i) => {
    return (byte.toString(16).padStart(2, '0') + (i === 3 || i === 5 || i === 7 || i === 9 ? '-' : ''))
  }).join('')
}

async function hash(message: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

async function uploadFileR2(path: string, file: File, c: Context) {
	path = `${path}/${file.name}`
	await (c.env.BUCKET as R2Bucket).put(path, file)
	return getR2Url(path)
}

function getR2Url(path: string) {
	return `https://pub-86d1a1fae9f34441842a5f70b9e7e7b0.r2.dev/${path}`
}

async function deleteFileR2(url: string, c: Context) {
	const initial = 'https://pub-86d1a1fae9f34441842a5f70b9e7e7b0.r2.dev/'
	const path = url.substring(initial.length)
	console.log(path)
	await (c.env.BUCKET as R2Bucket).delete(path)
}

const helpers = {
	createJwt,
	verifyJwt,
	uuid,
	hash,
	uploadFileR2,
	getR2Url,
	deleteFileR2
};

export default helpers;
