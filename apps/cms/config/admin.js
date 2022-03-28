module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'acb9adf519bf72ec53dae0109b579efa'),
  },
});
