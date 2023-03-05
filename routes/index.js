var express = require('express');
var router = express.Router();
var connection=require('../db');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express'});
});

router.get('/course', function(req, res, next) {
    res.render('course', { title: 'Express' });
});

router.get('/about', function(req, res, next) {
    res.render('about', { title: 'Express' });
});




router.post('/search', function(req, res, next) {

    connection.query(" SELECT * from (SELECT * FROM COURSE WHERE Course_Title like ?)A INNER JOIN INSTRUCTOR ON A.Instructor_id=INSTRUCTOR.Instructor_id",'%'+req.body.search+'%',function(err1,courses){
        if(err1) {
          
            console.log(err1);
        }
        else {
         res.render('search',{courses : courses});
        }
});
});


router.get('/search/instructor/:id', function(req, res, next) {
   
    connection.query(" SELECT * from INSTRUCTOR WHERE Instructor_id= ? ",req.params.id,function(err1,row){
        if(err1) {
          
            console.log(err1);
        }
        else {
            res.render('search/instructor', { instructor: row[0] });
        }
});
    
});

router.get('/search/course/:id', function(req, res, next) {
   
    connection.query(" SELECT * from COURSE WHERE Course_id= ? ",req.params.id,function(err1,row){
        if(err1) {
          
            console.log(err1);
        }
        else {
            res.render('search/course', { course: row[0] });
        }
});
    
});


module.exports = router;