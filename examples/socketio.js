const client = require('socket.io');
const io = require('socket.io')();

io.on('connection', () => {
  console.log('Connected')
  io.on('test', async function() {
    console.log('Before');
    throw new Error('oops');
    console.log('After')
  });
});

console.log(client)

io.listen(3000);
