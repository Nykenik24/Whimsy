const sleep = require("./utils").sleep;

module.exports = {
  getinfo: (url) => {
    const info = fetch(`${url}/server-info`);
    console.log(JSON.stringify(info, null, 2));
  },
};
