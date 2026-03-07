import https from "https";
import fs from "fs";
import initApp from "./index";

const port = process.env.PORT;

const tlsOptions = {
  key: fs.readFileSync("certs/server.key"),
  cert: fs.readFileSync("certs/server.cert"),
};

initApp().then((app) => {
  console.log("after init app.");
  https.createServer(tlsOptions, app).listen(port, () => {
    console.log(`Server listening on port : ${port}`);
  });
});