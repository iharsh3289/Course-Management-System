var express = require('express');
var router = express.Router();
var connection=require('../db');
var path = require('path');
var fs = require('fs');
var multer  = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
var upload1 = multer({
    storage: storage,
}).single('file');


router.get('/', function(req, res){

    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Student'] ,function(err1,rows1){
            if(err1 || rows1.length === 0) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE A,(SELECT * FROM ANOUNCEMENT WHERE Course_id IN (SELECT Course_id FROM ENROLLED WHERE Student_id = ?) ORDER BY -Posted_on LIMIT 5) B WHERE A.Course_id = B.Course_id",rows2[0].Student_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/users/login')

                            }
                            else {
                                console.log(rows3);
                                res.render('student/home',{'user':rows1[0], 'student': rows2[0], 'announcement': rows3});
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }

});





router.get('/profile', function(req, res, next) {
    if(req.user){
        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        console.log(rows1[0]);
                        res.render('student/profile',{'user':rows1[0], 'student': rows2[0]});
                    }
                });
            }
        });
    }
    else {
        res.redirect('/users/login/')
    }

});


router.post('/profile', function(req, res){
    if(req.user){


        req.checkBody('phone', 'Phone Number is Not Valid').isNumeric();


        console.log('dhhhdd');
        var First_Name = req.body.fname;
        var Middle_Name = req.body.mname;
        var Last_Name = req.body.lname;

        console.log('dhhhdd');
        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else if(rows1[0].role === 'Student') {
                connection.query("UPDATE STUDENT SET First_Name = ?, Middle_Name = ?, Last_Name = ? WHERE User_id = ?  ",[First_Name, Middle_Name, Last_Name,req.user] ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        console.log('dhhhdd');
                        return res.redirect('/student/profile/')
                    }
                });
            }
        });
    }
    else {
        res.redirect('/login/')
    }
});



