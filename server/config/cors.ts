export const Whitelist = ['http://localhost:4200']

export const CorsOptions = {
  origin: function (origin: string, callback) {
    if (!origin || Whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}