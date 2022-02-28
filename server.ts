import Fastify from "fastify";
import fastifySession from '@fastify/session';
import fastifyCookie from 'fastify-cookie';
import ConnectPgSimple from 'connect-pg-simple';
import { getPool } from './config';

const fastify = Fastify({ logger: true});

const dbPool = getPool();
const PgSessionStore = ConnectPgSimple(fastifySession as any);

fastify.register(fastifyCookie);
fastify.register(fastifySession, {
    secret: 'sdfdfsdoiouiui^&*^&*^&7867867887',
    store: new PgSessionStore({
        tableName: 'session',
        schemaName: 'public',
        pool: dbPool
    }),
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24,
    }
});

fastify.post<{ Body: {
    username: string;
    password: string;
}}>('/api/login', async (req, rep) => {
    const { username, password } = req.body;
    const { rows: [user] } = await dbPool.query('select * from "user" where username = $1 and password = $2;', [username, password]);

    if (user.id !== null && user.id !== '') {
        req.session.userId = user.id;
        return rep.code(200).send({ message: 'Authentication successful!' });
    }
    return rep.code(403).send({ message: 'Invalid username or password' });
});

fastify.post('/api/logout', async (req, rep) => {
if (req.session.userId === undefined) return rep.code(403).send({ message: 'Unauthorized' });
    req.destroySession((err) => {
    if (err) return rep.code(400).send({ message: 'There was a problem logging out' });
    return rep.send({ message: 'Log out successful' });
    });
    }
  );

const port = Number(process.env.PORT) || 3000;

fastify.listen(port, (err, address) => {
  if (err) {
    fastify.log.error(String(err));
    process.exit(1);
  }
});

declare module 'fastify' {
    interface Session {
        userId: string;
    }
}