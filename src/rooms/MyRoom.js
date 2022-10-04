const colyseus = require('colyseus');
const { MyRoomState, Player } = require('./schema/MyRoomState');

exports.MyRoom = class extends colyseus.Room {

  is_private = false;
  closed_room = false;
  maxClients = 2;

  onCreate (options) {
    this.autoDispose = true;
    this.is_private = options.private;
    this.setState(new MyRoomState());
    console.log("ROOM ["+this.roomId+"] created " + this.is_private);
    this.onMessage("do_move", (client, message) => {
      console.log('do_move: ', message.index, message.value);
      if (this.state.on_move(client.sessionId, message) ){
        console.log('broadcast move', message);
        this.broadcast("new_move", message);
      }
    });
    this.onMessage("gameover", (client, message) => {
      this.state.set_gameover(message.winner);
    });

    this.onMessage("on_revenge", (client, message)=>{
      let p = this.state.players[client.sessionId]
      console.log('ON REVENGE', p.name);
      p.revenge = true;
    })

    this.onMessage("imleaver", (client, message)=>{
      console.log('Closeed');
      this.closed_room = true;
      this.lock();
    })
  }

  onAuth (client, options, request) {
    if (this.closed_room){
      return false;
    }
    console.log('ON AUTH');
    if ( this.is_private == false && !options.private){
      console.log("OK cuz not private");
      return true;
    } else if (this.roomId === options.private ){
      console.log("OK cuz right ID", this.roomId, options.private );
      return true;
    } else if (this.clients.length == 1 && options.private == true){
      return true;
    }
    console.log("NOT OK");
    return false;
  }

  onJoin (client, options) {
    console.log(client.sessionId, "joined!");
    var p = new Player();
    p.id = client.id;
    p.sessionId = client.sessionId;
    p.name = options.name;
    this.state.players.set(client.sessionId, p);
    if ( this.clients.length == 2 ){
      this.state.start_game();
    }
  }

  onLeave (client, consented) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
