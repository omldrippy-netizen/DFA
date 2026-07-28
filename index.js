const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    Routes
} = require("discord.js");

const fs = require("fs");

const TOKEN = "MTUzMTQ1NDM3Mzg5NTYwMjI0OA.GWtbxA.gGo7zRcq5psRDS2rpKQ_ADmW67x6c1-acv-uyk";
const CLIENT_ID = "1531454373895602248";


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});


// LOAD DATABASE

let db = {
    teams: {}
};

if (fs.existsSync("database.json")) {
    db = JSON.parse(fs.readFileSync("database.json"));
}


function save() {
    fs.writeFileSync(
        "database.json",
        JSON.stringify(db, null, 2)
    );
}



// COMMANDS

const commands = [

new SlashCommandBuilder()
.setName("addteam")
.setDescription("Create a DFA team")
.addStringOption(option =>
    option.setName("name")
    .setDescription("Team name")
    .setRequired(true))
.addStringOption(option =>
    option.setName("emoji")
    .setDescription("Team emoji")
    .setRequired(true))
.addRoleOption(option =>
    option.setName("role")
    .setDescription("Team role")
    .setRequired(true)),


new SlashCommandBuilder()
.setName("team")
.setDescription("View a DFA team")
.addStringOption(option =>
    option.setName("name")
    .setDescription("Team name")
    .setRequired(true)),


new SlashCommandBuilder()
.setName("sign")
.setDescription("Sign a player")
.addStringOption(option =>
    option.setName("player")
    .setDescription("Player name")
    .setRequired(true))
.addStringOption(option =>
    option.setName("team")
    .setDescription("Team name")
    .setRequired(true)),


new SlashCommandBuilder()
.setName("transfer")
.setDescription("Transfer a player")
.addStringOption(option =>
    option.setName("player")
    .setDescription("Player name")
    .setRequired(true))
.addStringOption(option =>
    option.setName("from")
    .setDescription("Old team")
    .setRequired(true))
.addStringOption(option =>
    option.setName("to")
    .setDescription("New team")
    .setRequired(true)),


new SlashCommandBuilder()
.setName("addcoach")
.setDescription("Add a coach")
.addStringOption(option =>
    option.setName("coach")
    .setDescription("Coach name")
    .setRequired(true))
.addStringOption(option =>
    option.setName("team")
    .setDescription("Team name")
    .setRequired(true)),


new SlashCommandBuilder()
.setName("coaches")
.setDescription("View all DFA coaches"),


new SlashCommandBuilder()
.setName("demand")
.setDescription("Make a team demand")
.addStringOption(option =>
    option.setName("team")
    .setDescription("Team name")
    .setRequired(true))
.addStringOption(option =>
    option.setName("request")
    .setDescription("Demand request")
    .setRequired(true))

].map(command => command.toJSON());




// REGISTER COMMANDS

const rest = new REST({ version:"10" })
.setToken(TOKEN);


(async()=>{

try {

await rest.put(
Routes.applicationCommands(CLIENT_ID),
{
body: commands
}
);

console.log("DFA COMMANDS LOADED 🏈");

}

catch(error){
console.log(error);
}

})();




// BOT ONLINE

client.once("ready", ()=>{

console.log(
`${client.user.tag} is online 🏈`
);

});





// COMMAND SYSTEM

client.on("interactionCreate", async interaction => {


if(!interaction.isChatInputCommand())
return;



// ADD TEAM

if(interaction.commandName === "addteam"){

let name =
interaction.options.getString("name");

let emoji =
interaction.options.getString("emoji");

let role =
interaction.options.getRole("role");


if(db.teams[name]){

return interaction.reply(
"❌ Team already exists!"
);

}


db.teams[name] = {

emoji: emoji,

role: role.id,

players: [],

coaches: [],

demands: 0

};


save();


interaction.reply(
`
✅ **DFA TEAM CREATED**

${emoji} ${name}

👥 Role:
${role}

🏈 Ready for signings!
`
);

}




// VIEW TEAM

if(interaction.commandName === "team"){

let name =
interaction.options.getString("name");


let team = db.teams[name];


if(!team){

return interaction.reply(
"❌ Team not found"
);

}


interaction.reply(
`
${team.emoji} **${name}**

⭐ Players:
${team.players.join(", ") || "None"}

🧑‍💼 Coaches:
${team.coaches.join(", ") || "None"}

📢 Demands:
${team.demands}/2
`
);

}




// SIGN PLAYER

if(interaction.commandName === "sign"){

let player =
interaction.options.getString("player");

let team =
interaction.options.getString("team");


if(!db.teams[team]){

return interaction.reply(
"❌ Team not found"
);

}


db.teams[team].players.push(player);

save();


interaction.reply(
`✍️ ${player} signed with ${db.teams[team].emoji} ${team}!`
);

}




// TRANSFER

if(interaction.commandName === "transfer"){

let player =
interaction.options.getString("player");

let from =
interaction.options.getString("from");

let to =
interaction.options.getString("to");


if(!db.teams[from] || !db.teams[to]){

return interaction.reply(
"❌ Team not found"
);

}


db.teams[from].players =
db.teams[from].players.filter(
p => p !== player
);


db.teams[to].players.push(player);


save();


interaction.reply(
`🔁 ${player} transferred\n${from} ➡️ ${to}`
);

}




// ADD COACH

if(interaction.commandName === "addcoach"){

let coach =
interaction.options.getString("coach");

let team =
interaction.options.getString("team");


if(!db.teams[team]){

return interaction.reply(
"❌ Team not found"
);

}


db.teams[team].coaches.push(coach);

save();


interaction.reply(
`🧑‍💼 ${coach} is now coaching ${team}!`
);

}




// VIEW COACHES

if(interaction.commandName === "coaches"){

let message =
"🧑‍💼 **DFA COACHES**\n\n";


for(let team in db.teams){

message +=
`${db.teams[team].emoji} ${team}\n`;

message +=
`${db.teams[team].coaches.join(", ") || "None"}\n\n`;

}


interaction.reply(message);

}




// DEMANDS

if(interaction.commandName === "demand"){

let team =
interaction.options.getString("team");

let request =
interaction.options.getString("request");


if(!db.teams[team]){

return interaction.reply(
"❌ Team not found"
);

}


db.teams[team].demands++;

save();


if(db.teams[team].demands >= 2){

interaction.reply(
`
🚨 OWNER ALERT 🚨

${team} made 2 demands.

👋 Owner has left the franchise!
`
);

db.teams[team].demands = 0;

save();

}

else {

interaction.reply(
`
📢 Demand submitted!

🏈 Team:
${team}

📝 Request:
${request}

⚠️ Demands:
${db.teams[team].demands}/2
`
);

}

}


});



client.login(TOKEN);
