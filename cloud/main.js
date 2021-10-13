// It is best practise to organize your cloud functions group into their own file. You can then import them in your main.js.
require('./functions.js');

//** STEP 1 **
const Mux = require('@mux/mux-node');
const uuid = require('uuid/v1');

const { Video } = new Mux();


//** STEP 2 **
Parse.Cloud.define('upload', async function(req) {
  // Generate a passthrough ID that will be used to identify the video asset in Mux
	const id = uuid();
  
  // Create a new upload using the Mux SDK.
  const upload = await Video.Uploads.create({
    // Set the CORS origin to your application.
    cors_origin: 'https://tiktokclone.herokuapp.com',

    // Specify the settings used to create the new Asset after
    // the upload is complete
    new_asset_settings: {
      passthrough: id,
      playback_policy: 'public',
    }
  });
	// Create a new Post and save the passthrough ID we generated earlier
  // Optionally save the upload id
	// Optionally save other info about the post, i.e. post.set("author", req.user)
  var Post = Parse.Object.extend({
    className: ""
  });
  var post = new Post()
  post.set("uploadId", upload.id);
  post.set("passthrough", id);
  post.set("status", 'waiting_for_upload');

  return post.save().then((post) => {
    // Now send back that passthrough ID and the upload URL so the client can use it!
    return {id: id, url: upload.url};
  }, (error) => {
    return({error: error});
  })
})

// ** STEP 4 **
Parse.Cloud.define('webhook', async function(req) {
  
  const Post = Parse.Object.extend("Post")

  switch (req.params.eventType) {
    case 'video.asset.created': {
      const query = new Parse.Query(Post);
			// Query for the Post by passthrough id
      query.equalTo("passthrough", req.params.eventData.passthrough);
      const post = await query.first()
      if (post.get("status") !== 'ready') {
        post.set('status', 'created')
				// Save the eventData which contains information about the asset 
        post.set('asset', req.params.eventData)
        return post.save()
      }
    };
    case 'video.asset.ready': {
      const query = new Parse.Query(Post);
      query.equalTo("passthrough", req.params.eventData.passthrough);
      const post = await query.first()
      post.set('status', 'ready')
      post.set('asset', req.params.eventData)
      return post.save()
    };
    default:
      // ignore the rest
      console.log('some other mux event! ' + req.params.eventType);
  }
});
