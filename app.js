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

//API to get a list of players in the team
app.get("/players/", async (request, response) => {
  const allPlayersQuery = `SELECT * FROM cricket_team ORDER BY player_id;`;
  const result = await db.all(allPlayersQuery);
  response.send(result);
});

//API to add a new player
app.post("/players/", async (request, response) => {
  const playersDetails = request.body;
  const { player_name, jerseyNumber, role } = playersDetails;
  const addPlayerQuery = `INSERT INTO cricket_team(player_name,jersey_number,role)
    VALUES ("${player_name}",${jerseyNumber},"${role}");`;
  const result = await db.run(addPlayerQuery);
  const playerId = result.lastID;
  response.send("Player Added to Team");
});

//API TO get player details based on id 
app.get("/players/:player_id/",async (request,response)=>{
    const {player_id}=request.params;
    const playerDetailsQuery=`SELECT * FROM cricket_team WHERE player_id=${player_id};`,
    const playerDetails=await db.get(playerDetailsQuery);
    response.send(playerDetails);

});
