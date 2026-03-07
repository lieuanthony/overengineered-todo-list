import path from "path";
import dotenv from "dotenv";
dotenv.config({
  path: path.resolve(__dirname, "./.env"),
  debug: true
});

import app from "./api/app";

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});