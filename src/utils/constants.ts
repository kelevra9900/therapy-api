export const jwtConstants = {
  secret: 'GjezuGePnntW',
};

export const corsOptions = {
  origin: [
    'http://localhost:3000',
    '*',
  ],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true,
  allowedHeaders: ['Authorization','Content-Type'],
};