router.post('/search', function(req, res, next) {

    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {

                        connection.query(" SELECT * from (SELECT * FROM COURSE WHERE Course_Title like ?)A INNER JOIN INSTRUCTOR ON A.Instructor_id=INSTRUCTOR.Instructor_id",'%'+req.body.search+'%',function(err1,courses){
                            if(err1) {

                                console.log(err1);
                            }
                            else {
                                res.render('student/search/courses',{'user':rows1[0], 'student': rows2[0], courses : courses});
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }





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

    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {



                        connection.query(" SELECT * from COURSE WHERE Course_id= ? ",req.params.id,function(err1,row){
                            if(err1) {

                                console.log(err1);
                            }
                            else {
                                res.render('student/search/course', { course: row[0] });
                            }
                        });


                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }








});




router.get('/course/:id/join', function(req, res, next) {

    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {

                        var permission={
                            'Course_id' : req.params.id ,
                            'Student_id' : rows2[0].Student_id
                        };

                        connection.query(" INSERT INTO PERMISSION SET ? ",permission,function(err1,row){
                            if(err1) {

                                console.log(err1);
                            }
                            else {
                                res.redirect('/student/courses');
                            }
                        });


                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }

});


router.get('/courses', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,student){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {

                        connection.query("select A.Course_id ,Course_Title,Course_Code from COURSE INNER JOIN (SELECT * FROM ENROLLED WHERE Student_id = ? )A ON COURSE.Course_id=A.Course_id ",student[0].Student_id ,function(err2,courses){
                            if(err2) {
                                console.log(err2);
                                res.redirect('/student');

                            }
                            else {
                                connection.query("select Course_id ,Course_Title,Course_Code from COURSE  WHERE  Course_id IN (SELECT Course_id FROM PERMISSION WHERE Student_id = ? ) ",student[0].Student_id ,function(err2,rcourses){
                                    if(err2) {
                                        console.log(err2);
                                        res.redirect('/student');

                                    }
                                    else {
                                        console.log(rcourses);

                                        res.render('student/mycourses',{'user':rows1[0], 'student': student,'courses':courses, 'requested': rcourses});
                                    }
                                });

                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});



router.get('/course-details/:id', function(req, res, next) {

    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,student){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {

                        connection.query(" SELECT * from ENROLLED WHERE Course_id= ? and Student_id= ? ",[req.params.id,student[0].Student_id],function(err3,enrolled){
                            if(err3) {

                                console.log(err1);
                                res.redirect('/student');
                            }
                            else {
                                if(enrolled.length === 0)
                                {
                                    res.redirect('/student/courses');
                                }else
                                {
                                    connection.query("select  * FROM COURSE where Course_id =?",req.params.id,function(err4,course){
                                        if(err4) {
                                            console.log(err4);
                                            res.redirect('/student');

                                        }
                                        else {

                                            connection.query("select  * FROM ANOUNCEMENT where Course_id =?",req.params.id,function(err5,announcements){
                                                if(err5) {
                                                    console.log(err5);
                                                    res.redirect('/student');

                                                }
                                                else {


                                                    res.render('student/mycourse',{'user':rows1[0], 'student': student,'course':course[0], 'announcements': announcements});
                                                }
                                            });

                                        }
                                    });

                                }
                            }
                        });


                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }

});


router.get('/course/join', function(req, res, next) {

    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {

                        connection.query(" SELECT * FROM COURSE WHERE Course_id NOT IN (SELECT Course_id FROM ENROLLED WHERE Student_id = ?) AND Course_id NOT IN (SELECT Course_id FROM PERMISSION WHERE Student_id = ?)",[rows2[0].Student_id, rows2[0].Student_id],function(err3,row3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/student/courses');
                            }
                            else {
                                console.log(row3);
                                res.render('student/search/courses',{'user':rows1[0], 'student': rows2[0], courses : row3});
                            }
                        });


                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }

});


router.get('/course/announcement/:id/:announcement_id', function(req, res, next) {

    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,student){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {

                        connection.query(" SELECT * from ENROLLED WHERE Course_id= ? and Student_id= ? ",[req.params.id,student[0].Student_id],function(err3,enrolled){
                            if(err3) {

                                console.log(err1);
                                res.redirect('/student');
                            }
                            else {
                                if(enrolled.length === 0)
                                {
                                    res.redirect('/student/courses');
                                }else
                                {
                                    connection.query("select  * FROM COURSE where Course_id =?",req.params.id,function(err4,course){
                                        if(err4) {
                                            console.log(err4);
                                            res.redirect('/student');

                                        }
                                        else {

                                            connection.query("select  * FROM ANOUNCEMENT where Course_id =?",req.params.id,function(err5,announcements){
                                                if(err5) {
                                                    console.log(err5);
                                                    res.redirect('/student');

                                                }
                                                else {

                                                    connection.query("select  * FROM ANOUNCEMENT where Anouncement_id =?",req.params.announcement_id,function(err5,announcement){
                                                        if(err5) {
                                                            console.log(err5);
                                                            res.redirect('/student');

                                                        }
                                                        else {


                                                            res.render('student/announcement',{'user':rows1[0], 'student': student,'course':course[0], 'announcements': announcements, 'announcement': announcement[0]});
                                                        }
                                                    });
                                                }
                                            });

                                        }
                                    });

                                }
                            }
                        });


                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }

});

router.get('/course/:course_id/resources/', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/student/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM ANOUNCEMENT WHERE Course_id = ? ORDER BY -Posted_on LIMIT 5",[req.params.course_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/student/courses/')

                                    }
                                    else {

                                        connection.query("SELECT * FROM COURSE_MATERIALS WHERE Course_id = ?",[req.params.course_id] ,function(err5,rows5){
                                            if(err5) {
                                                console.log(err5);
                                                res.redirect('/student/courses/')

                                            }
                                            else {
                                                console.log(rows5);
                                                res.render('student/resources',{'user':rows1[0], 'student': rows2[0], 'course': rows3[0], 'announcements': rows4, 'resources': rows5});
                                            }
                                        });
                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});


router.get('/course/:course_id/resources/:resource_id', function (req, res) {

    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/student/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM COURSE_MATERIALS WHERE Material_id = ?",[req.params.resource_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/student/courses/')

                                    }
                                    else {
                                        console.log(rows4[0].Material);
                                        res.sendFile(rows4[0].Material);

                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});



router.get('/course/:course_id/assignments/', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/student/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM ANOUNCEMENT WHERE Course_id = ? ORDER BY -Posted_on LIMIT 5",[req.params.course_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/student/courses/')

                                    }
                                    else {

                                        connection.query("SELECT * FROM ASSIGNMENT WHERE Course_id = ?",[req.params.course_id] ,function(err5,rows5){
                                            if(err5) {
                                                console.log(err5);
                                                res.redirect('/student/courses/')

                                            }
                                            else {

                                                console.log(rows5);
                                                res.render('student/assignment',{'user':rows1[0], 'student': rows2[0], 'course': rows3[0], 'announcements': rows4, 'assignments': rows5});
                                            }
                                        });
                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});



router.get('/course/:course_id/students', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Instructor'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/student/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM ANOUNCEMENT WHERE Course_id = ?   ORDER BY -Posted_on LIMIT 5",req.params.course_id ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/student/courses/')

                                    }
                                    else {

                                        connection.query("SELECT * FROM STUDENT WHERE Student_id IN (SELECT Student_id FROM ENROLLED WHERE Course_id = ?) ORDER BY Student_id",[req.params.course_id] ,function(err5,rows5){
                                            if(err5) {
                                                console.log(err4);
                                                res.redirect('/student/courses/')

                                            }
                                            else {

                                                connection.query("SELECT count(*) as total ,Student_id FROM (SELECT  * FROM  ATTENDENCE  WHERE Course_id = ? AND Attended = 1 ORDER BY Student_id )A GROUP BY Student_id ",[req.params.course_id] ,function(err5,rows6){
                                                    if(err5) {
                                                        console.log(err4);
                                                        res.redirect('/student/courses/')

                                                    }
                                                    else {
                                                        connection.query("SELECT COUNT(DISTINCT Date) as total_classes FROM ATTENDENCE  WHERE Course_id = ?",[req.params.course_id] ,function(err5,c) {
                                                            if (err5) {
                                                                console.log(err5);
                                                                res.redirect('/student/courses/')

                                                            }
                                                            else {



                                                                res.render('student/students', {
                                                                    'user': rows1[0],
                                                                    'student': rows2[0],
                                                                    'course': rows3[0],
                                                                    'announcements': rows4,
                                                                    'students': rows5,
                                                                    'attendence': rows6,
                                                                    'classes':c[0],
                                                                    messages: req.flash('info')
                                                                });
                                                            }
                                                        });

                                                    }
                                                });


                                            }
                                        });

                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});




router.get('/course/:course_id/assignments/:assignment_id', function (req, res) {

    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/student/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM ASSIGNMENT WHERE Assignment_id = ?",[req.params.assignment_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/student/courses/')

                                    }
                                    else {
                                        console.log(rows4[0]);
                                        res.sendFile(rows4[0].Assignment_File);

                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});


router.get('/course/:course_id/tests/', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/student/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM ANOUNCEMENT WHERE Course_id = ? ORDER BY -Posted_on LIMIT 5",[req.params.course_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/student/courses/')

                                    }
                                    else {

                                        connection.query("SELECT * FROM TESTS WHERE Course_id = ?",[req.params.course_id] ,function(err5,rows5){
                                            if(err5) {
                                                console.log(err5);
                                                res.redirect('/student/courses/')

                                            }
                                            else {

                                                connection.query("SELECT * FROM TEST_RESULTS WHERE Test_id IN (SELECT Test_id FROM TESTS WHERE Course_id = ?)",[req.params.course_id] ,function(err6,rows6){
                                                    if(err6) {
                                                        console.log(err6);
                                                        res.redirect('/student/courses/')

                                                    }
                                                    else {

                                                        connection.query("SELECT * FROM Exams WHERE Course_id = ?   ORDER BY Date",req.params.course_id ,function(err4,exams){
                                                            if(err4) {
                                                                console.log(err4);
                                                                res.redirect('/student/courses/')

                                                            }
                                                            else {

                                                                console.log("+++++++++++++++++++++++++++");

                                                                res.render('student/tests',{'user':rows1[0], 'student': rows2[0], 'course': rows3[0], 'announcements': rows4,'exams': exams , 'tests': rows5, 'results': rows6});


                                                            }
                                                        });

                                                    }
                                                });

                                            }
                                        });
                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});



