
const schema = require('@colyseus/schema');
const MapSchema = schema.MapSchema;
const ArraySchema = schema.ArraySchema;

class Player extends schema.Schema {}
schema.defineTypes(Player, {
  id : "string",
  session_id : "string",
  name : "string",
  avatar : "string",
  revenge : "boolean",
  score : "number",
});

class MyRoomState extends schema.Schema {
  constructor(){
    super();
    this.started = false;
    this.ended = false;
    this.winner = "";
    this.move = "x";
    this.players = new MapSchema();
    this.grid = new ArraySchema("","","","","","","","","","");
    this.empty_cells = 9;
  }

  start_game(){
    let move = Math.random() < 0.5 ? 'x' : 'o'
    for (let [player_key, player] of this.players) {
      if ( !player.avatar || player.avatar === ''){
        player.avatar = move;
        move = move === 'x' ? 'o' : 'x';
      }else{
        player.avatar = player.avatar === 'x' ? 'o' : 'x';
      }
    }
    setTimeout(()=>{
      this.started = true;
      console.log('GAME STARTED');
    }, 250);
  }

  check_gameover(){
    if ( this.empty_cells <= 0 ){
      this.ended = true;
    }
    let grid = this.grid
    let grid_1 = grid[0]
    let grid_5 = grid[4]
    let grid_9 = grid[8]
    let empty_cell = ""
    if ( this.winner === "" && grid_1 != empty_cell) {
		  if ( (grid_1 == grid[2] && grid_1 == grid[3]) || ( grid_1 == grid[4] && grid_1 == grid[7] ) ){
        this.winner = grid_1;
        this.ended = true;
      }
    }
	  if ( this.winner === "" && grid_5 != empty_cell ){
	  	if (
        (grid_5 == grid[4] && grid_5 == grid[6]) ||
	  	  (grid_5 == grid[2] && grid_5 == grid[8]) ||
	  	  (grid_5 == grid_1 && grid_5 == grid_9) ||
	  	  (grid_5 == grid[3] && grid_5 == grid[7])
      ){
        this.winner = grid_5;
        this.ended = true;
      }
    }
	  if ( this.winner === "" && grid_9 != empty_cell ){
	  	if ( (grid_9 == grid[8] && grid_9 == grid[7]) || (grid_9 == grid[6] && grid_9 == grid[3]) ){
        this.winner = grid_9;
        this.ended = true;
      }
    }
  }

  on_move(id, data){
    let move = data.index - 1;
    if ( this.ended ) { return };
    if (this.players[id].avatar === this.move){
      if ( move ){
        if ( this.grid[move] === "" ){
          console.log('dp move -> SUCCESS');
          this.grid[move] = this.move;
          this.empty_cells -= 1; 
          this.move = this.move === 'x' ? 'o' : 'x';
          this.check_gameover();
          return true;
        }
      }
    }
    return false
  }

  set_gameover(winner){
    console.log("GameOver", winner);
    this.ended = true;
    if ( winner ){
      this.winner = winner;
    }
  }

}
schema.defineTypes(MyRoomState, {
  started : "boolean",
  ended : "boolean",
  winner : "string",
  move : "string",
  grid : ["string"],
  empty_cells : "number",
  players: { map: Player },
});

exports.MyRoomState = MyRoomState;
exports.Player = Player;