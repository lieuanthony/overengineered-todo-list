import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import app from "./api/app";

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});