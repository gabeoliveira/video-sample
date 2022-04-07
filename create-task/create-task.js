require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const roomName = (Math.floor(Math.random() * 10000000) + 1).toString();

client.video.rooms.create({uniqueName: roomName})
                  .then(room => {
                    console.log(`Room SID: ${room.sid}`);
                    console.log(`Room Name: ${room.uniqueName}`);
                    client.messages
                        .create({from: '+12073832067', body: `Hola Gabriel!\nLink para tu cita: https://video-app-1485-4158-dev.twil.io\nNumero de atendimento: ${room.uniqueName}`, to: '+5511976932682'})
                        .then(message => console.log(message.sid));

                    client.taskrouter.workspaces('WS54d086d98d11f7d0a317700bf53ef20a')
                        .tasks
                         .create({attributes: JSON.stringify({
                            agent_sid: 'WKc97e1fa77fc2617553c109336a077b19',
                            //agent_sid: 'WK87862fc338a78b1b7650e0c6a124f39e',
                            videoChatRoom: roomName,
                             name: 'Gabriel Oliveira'
                            }), workflowSid: 'WW6a499b4668fc37e92f552a72986c6361',
                            taskChannel: 'video'})
                        .then(task => {
                            console.log(task.sid);

                            const data = {
                                taskSid: task.sid
                              }

                            const uniqueName = room.sid.replace('RM', 'rm');

                            client.sync.services('ISe1bbe07d515937c97bd905dd4ed9a18f')
                                .documents
                                .create({uniqueName, data})
                                .then(document => console.log(document.sid));


                        
                        });

                      });