require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const { createApp, startServer } = require("../shared/createApp");
const { initDb } = require("./db");

const labelsRoutes = require("./routes/labels");

const app = createApp({ name: "label-merger-service" });

app.use("/api/label-merger", labelsRoutes);

startServer(app, {
	name: "label-merger-service",
	port: process.env.PORT || 4013,
	init: initDb,
});