router.get('/course/:course_id/tests/:test_id/question', function (req, res) {

    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/student/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM TESTS WHERE Test_id = ?",[req.params.test_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/student/courses/')

                                    }
                                    else {
                                        console.log(rows4[0].Question_Paper);
                                        res.sendFile(rows4[0].Question_Paper);

                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});


router.get('/course/:course_id/tests/:test_id/answer', function (req, res) {

    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/student/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM TESTS WHERE Test_id = ?",[req.params.test_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/student/courses/')

                                    }
                                    else {
                                        console.log(rows4[0].Answer_Key);
                                        res.sendFile(rows4[0].Answer_Key);

                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});



router.get('/course/:course_id/qa', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/student/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM ANOUNCEMENT WHERE Course_id = ? ",[req.params.course_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/student/courses/')

                                    }
                                    else {

                                        connection.query("SELECT * FROM Q_A WHERE Course_id = ? ORDER BY -Q_A_id",[req.params.course_id] ,function(err5,rows5){
                                            if(err5) {
                                                console.log(err5);
                                                res.redirect('/student/courses/')

                                            }
                                            else {


                                                connection.query("SELECT * FROM ANSWER WHERE Course_id = ? ORDER BY -Q_A_id",[req.params.course_id] ,function(err6,rows6){
                                                    if(err6) {
                                                        console.log(err6);
                                                        res.redirect('/student/courses/')

                                                    }
                                                    else {
                                                        connection.query("SELECT * FROM REPLY WHERE Course_id = ? ",[req.params.course_id] ,function(err6,reply){
                                                            if(err6) {
                                                                console.log(err6);
                                                                res.redirect('/student/courses/')

                                                            }
                                                            else {

                                                                console.log(rows6);
                                                                console.log(rows5);
                                                                console.log("................");
                                                                console.log(reply);
                                                                res.render('student/qa',{'user':rows1[0], 'instructor': rows2[0], 'course': rows3[0], 'announcements': rows4, 'q': rows5, 'a':rows6,  'r':reply });

                                                            }
                                                        });

                                                    }
                                                });





                                            }
                                        });



                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});


