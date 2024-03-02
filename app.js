const express = require("express");
const app = express();
app.use(express.json());
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (e) {
    console.log("DB Error: ${e.message}");
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbobjectIntoResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
//API to get a list of players in the team
app.get("/players/", async (request, response) => {
  const allPlayersQuery = `SELECT * FROM cricket_team;`;
  const result = await db.all(allPlayersQuery);
  response.send(
    result.map((eachplayer) => convertDbobjectIntoResponseObject(eachplayer))
  );
});

//API to add a new player
app.post("/players/", async (request, response) => {
  const playersDetails = request.body;
  const { player_name, jerseyNumber, role } = playersDetails;
  const addPlayerQuery = `INSERT INTO cricket_team(player_name,jersey_number,role)
    VALUES ('${player_name}',${jerseyNumber},'${role}');`;
  const result = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//API TO get player details based on id
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetailsQuery = `SELECT * 
    FROM cricket_team 
    WHERE player_id=${playerId};`;
  const player = await db.get(playerDetailsQuery);
  response.send(convertDbobjectIntoResponseObject(player));
});

//API TO UPDATE DETAILS OF PLAYER BASED ON PLAYER ID

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetailsQuery = `UPDATE cricket_team 
    SET player_name='${playerName}',jersey_number=${jerseyNumber},role='${role}'
    WHERE player_id=${playerId};`;
  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});

//API delete a player based on the id

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team 
                                WHERE player_id=${playerId}; `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
