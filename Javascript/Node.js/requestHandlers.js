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
   var picID = path.slice(i, path.length);
   var link = 'http://cloudalbum-vwalia.c9.io/images/' + path.slice(i, path.length);
   console.log('Path:' + path);
   var filename = files.file.name;
   var type = files.file.type;

   // It is assumed that album name will not contan ('') or (""); 
   // For example: album=album1  and not album='album1' or album="album1"
   console.log(album);
   console.log(filename);
   pictures.findOne({
    album: album
   }, (function(err, data) {
    //   			console.log("Error : "+err);
    // 			console.log("Album :"+data);
    if (!data) { //||data.length<1){
     var toInsert = {
      album: album,
      //pictures : [{base64Img : binData,filename : "'"+filename+"'",type : type,link : link}],
      pictures: [{
       filename: filename,
       type: type,
       link: link,
       ID: picID
      }]
     };
     //console.log(toInsert);
     pictures.insert(toInsert, function(err, data) {
      response.writeHead(201, {
       "Content-Type": "application/json"
      });
      var toret = "{ \"album\" :\"" + toInsert.album + "\", \"filename\" : \"" + toInsert.pictures[0].filename + "\", \"url\" :\"" + toInsert.pictures[0].link + "\",\"ID\" :\"" + picID + "\"}";
      response.end(toret);
     });
    }
    else {
     console.log("album found");
     //	console.log(data);
     //	console.log("here");
     var pics = data.pictures;
     //pics.push({base64Img : binData,filename :"'"+ filename+"'"});
     var toPush = {
      filename: filename,
      type: type,
      link: link,
      ID: picID
     };
     pics.push(toPush);
     pictures.update({
      album: album
     }, {
      album: album,
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
      var toret = "{ \"album\" :\"" + album + "\", \"filename\" : \"" + filename + "'\", \"url\" :\"" + link + "\", \"ID\" :\"" + picID + "\"}";
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
 var url = require("url");
 var querystring = require('querystring');
 var query = url.parse(request.url, true).query;
 var album = query["album"];
 var filename = query["filename"];
 var id = query["ID"];
 console.warn("Deleting file " + filename + " from album " + album + "with id " + id);

 pictures.findOne({
  album: album
 }, function(err, data) {
  if (err) {
   response.writeHead(500, {
    "Content-Type": "application/json"
   });
   response.end();
  }

  var pics = data.pictures;
  var index = pics.map(function(pic) {
   return pic.ID;
  }).indexOf(id);

  if (index > -1) {
   pics.splice(index, 1);
  }
  pictures.update({
   album: album
  }, {
   album: album,
   pictures: pics
  }, function(err, data) {
   if (err) {
    response.writeHead(500, {
     "Content-Type": "application/json"
    });
    response.end();
    throw (err);
   }
   response.writeHead(200,{
     "Content-Type": "application/json"
    });
    response.end();

  });

  /*response.writeHead(200, {
   "Content-Type": "application/json"
  });
  response.end(JSON.stringify(pics));
  console.log(data);
  console.log(data.pictures)
*/
 });



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