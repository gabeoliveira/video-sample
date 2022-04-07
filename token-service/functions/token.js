exports.handler = function(context, event, callback) {
  const twilioAccountSid = context.ACCOUNT_SID;
  const twilioApiKey = context.API_KEY;
  const twilioApiSecret = context.API_SECRET;
  const identity = event.user_identity;
  const roomName = event.room_name;
  
  const AccessToken = Twilio.jwt.AccessToken;

  const token = new AccessToken(
    twilioAccountSid,
    twilioApiKey,
    twilioApiSecret,
    {identity: identity}
  );

  const VideoGrant = AccessToken.VideoGrant;
  const videoGrant = new VideoGrant({
    room: roomName // the specific room's name
  });

  token.addGrant(videoGrant);

  const response = new Twilio.Response();
  const headers = {
    "Access-Control-Allow-Origin": "*", // change this to your client-side URL
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
        
  response.setHeaders(headers);
  response.setBody({
    token: token.toJwt(),
    room_type: 'group'
  });

  return callback(null, response);

};
