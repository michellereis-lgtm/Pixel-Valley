// ======================================================
// PIXEL VALLEY - A ÚLTIMA COLHEITA
// ======================================================

// CANVAS
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

// TELAS
const startScreen = document.getElementById("startScreen");
const winScreen = document.getElementById("winScreen");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

// INVENTÁRIO
let inventory = { wood: 0, stone: 0, seeds: 3, crops: 0 };

// PERSONAGEM
const player = { x:150,y:400,width:26,height:30,speed:3,color:"#e8c28c" };

// CONTROLES
const keys = {};
document.addEventListener("keydown",(event)=>{ keys[event.key.toLowerCase()]=true; if(event.key.toLowerCase()==="e"){interact();}});
document.addEventListener("keyup",(event)=>{keys[event.key.toLowerCase()]=false;});

// OBJETOS
const trees=[{x:90,y:90},{x:160,y:90},{x:720,y:90},{x:790,y:150},{x:100,y:470},{x:800,y:450}];
const rocks=[{x:270,y:100},{x:340,y:120},{x:700,y:430},{x:760,y:390}];

// TERRENOS
const plots=[
{x:360,y:300,state:"empty",growthStart:0},
{x:410,y:300,state:"empty",growthStart:0},
{x:460,y:300,state:"empty",growthStart:0}
];

// CASA
const house={x:350,y:70,width:220,height:130};

// NPC
const npc={x:610,y:220,width:30,height:40,name:"Elias"};

// ÁGUA
const water={x:600,y:300,width:200,height:100};

// MENSAGEM
const messageElement=document.getElementById("message");
let messageTimer=null;
function showMessage(text){
 messageElement.textContent=text;
 clearTimeout(messageTimer);
 messageTimer=setTimeout(()=>{messageElement.textContent="Explore a fazenda e pressione E para interagir.";},3000);
}

// INVENTÁRIO
function updateInventory(){
 document.getElementById("wood").textContent=inventory.wood;
 document.getElementById("stone").textContent=inventory.stone;
 document.getElementById("seeds").textContent=inventory.seeds;
 document.getElementById("crops").textContent=inventory.crops;
}

// OBJETIVOS
function updateObjectives(){
 const prepared=plots.filter(plot=>plot.state!=="empty").length;
 const planted=plots.filter(plot=>["planted","watered","grown","harvested"].includes(plot.state)).length;
 const watered=plots.filter(plot=>["watered","grown","harvested"].includes(plot.state)).length;
 document.getElementById("objective1").textContent=(prepared>=3?"☑":"⬜")+" Preparar 3 terrenos";
 document.getElementById("objective2").textContent=(planted>=3?"☑":"⬜")+" Plantar 3 sementes";
 document.getElementById("objective3").textContent=(watered>=3?"☑":"⬜")+" Regar as plantações";
 document.getElementById("objective4").textContent=(inventory.crops>=3?"☑":"⬜")+" Colher 3 plantações";
 document.getElementById("objective5").textContent=(inventory.crops>=3?"☑":"⬜")+" Entregar a colheita para Elias";
}

// DISTÂNCIA
function distance(x1,y1,x2,y2){const dx=x1-x2,dy=y1-y2;return Math.sqrt(dx*dx+dy*dy);}

// COLISÃO
function rectanglesCollide(a,b){return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;}

// OBJETOS DE COLISÃO
function getCollisionObjects(){
 const objects=[];
 objects.push({x:house.x,y:house.y,width:house.width,height:house.height});
 trees.forEach(tree=>{objects.push({x:tree.x-18,y:tree.y-20,width:36,height:45});});
 rocks.forEach(rock=>{objects.push({x:rock.x-15,y:rock.y-10,width:30,height:25});});
 return objects;
}

// MOVIMENTO
function movePlayer(){
 let newX=player.x,newY=player.y;
 if(keys["w"]||keys["arrowup"])newY-=player.speed;
 if(keys["s"]||keys["arrowdown"])newY+=player.speed;
 if(keys["a"]||keys["arrowleft"])newX-=player.speed;
 if(keys["d"]||keys["arrowright"])newX+=player.speed;
 const newPlayer={x:newX,y:newY,width:player.width,height:player.height};
 if(newX<10||newY<10||newX+player.width>canvas.width-10||newY+player.height>canvas.height-10)return;
 const objects=getCollisionObjects();
 for(const object of objects){if(rectanglesCollide(newPlayer,object))return;}
 player.x=newX;player.y=newY;
}

