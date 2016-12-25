var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var pool = mysql.createPool({
});

/* GET home page. */
router.get('/', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else {
      connection.query('select * from post order by id desc', function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          res.sendStatus(500);
        }
        else {
          res.send(rows);
        }
        connection.release();
      });
    }
  });
});


router.get('/:id', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else {
      connection.query('select p.id, p.title, p.writer, p.content, p.date, r.writer as reply_writer, r.content as reply_content, r.date as reply_date from post p left join reply r on p.id = r.post_id where p.id = ?;',[req.params.id], function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          res.sendStatus(500);
          connection.release();
        }
        else {

          var post = {
            id : rows[0].id,
            title : rows[0].title,
            writer : rows[0].writer,
            content : rows[0].content,
            date : rows[0].date
          };
          var replies = [];
          if (rows.length>0){
            for (var i in rows){
              replies.push({
                writer : rows[i].reply_writer,
                content : rows[i].reply_content,
                date : rows[i].reply_date
              });
            }
            res.send({post : post, replies : replies});
          }
          else {
          res.send({post : post, replies : replies});

          }
          connection.release();
        }
      });
    }
  });
});



router.post('/', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else {
      connection.query('insert into post(title, content, writer, date) values(?,?,?,?)',[req.body.title, req.body.content, req.body.writer, new Date()], function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          res.sendStatus(500);
        }
        else {
          res.sendStatus(200);
        }
        connection.release();
      });
    }
  });
});



router.post('/:id/replies', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else {
      connection.query('insert into reply(post_id, writer, content, date) values(?,?,?,?)',[req.params.id, req.body.writer, req.body.content, new Date()], function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          res.sendStatus(500);
        }
        else {
          res.sendStatus(200);
        }
        connection.release();
      });
    }
  });
});



module.exports = router;
