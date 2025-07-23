export const logCall = (req, res, next) => {
  console.log('logCall', req);
  return next();
};
