export const jwtConstants = {
  secret: 'GjezuGePnntW',
};

export const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://escalaterapia.com',
    'https://www.escalaterapia.com',
    '*',
  ],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true,
  allowedHeaders: ['Authorization','Content-Type'],
};