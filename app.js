const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());
const dbPath = path.join(__dirname, "covid19India.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000/");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeDbAndServer();

//API-1
app.get("/states/", async (request, response) => {
  const sqlQuery = `SELECT * FROM state`;
  const result = await db.all(sqlQuery);
  response.send(result);
});

app.get("/districts/", async (request, response) => {
  const sqlQuery = `SELECT * FROM district`;
  const result = await db.all(sqlQuery);
  response.send(result);
});

//API-2
app.get("/states/:state_id/", async (request, response) => {
  const { state_id } = request.params;
  const sqlQuery = `SELECT * FROM state WHERE state_id = ${state_id}`;
  const result = await db.get(sqlQuery);
  response.send(result);
});

//API-3
app.post("/districts/", async (request, response) => {
  const details = request.body;
  const { district_name, state_id, cases, cured, active, deaths } = details;
  const sqlQuery = `INSERT INTO district (district_name, state_id,cases, cured, active, deaths) VALUES ('${district_name}','${state_id}','${cases}','${cured}','${active}','${deaths}')`;
  await db.run(sqlQuery);
  response.send("District Successfully Added");
});

//API-4
app.get("/districts/:district_id/", async (request, response) => {
  const { district_id } = request.params;
  const sqlQuery = `SELECT * FROM district WHERE district_id = ${district_id}`;
  const result = await db.get(sqlQuery);
  response.send(result);
});

//API-5
app.delete("/districts/:district_id/", async (request, response) => {
  const { district_id } = request.params;
  const sqlQuery = `DELETE FROM district WHERE district_id = ${district_id}`;
  await db.run(sqlQuery);
  response.send("District Removed");
});

//API-6
app.put("/districts/:district_id/", async (request, response) => {
  const { district_id } = request.params;
  const data = request.body;
  const { district_name, state_id, cases, cured, active, deaths } = data;
  const sqlQuery = `UPDATE district SET district_name = '${district_name}',state_id = '${state_id}',cases = '${cases}',cured = '${cured}',active = '${active}',deaths = '${deaths}' WHERE district_id = ${district_id}`;
  await db.run(sqlQuery);
  response.send("District Details Updated");
});

//API-7
app.get("/states/:state_id/stats/", async (request, response) => {
  const { state_id } = request.params;
  const sqlQuery = `SELECT SUM(cases),SUM(cured),SUM(active),SUM(deaths) FROM district
    WHERE state_id = ${state_id}`;
  const result = await db.get(sqlQuery);
  response.send({
    totalCases: result["SUM(cases)"],
    totalCured: result["SUM(cured)"],
    totalActive: result["SUM(active)"],
    totalDeaths: result["SUM(deaths)"],
  });
});

//API-8
app.get("/districts/:district_id/details/", async (request, response) => {
  const { district_id } = request.params;
  const sqlQuery = `SELECT state_name FROM state NATURAL JOIN district WHERE district_id = ${district_id}`;
  const result = await db.get(sqlQuery);
  response.send(result);
});

module.exports = app;