router.post('/course/:course_id/qa', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        var subject = req.body.subject;
                        var question = req.body.question;
                        var student = rows2[0].Student_id;
                        var name = rows2[0].First_Name + ' ' + rows2[0].Last_Name;
                        if(req.body.type){
                            student = null;
                            name = '';
                        }

                        var data = {
                            'Question': question,
                            'Subject': subject,
                            'Student_id': student,
                            'Instructor_id': null,
                            'Name': name,
                            'Course_id': req.params.course_id,
                        };

                        connection.query("INSERT INTO Q_A SET ?",data ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/student/courses/')

                            }
                            else {

                                console.log(rows3);
                                var url = '/student/course/' + req.params.course_id + '/qa';
                                res.redirect(url);

                            }
                        });
                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});




router.post('/course/:course_id/:question_id/', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        var answer = req.body.answer;
                        var student = rows2[0].Student_id;
                        var name = rows2[0].First_Name + ' ' + rows2[0].Last_Name;
                        if(req.body.type){
                            student = null;
                            name = '';
                        }

                        var data = {
                            'Answer': answer,
                            'Q_A_id': req.params.question_id,
                            'Instructor_id': null,
                            'Student_id': student,
                            'Course_id': req.params.course_id,
                            'Name': name,
                        };

                        connection.query("INSERT INTO ANSWER SET ?",data ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/student/courses/')

                            }
                            else {

                                console.log(rows3);
                                var url = '/student/course/' + req.params.course_id + '/qa';
                                res.redirect(url);

                            }
                        });
                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});


