function isValidURL(str) {
  const expression = /https?:\/\/.+/gi;
  const regex = new RegExp(expression);

  return str.match(regex);
}

function cors(req, res, next) {
  const origin = req.get('Origin');
  if (origin) {
    res.set({
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    });
  }
  next();
}

module.exports = {
  cors: cors,
  isValidURL: isValidURL
};
