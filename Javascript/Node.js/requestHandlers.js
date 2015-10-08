var fs = require("fs"),
 formidable = require("formidable");

function start(request, response, pictures) {
 // console.log("start called");
 pictures.find().toArray(function(err, results) {

  if (results) {
   // results.forEach(function(result){
   response.writeHead(200, {
    "Content-Type": "text/html"
   });

   var body = '<html>' +
    '<head>' +
    '<meta http-equiv="Content-Type" ' +
    'content="text/html; charset=UTF-8" />' +
    '</head>' +
    '<body>' +
    '<form action="/upload?album=\"album2\" enctype="multipart/form-data" ' +
    'method="post">' +
    '<input type="file" name="upload" multiple="multiple">' +
    '<input type="submit" value="Upload file" />' +
    '</form>' +
    '</body>' +
    '</html>';

   response.end(body);
   // }); 
  }
 });
}

function upload(request, response, pictures) {
 var url = require("url");
 var querystring = require('querystring');
 var query = url.parse(request.url, true).query;
 var album = query["album"];
 if (!album) album = 'album1';
 var form = new formidable.IncomingForm({
  uploadDir: '/home/ubuntu/workspace/images'
 });
 form.parse(request, function(error, fields, files) {
  //If error send response and throw error
  if (error) {
   response.writeHead(500, {});
   response.end();
   throw error;
  }

  if (files.file) {
   var path = files.file.path;
   var i = path.lastIndexOf('/');
   var link = 'http://cloudphotostoreservice-vaibhav-walia.c9.io:8081/images/' + path.slice(i, path.length);
   console.log('Path:' + path);
   var filename = files.file.name;
   var type = files.file.type;
   //        console.log("Upload : "+JSON.stringify(files.upload));
   //The data from client is stored in a temp location(path), read and store in db
   //	fs.readFile(path,function(err,data){

   //		if(err){ response.writeHead(500,{"Content-Type":"application/json"}); response.end(); throw(err); };
   //	        var binData = data;
   //console.log("Binary Data:"+data);
   //		var base64data = new Buffer(data).toString('base64');
   pictures.findOne({
    album: "'" + album + "'"
   }, (function(err, data) {
    //   			console.log("Error : "+err);
    // 			console.log("Album :"+data);
    if (!data) { //||data.length<1){
     var toInsert = {
      album: "'" + album + "'",
      //pictures : [{base64Img : binData,filename : "'"+filename+"'",type : type,link : link}],
      pictures: [{
       filename: "'" + filename + "'",
       type: type,
       link: link
      }]
     };
     //console.log(toInsert);
     pictures.insert(toInsert, function(err, data) {
      response.writeHead(201, {
       "Content-Type": "application/json"
      });
       var toret = "{ \"album\" :\"" + album + "\", \"filename\" : \"" + filename + "\", \"url\" :\" /show?album='" + album + "'&filename='" + filename + "'\"}";
      response.end(toret);
     });
    }
    else {
     //	console.log(data);
     //	console.log("here");
     var pics = data.pictures;
     //pics.push({base64Img : binData,filename :"'"+ filename+"'"});
     pics.push({
      filename: "'" + filename + "'",
      type: type,
      link: link
     });
     pictures.update({
      album: "'" + album + "'"
     }, {
      album: "'" + album + "'",
      pictures: pics
     }, function(err, data) {
      if (err) {
       response.writeHead(500, {
        "Content-Type": "application/json"
       });
       throw (err);
      };

      response.writeHead(201, {
       "Content-Type": "application/json"
      });
      var toret = "{ \"album\" :\"" + album + "\", \"filename\" : \"" + filename + "\", \"url\" :\" /show?album='" + album + "'&filename='" + filename + "'\"}";
      response.end(toret);
     });
    }
   }));
   //});
  }
  else {
   console.log(files);
   response.writeHead(400, {
    "Content-Type": "application/json"
   });
   response.end();
  }
 });
}

function remove(request, response, pictures) {
 //	console.log("delete called");
 response.end();

}

function show(request, response, pictures) {

 var url = require("url");
 var querystring = require('querystring');
 var query = url.parse(request.url, true).query;
 //console.log(query);
 //console.log(querystring.parse(request.url));
 var Album = query["album"];
 var filename = query["filename"];
 console.log("query for albumname=" + Album);
 if (!Album || !filename) {
  console.log("album :" + Album + "\n" + "filename:" + filename);
  response.writeHead(400, {
   "Content-Type": "application/json"
  });
  response.end();
 }
 else {
  //       console.log(pictures); 

  pictures.findOne({
   album: Album
  }, function(err, albums) {
   //console.log(err)
   // console.log(albums.toArray()); 
   console.log(albums);
   console.log("!!Ye hai albums.pictures: " + albums.pictures);
   console.log("picture:" + albums.pictures);
   response.writeHead({
    "Content-Type": "text/html"
   });
   var body = "<html><body>";
   var images = "";
   var imgBin;
   var pictures = albums.pictures;
   var flag = '';
   var type;
   var picToRet;
   pictures.forEach(function(pic) {
    //var imageStr = JSON.stringify(pic.filename);
    console.log("Filename in db: " + pic.filename);
    console.log("Filename in request" + filename);
    if (pic.filename == filename && flag == '') {
     //  				console.log("pic:" +pic.base64Img);
     flag = 'x';
     //var i = "data:image/*;base64,"+pic.base64Img;
     //images = i + images ;
     //imgBin = pic.base64Img;
     //type = pic.type;
     picToRet = pic;
    }
   });
   if (flag == '') {
    response.writeHead(404, {
     "Content-Type": "text/html"
    });
    response.end();
   }
   else {
    response.writeHead(200, {
     "Content-Type": "application/json"
    });
    //body = body+images+"<body></html>";
    //console.log(imgBin);
    //response.write(imgBin.buffer,'binary');
    response.end(JSON.stringify(picToRet));
   }
  });
 }
}

function showAll(request, response, pictures) {
 var toret = '[';
 var responseHeaders = {
  "Access-Control-Allow-Origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10,
  "Content-Type": "application/json"
 };
 response.writeHead(200, responseHeaders);
 pictures.find().toArray(function(err, albums) {
  if (err) throw err;
  //console.log(albums.length);
  albums.forEach(function(album) {
   //     console.log(album);
   toret += JSON.stringify(album) + ",";
   //response.write(JSON.stringify(album));
  });
  //console.log(toret);
  var x = toret.slice(0, (toret.length - 1));
  x += ']';
  //console.log(x);
  response.end(x);
 });
}

exports.start = start;
exports.upload = upload;
exports.remove = remove;
exports.show = show;
exports.showAll = showAll;