router.post('/course/:course_id/assignment/:assignment_id/submit', function (req, res) {
    console.log('bbbnvnb');
    upload1(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.log(err);
            return res.redirect('/student/')
        } else if (err) {
            // An unknown error occurred when uploading.
            console.log(err);
            return res.redirect('/student/')
        }

        // Everything went fine.
        if(req.user) {

            connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
                if(err1) {
                    console.log(err1);
                    res.redirect('/users/login')

                }
                else {
                    connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                        if(err2) {
                            console.log(err2);
                            res.redirect('/users/login')

                        }
                        else {


                            connection.query("SELECT * FROM SUBMISSION WHERE Assignment_id = ? AND Student_id = ?",[req.params.assignment_id, rows2[0].Student_id] ,function(err6,rows6){
                                if(err6) {
                                    console.log(err6);
                                    res.redirect('/student/courses/')

                                }
                                else {

                                    if(rows6.length === 0)
                                    {
                                        // Submission_id INT NOT NULL AUTO_INCREMENT,
                                        //     Submission_File TEXT,
                                        //     Course_id INT NOT NULL,
                                        //     Assignment_id INT NOT NULL,
                                        //     Instructor_id INT NOT NULL,
                                        //     Student_id INT NOT NULL,
                                        console.log(req.file);
                                        var data = {
                                            'Submission_File': path.join(__dirname, "../public/uploads/" + req.file.filename),
                                            'Course_id': req.params.course_id,
                                            'Assignment_id': req.params.assignment_id,
                                            'Student_id': rows2[0].Student_id
                                        };
                                        console.log(data);
                                        connection.query("INSERT INTO SUBMISSION SET ?",data ,function(err4,rows4){
                                            if(err4) {
                                                console.log(err4);
                                                res.redirect('/student/courses/')

                                            }
                                            else {
                                                console.log(rows4);
                                                var url = '/student/course/' + req.params.course_id + '/assignments/';
                                                res.redirect(url);
                                            }
                                        });
                                    }
                                    else
                                    {
                                        var Submission_File = rows6[0].Submission_File;

                                        if(req.file){
                                            Submission_File = path.join(__dirname, "../public/uploads/" + req.file.filename);;
                                        }

                                        connection.query("UPDATE SUBMISSION SET Submission_File = ? WHERE Assignment_id = ? AND Student_id = ?",[Submission_File, req.params.assignment_id, rows2[0].Student_id] ,function(err4,rows4){
                                            if(err4) {
                                                console.log(err4);
                                                res.redirect('/student/courses/')

                                            }
                                            else {
                                                console.log(rows4);
                                                var url = '/student/course/' + req.params.course_id + '/assignments/';
                                                res.redirect(url);
                                            }
                                        });
                                    }
                                }
                            });




                        }
                    });
                }
            });
        }
        else{
            return res.redirect('/users/login')
        }
    });
});


