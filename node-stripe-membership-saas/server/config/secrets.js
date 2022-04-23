module.exports = {

  db: process.env.MONGODB || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/stripe-membership',

  sessionSecret: process.env.SESSION_SECRET || 'change this',

  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY || '',
    domain: process.env.MAILGUN_DOMAIN || ''
  },

  stripeOptions: {
    apiKey: process.env.STRIPE_KEY || '',
    stripePubKey: process.env.STRIPE_PUB_KEY || '',
    defaultPlan: 'free',
    plans: ['free','monthly'],
    planData: {
      'free': {
        name: 'Free',
        price: 0
      },
      'monthly': {
        name: 'monthly',
        price: 10
      }
    }
  },

  googleAnalytics: process.env.GOOGLE_ANALYTICS || ''
};