// INTERAÇÃO
function interact(){
 for(let i=0;i<trees.length;i++){
  const tree=trees[i];
  if(distance(player.x,player.y,tree.x,tree.y)<55){
   inventory.wood++;
   showMessage("Você coletou madeira! +1 madeira.");
   trees.splice(i,1);
   updateInventory();
   return;
  }
 }
 for(let i=0;i<rocks.length;i++){
  const rock=rocks[i];
  if(distance(player.x,player.y,rock.x,rock.y)<50){
   inventory.stone++;
   showMessage("Você coletou uma pedra! +1 pedra.");
   rocks.splice(i,1);
   updateInventory();
   return;
  }
 }
 for(const plot of plots){
  if(distance(player.x,player.y,plot.x+20,plot.y+20)<55){interactWithPlot(plot);return;}
 }
 if(distance(player.x,player.y,npc.x,npc.y)<65){talkToNPC();return;}
 showMessage("Não há nada para interagir aqui.");
}

// TERRENOS
function interactWithPlot(plot){
 if(plot.state==="empty"){plot.state="prepared";showMessage("Você preparou o terreno.");updateObjectives();return;}
 if(plot.state==="prepared"){
  if(inventory.seeds<=0){showMessage("Você não possui mais sementes.");return;}
  inventory.seeds--;plot.state="planted";plot.growthStart=Date.now();
  showMessage("Semente plantada! Agora regue.");updateInventory();updateObjectives();return;
 }
 if(plot.state==="planted"){plot.state="watered";plot.growthStart=Date.now();showMessage("Plantação regada! Ela crescerá em alguns segundos.");updateObjectives();return;}
 if(plot.state==="grown"){plot.state="harvested";inventory.crops++;showMessage("Você colheu uma plantação! +1 colheita.");updateInventory();updateObjectives();return;}
 if(plot.state==="harvested"){showMessage("Este terreno já foi colhido.");return;}
 showMessage("Essa plantação ainda está crescendo.");
}

// CRESCIMENTO
function updatePlants(){
 plots.forEach(plot=>{
  if(plot.state==="watered"){
   const elapsed=Date.now()-plot.growthStart;
   if(elapsed>=10000){plot.state="grown";showMessage("Uma plantação cresceu! Você pode colhê-la.");updateObjectives();}
  }
 });
}

// NPC
function talkToNPC(){
 if(inventory.crops<3){showMessage("Elias: Ainda precisamos de mais alimentos.");return;}
 showMessage("Elias: Você conseguiu! A fazenda pode recomeçar.");
 setTimeout(()=>{winGame();},1800);
}

// VITÓRIA
function winGame(){winScreen.classList.remove("hidden");}

// RESET
function resetGame(){
 inventory={wood:0,stone:0,seeds:3,crops:0};
 player.x=150;player.y=400;
 trees.length=0;
 trees.push({x:90,y:90},{x:160,y:90},{x:720,y:90},{x:790,y:150},{x:100,y:470},{x:800,y:450});
 rocks.length=0;
 rocks.push({x:270,y:100},{x:340,y:120},{x:700,y:430},{x:760,y:390});
 plots.forEach(plot=>{plot.state="empty";plot.growthStart=0;});
 updateInventory();updateObjectives();
 showMessage("Explore a fazenda e pressione E para interagir.");
}