router.get('/course/:course_id/assignment/:assignment_id/submit', function (req, res) {
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/student/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM ANOUNCEMENT WHERE Course_id = ? ORDER BY -Posted_on LIMIT 5",[req.params.course_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/student/courses/')

                                    }
                                    else {

                                        connection.query("SELECT * FROM ASSIGNMENT WHERE Assignment_id = ?",[req.params.assignment_id] ,function(err5,rows5){
                                            if(err5) {
                                                console.log(err5);
                                                res.redirect('/student/courses/')

                                            }
                                            else {

                                                connection.query("SELECT * FROM SUBMISSION WHERE Assignment_id = ? AND Student_id = ?",[req.params.assignment_id, rows2[0].Student_id] ,function(err6,rows6){
                                                    if(err6) {
                                                        console.log(err6);
                                                        res.redirect('/student/courses/')

                                                    }
                                                    else {

                                                        console.log(rows6);
                                                        res.render('student/submit_assignment',{'user':rows1[0], 'student': rows2[0], 'course': rows3[0], 'announcements': rows4, 'assignment': rows5[0], 'submission': rows6[0]});
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});




router.get('/course/:course_id/assignment/:assignment_id/submission', function (req, res) {
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ?",req.user ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/student/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM ANOUNCEMENT WHERE Course_id = ? ORDER BY -Posted_on LIMIT 5",[req.params.course_id] ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/student/courses/')

                                    }
                                    else {

                                        connection.query("SELECT * FROM ASSIGNMENT WHERE Assignment_id = ?",[req.params.assignment_id] ,function(err5,rows5){
                                            if(err5) {
                                                console.log(err5);
                                                res.redirect('/student/courses/')

                                            }
                                            else {

                                                connection.query("SELECT * FROM SUBMISSION WHERE Assignment_id = ? AND Student_id = ?",[req.params.assignment_id, rows2[0].Student_id] ,function(err6,rows6){
                                                    if(err6) {
                                                        console.log(err6);
                                                        res.redirect('/student/courses/')

                                                    }
                                                    else {

                                                        console.log(rows6);
                                                        res.sendFile(rows6[0].Submission_File);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});



router.post('/course/:course_id/:question_id/:answer_id', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Student'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        var Reply = req.body.answer;
                        var student = rows2[0].Student_id;
                        var name = rows2[0].First_Name + ' ' + rows2[0].Last_Name;
                        if(req.body.type){
                            student = null;
                            name = '';
                        }

                        var data = {
                            'Reply': Reply,
                            'Q_A_id': req.params.question_id,
                            'Instructor_id': null,
                            'Student_id': student,
                            'Course_id': req.params.course_id,
                            'Name': name,
                            'Answer_id':req.params.answer_id
                        };

                        connection.query("INSERT INTO  REPLY SET ?",data ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/student/courses/')

                            }
                            else {

                                console.log(rows3);
                                var url = '/student/course/' + req.params.course_id + '/qa';
                                req.flash('info', 'New Reply Successfully Added to Q&A Section!');
                                res.redirect(url);

                            }
                        });
                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});



router.get('/course/:course_id/exams/', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Student'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/student/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM Exams WHERE Course_id = ?   ORDER BY Date",req.params.course_id ,function(err4,rows4){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/student/courses/')

                                    }
                                    else {

                                        console.log(rows4);
                                        console.log("+++++++++++++++++++++++++++");
                                        res.render('student/exams',{'user':rows1[0], 'student': rows2[0], 'course': rows3[0], 'exams': rows4,  messages: req.flash('info')});


                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});

///student/course/<%= course.Course_id%>/exams/<%= exams[i].Exam_id%>/start



router.post('/course/:course_id/exams/:exam_id/start', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Student'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/student/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM Exams WHERE Exam_id = ?   ",req.params.exam_id ,function(err4,exam){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/student/courses/')

                                    }
                                    else {

                                        connection.query("SELECT * FROM Questions WHERE Exam_id = ?   ",req.params.exam_id ,function(err4,questions){
                                            if(err4) {
                                                console.log(err4);
                                                res.redirect('/student/courses/')

                                            }
                                            else {


                                                connection.query("SELECT * FROM Exams WHERE Exam_id = ?   ",req.params.exam_id ,function(err4,s){
                                                    if(err4) {
                                                        console.log(err4);
                                                        res.redirect('/student/courses/')

                                                    }
                                                    else {

                                                        console.log(s[0]);
                                                        if((s[0].Secret).toString() === req.body.secret)
                                                          res.render('student/exam',{'user':rows1[0], 'student': rows2[0], 'course': rows3[0], 'exam': exam[0], 'questions':questions, messages: req.flash('info')});
                                                        else{
                                                            req.flash('info', 'Invalid Key');
                                                            var f = '/student/course/'+ rows3[0].Course_id+'/exams';
                                                            res.redirect(f)
                                                        }



                                                    }
                                                });



                                            }
                                        });



                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});

router.get('/course/:course_id/exams/:exam_id/result', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Student'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/student/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM Exams WHERE Exam_id = ?   ",req.params.exam_id ,function(err4,exam){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/student/courses/')

                                    }
                                    else {

                                        connection.query("SELECT * FROM (SELECT * FROM Questions WHERE Exam_id = ?  ORDER BY Question_id )A INNER JOIN (SELECT * FROM Exam_Submission WHERE Exam_id = ? and Student_id =?)B ON A.Question_id =B.Question_id ORDER BY A.Question_id",[req.params.exam_id,req.params.exam_id,rows2[0].Student_id] ,function(err4,result){
                                            if(err4) {
                                                console.log(err4);
                                                res.redirect('/student/courses/')

                                            }
                                            else {

                                                res.render('student/result',{'user':rows1[0], 'student': rows2[0], 'course': rows3[0],'exam':exam,'result':result ,  messages: req.flash('info')});

                                            }
                                        });



                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});

///student/course/submit/exam/<%= course.Course_id%>/<%= exam.Exam_id%>"


router.post('/course/submit/exam/:course_id/:exam_id/', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Student'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/student/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM Exams WHERE Exam_id = ?   ",req.params.exam_id ,function(err4,exam){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/student/courses/')

                                    }
                                    else {

                                        connection.query("SELECT * FROM Questions WHERE Exam_id = ?  ORDER BY Question_id ",req.params.exam_id ,function(err4,questions){
                                            if(err4) {
                                                console.log(err4);
                                                res.redirect('/student/courses/')

                                            }
                                            else {  var ans=req.body.ans;
                                                for (var i=0 ;i< ans.length;i++) {
                                                    var mark = 0;
                                                    if (questions[i].Correct_Option == ans[i]) {
                                                        mark = 1;
                                                    }

                                                    var obj = {


                                                        'Question_id': questions[i].Question_id,

                                                        'Answer_id': ans[i],
                                                        'Mark': mark,
                                                        'Exam_id': req.params.exam_id,
                                                        'Course_id': req.params.course_id,
                                                        'Student_id': rows2[0].Student_id
                                                    }
                                                    connection.query("INSERT INTO Exam_Submission SET ?   ", obj, function (err4, ressult) {
                                                        if (err4) {
                                                            console.log(err4);
                                                            res.redirect('/student/courses/')

                                                        }
                                                        else {

                                                            console.log(ressult);


                                                        }
                                                    });
                                                }
                                                var url = '/student/course/' + req.params.course_id + '/exams/'+req.params.exam_id+'/result';
                                                req.flash('info', 'New Exam Successfully Added to Q&A Section!');
                                                res.redirect(url);


                                            }
                                        });



                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});



//var url = '/student/course/' + req.params.course_id + '/exams/'+req.params.exam_id+'/result';
//http://localhost:3000/student/course/1/exams/16/result


router.get('/course/:course_id/exams/:exam_id/enter', function(req, res){
    if(req.user) {

        connection.query("SELECT * FROM USER WHERE id = ? AND Role = ?",[req.user, 'Student'] ,function(err1,rows1){
            if(err1) {
                console.log(err1);
                res.redirect('/users/login')

            }
            else {
                connection.query("SELECT * FROM STUDENT WHERE User_id = ?  ",req.user ,function(err2,rows2){
                    if(err2) {
                        console.log(err2);
                        res.redirect('/users/login')

                    }
                    else {
                        connection.query("SELECT * FROM COURSE WHERE Course_id = ?  ",req.params.course_id ,function(err3,rows3){
                            if(err3) {
                                console.log(err3);
                                res.redirect('/student/courses/')

                            }
                            else {

                                connection.query("SELECT * FROM Exams WHERE Exam_id = ?   ",req.params.exam_id ,function(err4,exam){
                                    if(err4) {
                                        console.log(err4);
                                        res.redirect('/student/courses/')

                                    }
                                    else {


                                        connection.query("SELECT * FROM (SELECT * FROM Questions WHERE Exam_id = ?  ORDER BY Question_id )A INNER JOIN (SELECT * FROM Exam_Submission WHERE Exam_id = ? and Student_id =?)B ON A.Question_id =B.Question_id ORDER BY A.Question_id",[req.params.exam_id,req.params.exam_id,rows2[0].Student_id] ,function(err4,result){
                                            if(err4) {
                                                console.log(err4);
                                                res.redirect('/student/courses/')

                                            }
                                            else {
                                                 if(result.length>0)
                                                 {

                                                     var url='/student/course/'+req.params.course_id+'/exams/'+req.params.exam_id+'/result';
                                                     res.redirect(url);
                                                 }
                                                 else
                                                 {

                                                     res.render('student/enter_exam',{'user':rows1[0], 'student': rows2[0], 'course': rows3[0],'exam':exam[0] ,  messages: req.flash('info')});

                                                 }

                                            }
                                        });




                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }
    else{
        return res.redirect('/users/login')
    }
});


module.exports = router;