// DRAW MAP
function drawMap(){
 ctx.fillStyle="#79a957";ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle="#6e9b4e";
 for(let x=20;x<canvas.width;x+=45){for(let y=20;y<canvas.height;y+=45){ctx.fillRect(x,y,4,4);}}
 ctx.fillStyle="#c4a86b";ctx.fillRect(0,250,canvas.width,60);
 ctx.fillStyle="#4c91b7";ctx.fillRect(water.x,water.y,water.width,water.height);
 ctx.fillStyle="#79bad5";
 for(let x=water.x+10;x<water.x+water.width;x+=35){ctx.fillRect(x,water.y+20,15,3);ctx.fillRect(x+10,water.y+55,15,3);}
 drawHouse();drawTrees();drawRocks();drawPlots();drawNPC();drawPlayer();
}
function drawHouse(){
 ctx.fillStyle="#b9784c";ctx.fillRect(house.x,house.y+35,house.width,house.height-35);
 ctx.fillStyle="#713e32";ctx.beginPath();ctx.moveTo(house.x-15,house.y+40);ctx.lineTo(house.x+house.width/2,house.y-30);ctx.lineTo(house.x+house.width+15,house.y+40);ctx.closePath();ctx.fill();
 ctx.fillStyle="#4b3022";ctx.fillRect(house.x+90,house.y+80,40,60);
 ctx.fillStyle="#8fd0dc";ctx.fillRect(house.x+30,house.y+65,40,35);ctx.fillRect(house.x+150,house.y+65,40,35);
}
function drawTrees(){
 trees.forEach(tree=>{
  ctx.fillStyle="#70452b";ctx.fillRect(tree.x-7,tree.y,14,30);
  ctx.fillStyle="#315d32";ctx.fillRect(tree.x-22,tree.y-25,44,45);ctx.fillRect(tree.x-30,tree.y-10,60,25);
 });
}
function drawRocks(){
 rocks.forEach(rock=>{
  ctx.fillStyle="#777";ctx.beginPath();ctx.arc(rock.x,rock.y,15,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#999";ctx.beginPath();ctx.arc(rock.x-4,rock.y-4,5,0,Math.PI*2);ctx.fill();
 });
}
function drawPlots(){
 plots.forEach(plot=>{
  if(plot.state!=="empty")ctx.fillStyle="#76502f";else ctx.fillStyle="#9b7548";
  ctx.fillRect(plot.x,plot.y,40,40);
  ctx.strokeStyle="#533821";ctx.strokeRect(plot.x,plot.y,40,40);
  if(plot.state==="planted"||plot.state==="watered"){
   ctx.fillStyle="#4d8b38";ctx.fillRect(plot.x+17,plot.y+15,6,20);ctx.fillRect(plot.x+10,plot.y+18,10,5);ctx.fillRect(plot.x+22,plot.y+22,10,5);
  }
  if(plot.state==="grown"){
   ctx.fillStyle="#3c742d";ctx.fillRect(plot.x+17,plot.y+8,7,28);
   ctx.fillStyle="#f3d15b";ctx.fillRect(plot.x+10,plot.y+5,20,15);
  }
  if(plot.state==="harvested"){ctx.fillStyle="#604323";ctx.fillRect(plot.x+5,plot.y+20,30,5);}
 });
}
function drawNPC(){
 ctx.fillStyle="#4d73a8";ctx.fillRect(npc.x-12,npc.y,24,30);
 ctx.fillStyle="#d8a87c";ctx.fillRect(npc.x-11,npc.y-20,22,22);
 ctx.fillStyle="#553723";ctx.fillRect(npc.x-12,npc.y-23,24,7);
 ctx.fillStyle="white";ctx.font="12px Courier New";ctx.textAlign="center";ctx.fillText("Elias",npc.x,npc.y-30);
}
function drawPlayer(){
 ctx.fillStyle="#4d6fa8";ctx.fillRect(player.x,player.y+10,player.width,player.height-10);
 ctx.fillStyle=player.color;ctx.fillRect(player.x+3,player.y-5,20,20);
 ctx.fillStyle="#4a3023";ctx.fillRect(player.x+2,player.y-7,22,7);
 ctx.fillStyle="#222";ctx.fillRect(player.x+7,player.y+3,3,3);ctx.fillRect(player.x+17,player.y+3,3,3);
}

// LOOP
function gameLoop(){movePlayer();updatePlants();ctx.clearRect(0,0,canvas.width,canvas.height);drawMap();requestAnimationFrame(gameLoop);}

// BUTTONS
startButton.addEventListener("click",()=>{startScreen.classList.add("hidden");resetGame();});
restartButton.addEventListener("click",()=>{winScreen.classList.add("hidden");resetGame();});

// INIT
updateInventory();updateObjectives();gameLoop();
